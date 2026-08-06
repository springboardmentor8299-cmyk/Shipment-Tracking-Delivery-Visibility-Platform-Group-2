package com.shiptrack.admin.route.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoutePlanRequest {

    private String routeName;

    private String origin;

    private String destination;

    private String assignedTrackingId;

    private String notes;

}
