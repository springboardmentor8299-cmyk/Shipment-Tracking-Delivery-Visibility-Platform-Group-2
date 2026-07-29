package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportQueryResponse {

    private Long id;
    private String subject;
    private String message;
    private String status;
    private String response;
    private String trackingNumber;
    private String customerName;
    private String customerEmail;
    private String respondedByName;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}