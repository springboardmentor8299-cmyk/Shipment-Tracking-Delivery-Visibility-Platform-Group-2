package com.shiptrackpro.websocket;

import com.shiptrackpro.dto.ShipmentDTO;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class LiveTrackingWebSocketController {

    @MessageMapping("/track/{shipmentId}")
    @SendTo("/topic/tracking/{shipmentId}")
    public ShipmentDTO.TelemetryUpdateRequest broadcastTelemetry(
            @DestinationVariable String shipmentId,
            ShipmentDTO.TelemetryUpdateRequest telemetry) {
        return telemetry;
    }

    @MessageMapping("/dispatch/alert")
    @SendTo("/topic/dispatches")
    public Object broadcastDispatchAlert(Object alert) {
        return alert;
    }
}
