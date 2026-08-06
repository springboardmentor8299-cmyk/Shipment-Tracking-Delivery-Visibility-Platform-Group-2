package com.shiptrack.customer.support.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.shiptrack.customer.support.entity.IssueType;
import com.shiptrack.customer.support.entity.RequestStatus;
import com.shiptrack.customer.support.entity.RequestType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

import com.shiptrack.customer.support.entity.CustomerSupportRequest;
import com.shiptrack.customer.support.dto.CustomerSupportResponseDto;

@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSupportResponseDto {

    private Long id;

    private RequestType requestType;

    private RequestStatus status;

    private String shipmentId;

    private IssueType issueType;

    private String subject;

    private String description;

    private String senderName;

    private String receiverName;

    private String pickupAddress;

    private String deliveryAddress;

    private String packageType;

    private BigDecimal weight;

    private LocalDate pickupDate;

    private String specialInstructions;

    private String attachment;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}