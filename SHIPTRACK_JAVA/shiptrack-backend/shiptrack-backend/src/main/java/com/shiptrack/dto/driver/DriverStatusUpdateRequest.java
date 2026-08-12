package com.shiptrack.dto.driver;

import com.shiptrack.entity.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverStatusUpdateRequest {

    private ShipmentStatus status;

    private String failureReason;
}
