package com.shiptrack.admin.route.dto;

import com.shiptrack.admin.route.entity.RouteStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteStatusUpdateRequest {

    private RouteStatus status;

}
