package com.shiptrack.dto.support;

import com.shiptrack.entity.NotificationType;

import jakarta.validation.constraints.NotBlank;

public class BroadcastNotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private NotificationType type = NotificationType.WARNING;

    private String role = "ROLE_SUPPORT";

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
