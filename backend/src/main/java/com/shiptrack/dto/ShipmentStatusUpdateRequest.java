package com.shiptrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShipmentStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    // Optional location that accompanies the status change
    private Double latitude;

    private Double longitude;
}
