package com.shiptrack.dto.customer;

import com.shiptrack.entity.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerShipmentResponse {

    private Long shipmentId;

    private String trackingNumber;

    private String senderName;

    private String receiverName;

    private String receiverAddress;

    private Double packageWeight;

    private ShipmentStatus shipmentStatus;

    private LocalDateTime createdAt;

    private LocalDateTime deliveryTime;

    private String deliveryReceiverName;

    private String deliveryRemarks;

    private String deliveryDriverName;

    private String deliverySignature;
}
