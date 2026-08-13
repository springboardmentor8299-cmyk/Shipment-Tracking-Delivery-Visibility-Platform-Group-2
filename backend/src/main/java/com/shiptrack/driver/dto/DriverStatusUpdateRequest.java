package com.shiptrack.driver.dto;

import com.shiptrack.driver.entity.DriverStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriverStatusUpdateRequest {

    private DriverStatus status;

}