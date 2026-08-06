package com.shiptrack.support_agent.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.shiptrack.customer.support.entity.IssueType;
import com.shiptrack.customer.support.entity.RequestStatus;
import com.shiptrack.customer.support.entity.RequestType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportRequestResponseDto {

    private Long id;

    private RequestType requestType;

    private RequestStatus status;

    private String customerName;

    private String trackingId;

    private String senderName;

    private String receiverName;

    private String pickupAddress;

    private String deliveryAddress;

    private String packageType;

    private BigDecimal weight;

    private LocalDate pickupDate;

    private String specialInstructions;

    private IssueType issueType;

    private String subject;

    private String description;

    private String attachment;

    private String assignedTo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}