package com.shiptrack.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerNotificationResponse {

    private Long notificationId;

    private String title;

    private String message;

    private boolean isRead;

    private LocalDateTime createdAt;
}