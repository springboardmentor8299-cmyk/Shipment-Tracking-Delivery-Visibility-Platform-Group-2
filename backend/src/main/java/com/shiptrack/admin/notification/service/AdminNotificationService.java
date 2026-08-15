package com.shiptrack.admin.notification.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.shiptrack.activity.service.ActivityService;
import com.shiptrack.admin.notification.dto.BroadcastNotificationRequest;
import com.shiptrack.admin.notification.dto.BroadcastNotificationResponse;
import com.shiptrack.admin.notification.dto.NotificationRecipientOptionsResponse;
import com.shiptrack.admin.notification.dto.NotificationRecipientOptionsResponse.CustomerOption;
import com.shiptrack.admin.notification.dto.NotificationRecipientOptionsResponse.UserOption;
import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.auth.entity.Role;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.notification.entity.NotificationType;
import com.shiptrack.notification.service.NotificationService;

// Lets an admin manually push a notification either to every user in one
// or more roles, or to specific individuals picked from the recipient
// list (a customer's tracking ID, a named support agent, etc). Admins
// aren't a valid target: this is a one-way broadcast tool from the admin,
// not a way to message other admins.
@Service
public class AdminNotificationService {

    private static final Set<Role> ALLOWED_TARGET_ROLES = EnumSet.of(
            Role.CUSTOMER,
            Role.BUSINESS_CLIENT,
            Role.LOGISTICS_OPERATOR,
            Role.SUPPORT_AGENT,
            Role.DRIVER);

    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final NotificationService notificationService;
    private final ActivityService activityService;

    public AdminNotificationService(
            UserRepository userRepository,
            ShipmentRepository shipmentRepository,
            NotificationService notificationService,
            ActivityService activityService) {
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.notificationService = notificationService;
        this.activityService = activityService;
    }

    // Feeds the recipient pickers in the UI — one list per targetable role.
    public NotificationRecipientOptionsResponse getRecipientOptions() {

        List<CustomerOption> customers = shipmentRepository.findAll().stream()
                .filter(s -> s.getCustomerId() != null)
                .sorted(Comparator.comparing(Shipment::getTrackingId))
                .map(s -> CustomerOption.builder()
                        .trackingId(s.getTrackingId())
                        .customerId(s.getCustomerId().getId())
                        .customerName(s.getCustomerName())
                        .build())
                .toList();

        return NotificationRecipientOptionsResponse.builder()
                .customers(customers)
                .businessClients(userOptions(Role.BUSINESS_CLIENT))
                .logisticsOperators(userOptions(Role.LOGISTICS_OPERATOR))
                .supportAgents(userOptions(Role.SUPPORT_AGENT))
                .drivers(userOptions(Role.DRIVER))
                .build();
    }

    public BroadcastNotificationResponse broadcast(BroadcastNotificationRequest request, String sentBy) {

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "message is required");
        }

        List<String> rawRoles = request.getRoles() == null ? List.of() : request.getRoles();
        List<Long> rawUserIds = request.getUserIds() == null ? List.of() : request.getUserIds();

        if (rawRoles.isEmpty() && rawUserIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Select at least one recipient group or specific recipient");
        }

        List<Role> roles = parseRoles(rawRoles);
        NotificationType type = parseType(request.getType());

        // Keyed by user id so a person matched both by role and by an
        // explicit pick (or picked twice) only gets notified once.
        Map<Long, User> recipients = new LinkedHashMap<>();

        for (Role role : roles) {
            for (User user : userRepository.findByRole(role)) {
                recipients.put(user.getId(), user);
            }
        }

        if (!rawUserIds.isEmpty()) {
            for (User user : userRepository.findAllById(rawUserIds)) {
                if (!ALLOWED_TARGET_ROLES.contains(user.getRole())) {
                    continue; // silently skip anything that isn't a valid target (e.g. stray admin id)
                }
                recipients.put(user.getId(), user);
            }
        }

        if (recipients.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No matching recipients were found for this selection");
        }

        int notified = 0;
        for (User recipient : recipients.values()) {
            var saved = notificationService.notify(
                    recipient,
                    type,
                    request.getTitle().trim(),
                    request.getMessage().trim(),
                    request.getTrackingId());
            if (saved != null) {
                notified++;
            }
        }

        List<String> targetedRoles = roles.stream().map(Enum::name).toList();

        try {
            String scope = targetedRoles.isEmpty()
                    ? recipients.size() + " specific recipient(s)"
                    : String.join(", ", targetedRoles)
                            + (rawUserIds.isEmpty() ? "" : " + specific recipients");
            activityService.save(sentBy, "NOTIFICATION_BROADCAST",
                    "Sent \"" + request.getTitle().trim() + "\" to " + notified + " user(s) — " + scope);
        } catch (Exception ignored) {
        }

        return BroadcastNotificationResponse.builder()
                .targetedRoles(targetedRoles)
                .matchedUserCount(recipients.size())
                .notifiedUserCount(notified)
                .build();
    }

    private List<UserOption> userOptions(Role role) {
        return userRepository.findByRole(role).stream()
                .sorted(Comparator.comparing(u -> u.getName() != null ? u.getName() : u.getUsername()))
                .map(u -> UserOption.builder()
                        .userId(u.getId())
                        .name(u.getName())
                        .username(u.getUsername())
                        .build())
                .toList();
    }

    private List<Role> parseRoles(List<String> rawRoles) {
        List<Role> roles = new ArrayList<>();
        for (String raw : rawRoles) {
            Role role;
            try {
                role = Role.valueOf(raw.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role: " + raw);
            }
            if (!ALLOWED_TARGET_ROLES.contains(role)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        role.name() + " can't be targeted by a broadcast");
            }
            if (!roles.contains(role)) {
                roles.add(role);
            }
        }
        return roles;
    }

    private NotificationType parseType(String raw) {
        if (raw == null || raw.isBlank()) {
            return NotificationType.SYSTEM;
        }
        try {
            return NotificationType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown notification type: " + raw);
        }
    }

}