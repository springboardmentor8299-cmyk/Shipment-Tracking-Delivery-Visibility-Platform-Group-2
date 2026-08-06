package com.shiptrack.admin.route.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteOptimizeRequest {

    // "SHORTEST", "BALANCED", or "FEWER_TURNS" — defaults to SHORTEST when omitted
    private String strategy;

}
