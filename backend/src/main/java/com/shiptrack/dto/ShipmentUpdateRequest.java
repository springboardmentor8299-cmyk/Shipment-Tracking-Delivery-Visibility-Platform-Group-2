package com.shiptrack.dto;

import lombok.Data;

@Data
public class ShipmentUpdateRequest {

    private String senderName;

    private String senderAddress;

    private String receiverName;

    private String deliveryAddress;
}
