package com.shiptrack.dto;

import com.shiptrack.entity.NotificationType;

import java.time.LocalDateTime;

public class NotificationDTO {

    private Long id;

    private String title;

    private String message;

    private NotificationType type;

    private boolean isRead;

    private LocalDateTime createdAt;

    private String senderName;

    public NotificationDTO() {
    }

    public NotificationDTO(Long id,
                           String title,
                           String message,
                           NotificationType type,
                           boolean isRead,
                           LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public NotificationDTO(Long id,
                           String title,
                           String message,
                           NotificationType type,
                           boolean isRead,
                           LocalDateTime createdAt,
                           String senderName) {

        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.senderName = senderName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

}