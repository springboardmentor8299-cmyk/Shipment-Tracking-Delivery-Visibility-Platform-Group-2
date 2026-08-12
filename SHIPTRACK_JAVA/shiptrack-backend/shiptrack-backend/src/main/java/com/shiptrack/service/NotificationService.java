package com.shiptrack.service;

import com.shiptrack.dto.NotificationDTO;
import com.shiptrack.entity.Notification;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.User;
import com.shiptrack.exception.NotificationNotFoundException;
import com.shiptrack.repository.NotificationRepository;
import com.shiptrack.repository.RoleRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserService userService,
            RoleRepository roleRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    


    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof UserDetails)) {

            throw new RuntimeException("User is not authenticated.");
        }

        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        return userService.findByEmail(
                userDetails.getUsername());
    }

    


    private NotificationDTO convertToDTO(
            Notification notification) {

        return new NotificationDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getSenderName()
        );
    }

    


    public List<NotificationDTO> getNotifications() {

        User user = getCurrentUser();

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    


    public long getUnreadCount() {

        User user = getCurrentUser();

        return notificationRepository
                .countByUserAndIsReadFalse(user);
    }

    


    public void notifyUsersByRole(
            String title,
            String message,
            NotificationType type,
            String roleName) {

        notifyUsersByRole(title, message, type, roleName, null);
    }

    



    public int notifyUsersByRole(
            String title,
            String message,
            NotificationType type,
            String roleName,
            String senderName) {

        List<User> users = roleRepository.findByName(roleName)
                .map(userRepository::findByRole)
                .orElseGet(List::of);

        for (User user : users) {
            Notification notification = new Notification(
                    title,
                    message,
                    type,
                    user);
            notification.setSenderName(senderName);
            notificationRepository.save(notification);
        }

        return users.size();
    }

    


    public NotificationDTO createNotification(
            String title,
            String message,
            NotificationType type,
            User user) {

        return createNotification(title, message, type, user, null);
    }

    


    public NotificationDTO createNotification(
            String title,
            String message,
            NotificationType type,
            User user,
            String senderName) {

        Notification notification = new Notification();

        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setUser(user);
        notification.setRead(false);
        notification.setCreatedAt(java.time.LocalDateTime.now());
        notification.setSenderName(senderName);

        Notification savedNotification =
                notificationRepository.save(notification);

        return convertToDTO(savedNotification);
    }

    




    public String sendToRole(
            String title,
            String message,
            NotificationType type,
            String roleName) {

        if (roleName == null || roleName.isBlank()) {
            throw new RuntimeException("Target role is required.");
        }

        User sender = getCurrentUser();
        String senderRole = sender.getRole().getName();
        String senderName = sender.getFullName();

        boolean allowed;
        switch (senderRole) {
            case "ROLE_ADMIN" -> allowed = true;
            case "ROLE_SUPPORT" -> allowed = List.of(
                    "ROLE_DRIVER", "ROLE_SUPPORT", "ROLE_ADMIN", "ROLE_CUSTOMER")
                    .contains(roleName);
            case "ROLE_DRIVER" -> allowed = List.of(
                    "ROLE_SUPPORT", "ROLE_ADMIN")
                    .contains(roleName);
            default -> allowed = false;
        }

        if (!allowed) {
            throw new RuntimeException(
                    "You are not allowed to send notifications to role " + roleName + ".");
        }

        int count = notifyUsersByRole(title, message, type, roleName, senderName);

        return "Notification sent to " + count + " " + roleName + " user(s).";
    }

    


    public NotificationDTO markAsRead(Long notificationId) {

        User user = getCurrentUser();

        Notification notification = notificationRepository
                .findByIdAndUser(notificationId, user)
                .orElseThrow(() ->
                        new NotificationNotFoundException(
                                "Notification not found."));

        notification.setRead(true);

        Notification updatedNotification =
                notificationRepository.save(notification);

        return convertToDTO(updatedNotification);
    }

    


    public void markAllAsRead() {

        User user = getCurrentUser();

        java.util.List<Notification> notifications =
                notificationRepository
                        .findByUserAndIsReadFalse(user);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);
    }

    


    public void deleteNotification(Long notificationId) {

        User user = getCurrentUser();

        Notification notification = notificationRepository
                .findByIdAndUser(notificationId, user)
                .orElseThrow(() ->
                        new NotificationNotFoundException(
                                "Notification not found."));

        notificationRepository.delete(notification);
    }

}