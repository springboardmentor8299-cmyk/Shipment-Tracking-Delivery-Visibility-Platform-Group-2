package com.shiptrack.customer.support.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class ShipmentRequestDto {

    private String senderName;

    private String receiverName;

    private String pickupAddress;

    private String deliveryAddress;

    private String packageType;

    private BigDecimal weight;

    private LocalDate pickupDate;

    private String instructions;

}