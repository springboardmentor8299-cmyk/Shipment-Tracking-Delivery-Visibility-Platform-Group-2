package com.shiptrack.repository;

import com.shiptrack.entity.DeliveryPrediction;
import com.shiptrack.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryPredictionRepository extends JpaRepository<DeliveryPrediction, Long> {
    Optional<DeliveryPrediction> findTopByShipmentOrderByPredictionGeneratedAtDesc(Shipment shipment);
    void deleteByShipmentId(Long shipmentId);
}
