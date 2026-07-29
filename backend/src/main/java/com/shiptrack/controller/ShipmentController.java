package com.shiptrack.controller;

import com.shiptrack.dto.*;
import com.shiptrack.service.DelayPredictionService;
import com.shiptrack.service.EtaService;
import com.shiptrack.service.ForecastService;
import com.shiptrack.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final EtaService etaService;
    private final ForecastService forecastService;
    private final DelayPredictionService delayPredictionService;

    @PostMapping
    public ResponseEntity<ShipmentResponse> createShipment(
            @Valid @RequestBody ShipmentRequest request,
            Authentication authentication) {
        ShipmentResponse response = shipmentService.createShipment(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ShipmentResponse>> getMyShipments(Authentication authentication) {
        return ResponseEntity.ok(shipmentService.getMyShipments(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAllShipments(Authentication authentication) {
        return ResponseEntity.ok(shipmentService.getAllShipments(authentication.getName()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ShipmentStatsResponse> getStats(Authentication authentication) {
        return ResponseEntity.ok(shipmentService.getStats(authentication.getName()));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentResponse> trackShipment(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getByTrackingNumber(trackingNumber));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipment(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(shipmentService.getById(id, authentication.getName()));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<ShipmentDetailResponse> getShipmentDetail(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(shipmentService.getShipmentDetail(id, authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentStatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(shipmentService.updateStatus(id, request, authentication.getName()));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<TrackingEventResponse> addTrackingEvent(
            @PathVariable Long id,
            @Valid @RequestBody TrackingEventRequest request,
            Authentication authentication) {
        TrackingEventResponse response = shipmentService.addTrackingEvent(id, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<TrackingEventResponse>> getTrackingEvents(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getTrackingEvents(id));
    }

    @GetMapping("/{id}/eta")
    public ResponseEntity<EtaResponse> getEta(@PathVariable Long id) {
        EtaResponse eta = etaService.calculateEta(id);
        if (eta == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(eta);
    }

    @GetMapping("/{id}/forecast")
    public ResponseEntity<ForecastResponse> getForecast(@PathVariable Long id) {
        ForecastResponse forecast = forecastService.generateForecast(id);
        if (forecast == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(forecast);
    }

    @GetMapping("/{id}/delay-status")
    public ResponseEntity<DelayStatusResponse> getDelayStatus(@PathVariable Long id) {
        DelayStatusResponse status = delayPredictionService.getDelayStatus(id);
        if (status == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(status);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ShipmentResponse> updateShipment(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(shipmentService.updateShipment(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipment(
            @PathVariable Long id,
            Authentication authentication) {
        shipmentService.deleteShipment(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}