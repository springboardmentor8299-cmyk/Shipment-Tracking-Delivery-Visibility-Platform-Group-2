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
public class CustomerSupportResponse {

    private Long supportRequestId;

    private String subject;

    private String message;

    private String responseMessage;

    private String trackingNumber;

    private String status;

    private LocalDateTime createdAt;
}
