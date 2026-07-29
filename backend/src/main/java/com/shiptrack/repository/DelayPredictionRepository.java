package com.shiptrack.repository;

import com.shiptrack.entity.DelayPrediction;
import com.shiptrack.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DelayPredictionRepository extends JpaRepository<DelayPrediction, Long> {
    Optional<DelayPrediction> findTopByShipmentAndIsActiveTrueOrderByDetectedAtDesc(Shipment shipment);
    List<DelayPrediction> findByShipmentAndIsActiveTrue(Shipment shipment);
    void deleteByShipmentId(Long shipmentId);
}
