package com.shiptrack.shipment;

import com.shiptrack.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    long countByStatus(ShipmentStatus status);

    List<Shipment> findByCustomer(User customer);

    List<Shipment> findByCustomerAndStatus(User customer, ShipmentStatus status);

    boolean existsByTrackingNumber(String trackingNumber);
}