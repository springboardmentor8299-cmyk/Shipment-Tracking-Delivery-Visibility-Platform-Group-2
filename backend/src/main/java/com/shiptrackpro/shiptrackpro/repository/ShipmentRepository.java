package com.shiptrackpro.shiptrackpro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shiptrackpro.shiptrackpro.entity.Shipment;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingId(String trackingId);
    List<Shipment> findByReceiverEmail(String email);

}