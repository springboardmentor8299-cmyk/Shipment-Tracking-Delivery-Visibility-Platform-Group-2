package com.shiptrack.backend.repository;

import com.shiptrack.backend.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    List<Shipment> findByCustomerId(Long customerId);
    List<Shipment> findByCreatedByUserId(Long createdByUserId);
    List<Shipment> findByAssignedOperatorId(Long assignedOperatorId);
    
    List<Shipment> findByCreatedByUserIdOrCreatedByEmailIgnoreCase(Long createdByUserId, String createdByEmail);
    List<Shipment> findByCustomerIdOrCustomerEmailIgnoreCase(Long customerId, String customerEmail);
    List<Shipment> findByAssignedOperatorIdOrOperatorEmailIgnoreCase(Long assignedOperatorId, String operatorEmail);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}