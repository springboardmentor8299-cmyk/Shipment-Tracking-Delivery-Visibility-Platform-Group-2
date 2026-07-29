package com.shiptrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrackingEventRequest {

    private Double latitude;

    private Double longitude;

    @NotBlank(message = "Status is required")
    private String status;
}
