package com.shiptrack.repository;

import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingHistory;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface TrackingHistoryRepository extends JpaRepository<TrackingHistory, Long> {



    List<TrackingHistory> findByShipmentId(Long shipmentId);

    @Transactional
    @Modifying
    void deleteByShipmentId(Long shipmentId);



    
    List<TrackingHistory> findByShipmentOrderByTimestampAsc(Shipment shipment);

    
    TrackingHistory findTopByShipmentOrderByTimestampDesc(Shipment shipment);

    
    boolean existsByShipment(Shipment shipment);
}