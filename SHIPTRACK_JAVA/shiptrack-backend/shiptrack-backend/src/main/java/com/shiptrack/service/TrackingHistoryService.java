package com.shiptrack.service;

import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingHistory;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrackingHistoryService {

    private final TrackingHistoryRepository trackingHistoryRepository;
    private final ShipmentRepository shipmentRepository;

    public TrackingHistoryService(
            TrackingHistoryRepository trackingHistoryRepository,
            ShipmentRepository shipmentRepository) {

        this.trackingHistoryRepository = trackingHistoryRepository;
        this.shipmentRepository = shipmentRepository;
    }

    public TrackingHistory addTrackingHistory(
            Long shipmentId,
            TrackingHistory trackingHistory) {

        Shipment shipment = shipmentRepository
                .findById(shipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found"));

        trackingHistory.setShipment(shipment);

        
        shipment.setShipmentStatus(trackingHistory.getStatus());

        shipmentRepository.save(shipment);

        return trackingHistoryRepository.save(trackingHistory);
    }

    public List<TrackingHistory> getTrackingHistory(
            Long shipmentId) {

        return trackingHistoryRepository
                .findByShipmentId(shipmentId);
    }
}