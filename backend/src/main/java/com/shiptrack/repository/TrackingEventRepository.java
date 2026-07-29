package com.shiptrack.repository;

import com.shiptrack.entity.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {

    List<TrackingEvent> findByShipmentIdOrderByRecordedAtAsc(Long shipmentId);

    void deleteByShipmentId(Long shipmentId);
}
