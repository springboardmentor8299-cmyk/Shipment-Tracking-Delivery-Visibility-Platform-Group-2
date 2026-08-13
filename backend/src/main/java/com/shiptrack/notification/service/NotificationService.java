package com.shiptrack.notification.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.auth.service.EmailService;
import com.shiptrack.notification.dto.NotificationPreferenceRequest;
import com.shiptrack.notification.dto.NotificationPreferenceResponse;
import com.shiptrack.notification.dto.NotificationResponse;
import com.shiptrack.notification.entity.Notification;
import com.shiptrack.notification.entity.NotificationPreference;
import com.shiptrack.notification.entity.NotificationType;
import com.shiptrack.notification.repository.NotificationPreferenceRepository;
import com.shiptrack.notification.repository.NotificationRepository;
import com.shiptrack.notification.service.SmsService;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            UserRepository userRepository,
            EmailService emailService,
            SmsService smsService) {

        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.smsService = smsService;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String username) {

        User user = getUserOrThrow(username);

        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(String username, Long notificationId) {

        User user = getUserOrThrow(username);

        Notification notification = notificationRepository
                .findByIdAndUser_Id(notificationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    @Transactional
    public void markAllAsRead(String username) {

        User user = getUserOrThrow(username);

        notificationRepository.markAllReadForUser(user.getId());
    }

    @Transactional
    public void deleteNotification(String username, Long notificationId) {

        User user = getUserOrThrow(username);

        // Confirms ownership before deleting so a user can't delete
        // (or probe the existence of) another user's notification by id.
        notificationRepository.findByIdAndUser_Id(notificationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notificationRepository.deleteByIdAndUser_Id(notificationId, user.getId());
    }

    @Transactional
    public NotificationPreferenceResponse getPreferences(String username) {

        User user = getUserOrThrow(username);

        NotificationPreference prefs = preferenceRepository.findByUser_Id(user.getId())
                .orElseGet(() -> preferenceRepository.save(
                        NotificationPreference.builder().user(user).build()));

        return toResponse(prefs);
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(
            String username,
            NotificationPreferenceRequest request) {

        User user = getUserOrThrow(username);

        NotificationPreference prefs = preferenceRepository.findByUser_Id(user.getId())
                .orElseGet(() -> NotificationPreference.builder().user(user).build());

        prefs.setEmailEnabled(request.isEmailEnabled());
        prefs.setSmsEnabled(request.isSmsEnabled());
        prefs.setPushEnabled(request.isPushEnabled());

        prefs.setShipmentUpdates(request.isShipmentUpdates());
        prefs.setEtaUpdates(request.isEtaUpdates());
        prefs.setDeliveryAlerts(request.isDeliveryAlerts());
        prefs.setDelayWarnings(request.isDelayWarnings());

        return toResponse(preferenceRepository.save(prefs));
    }

    @Transactional
    public Notification notify(
            User recipient,
            NotificationType type,
            String title,
            String message,
            String trackingId) {

        if (recipient == null) {
            return null;
        }

        NotificationPreference prefs = preferenceRepository.findByUser_Id(recipient.getId())
                .orElseGet(() -> preferenceRepository.save(
                        NotificationPreference.builder().user(recipient).build()));

        if (!isCategoryEnabled(prefs, type)) {
            return null;
        }

        Notification notification = Notification.builder()
                .user(recipient)
                .type(type)
                .title(title)
                .message(message)
                .trackingId(trackingId)
                .build();

        notification = notificationRepository.save(notification);

        dispatchToChannels(recipient, prefs, title, message);

        return notification;
    }

    @Transactional
    public Notification notify(
            String recipientUsername,
            NotificationType type,
            String title,
            String message,
            String trackingId) {

        return userRepository.findByUsername(recipientUsername)
                .map(user -> notify(user, type, title, message, trackingId))
                .orElse(null);
    }

    private boolean isCategoryEnabled(NotificationPreference prefs, NotificationType type) {

        return switch (type) {
            case SHIPMENT_UPDATE -> prefs.isShipmentUpdates();
            case ETA_UPDATE -> prefs.isEtaUpdates();
            case DELIVERY_ALERT -> prefs.isDeliveryAlerts();
            case DELAY_WARNING -> prefs.isDelayWarnings();
            case SYSTEM -> true; // system notices are never suppressed
        };
    }

    private void dispatchToChannels(
            User recipient,
            NotificationPreference prefs,
            String title,
            String message) {

        if (prefs.isEmailEnabled() && recipient.getUsername() != null) {
            try {
                emailService.sendNotificationEmail(recipient.getUsername(), title, message);
            } catch (Exception ignored) {
            }
        }

        if (prefs.isSmsEnabled() && recipient.getPhoneNumber() != null) {
            try {
                smsService.sendSms(recipient.getPhoneNumber(), title + ": " + message);
            } catch (Exception ignored) {
            }
        }

    }

    private User getUserOrThrow(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private NotificationResponse toResponse(Notification n) {

        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .trackingId(n.getTrackingId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private NotificationPreferenceResponse toResponse(NotificationPreference p) {

        return NotificationPreferenceResponse.builder()
                .emailEnabled(p.isEmailEnabled())
                .smsEnabled(p.isSmsEnabled())
                .pushEnabled(p.isPushEnabled())
                .shipmentUpdates(p.isShipmentUpdates())
                .etaUpdates(p.isEtaUpdates())
                .deliveryAlerts(p.isDeliveryAlerts())
                .delayWarnings(p.isDelayWarnings())
                .build();
    }
}
