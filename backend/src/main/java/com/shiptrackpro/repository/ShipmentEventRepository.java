package com.shiptrackpro.repository;

import com.shiptrackpro.entity.ShipmentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, String> {
    List<ShipmentEvent> findByShipmentIdOrderByTimestampAsc(String shipmentId);
}
