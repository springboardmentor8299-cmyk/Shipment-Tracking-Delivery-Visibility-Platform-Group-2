package com.shiptrack.tracking;

import com.shiptrack.shipment.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {

    List<TrackingEvent> findByShipmentOrderByEventTimeAsc(Shipment shipment);

}