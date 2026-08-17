package com.shiptrack.backend.repository;

import com.shiptrack.backend.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    List<Shipment> findByDriverName(String driverName);

    List<Shipment> findByReceiverName(String receiverName);

}