package com.shiptrack.notification.dto;

import java.time.LocalDateTime;

import com.shiptrack.notification.entity.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Field names line up 1:1 with what NotificationList.jsx / NotificationBell.jsx
// read off each item: id, type, title, message, trackingId, read, createdAt.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String trackingId;
    private boolean read;
    private LocalDateTime createdAt;
}
