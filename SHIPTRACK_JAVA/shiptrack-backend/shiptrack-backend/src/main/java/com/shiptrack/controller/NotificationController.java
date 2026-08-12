package com.shiptrack.controller;

import com.shiptrack.dto.NotificationDTO;
import com.shiptrack.dto.support.BroadcastNotificationRequest;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.User;
import com.shiptrack.service.NotificationService;
import com.shiptrack.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(
            NotificationService notificationService,
            UserService userService) {

        this.notificationService = notificationService;
        this.userService = userService;
    }

    


    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications() {

        return ResponseEntity.ok(
                notificationService.getNotifications());
    }

    


    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {

        return ResponseEntity.ok(
                notificationService.getUnreadCount());
    }

    


    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService.markAsRead(id));
    }

    


    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead() {

        notificationService.markAllAsRead();

        return ResponseEntity.ok(
                "All notifications marked as read.");
    }

    


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
                "Notification deleted successfully.");
    }

    


    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam NotificationType type,
            @RequestParam String email) {

        User user = userService.findByEmail(email);

        NotificationDTO notification = notificationService.createNotification(
                title,
                message,
                type,
                user);

        return ResponseEntity.ok(notification);
    }

    



    @PostMapping("/send")
    public ResponseEntity<String> sendToRole(
            @RequestBody BroadcastNotificationRequest request) {

        String result = notificationService.sendToRole(
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                request.getRole());

        return ResponseEntity.ok(result);
    }

}