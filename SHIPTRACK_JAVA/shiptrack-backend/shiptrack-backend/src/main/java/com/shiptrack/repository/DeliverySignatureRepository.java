package com.shiptrack.repository;

import com.shiptrack.entity.DeliverySignature;
import com.shiptrack.entity.DeliverySignature.ValidationStatus;
import com.shiptrack.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliverySignatureRepository extends JpaRepository<DeliverySignature, Long> {

    Optional<DeliverySignature> findByShipmentId(Long shipmentId);

    Optional<DeliverySignature> findByShipment(Shipment shipment);

    boolean existsByShipmentId(Long shipmentId);

    List<DeliverySignature> findByValidationStatus(ValidationStatus validationStatus);

    List<DeliverySignature> findAllByOrderByCreatedAtDesc();
}
