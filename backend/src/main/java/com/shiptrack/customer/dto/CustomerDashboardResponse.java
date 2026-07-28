package com.shiptrack.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDashboardResponse {

    private String username;

    private int totalShipments;

    private int active;

    private int delivered;

    private int pending;

}