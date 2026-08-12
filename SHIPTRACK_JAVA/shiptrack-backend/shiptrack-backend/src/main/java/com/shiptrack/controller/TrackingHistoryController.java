package com.shiptrack.controller;

import com.shiptrack.entity.TrackingHistory;
import com.shiptrack.service.TrackingHistoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
public class TrackingHistoryController {

    private final TrackingHistoryService trackingHistoryService;

    public TrackingHistoryController(
            TrackingHistoryService trackingHistoryService) {

        this.trackingHistoryService =
                trackingHistoryService;
    }

    @PostMapping("/{shipmentId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','OPERATOR')"
    )
    public TrackingHistory addTrackingHistory(
            @PathVariable Long shipmentId,
            @RequestBody TrackingHistory trackingHistory) {

        return trackingHistoryService
                .addTrackingHistory(
                        shipmentId,
                        trackingHistory);
    }

    @GetMapping("/{shipmentId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','OPERATOR','BUSINESS','CUSTOMER','SUPPORT')"
    )
    public List<TrackingHistory> getTrackingHistory(
            @PathVariable Long shipmentId) {

        return trackingHistoryService
                .getTrackingHistory(
                        shipmentId);
    }
}