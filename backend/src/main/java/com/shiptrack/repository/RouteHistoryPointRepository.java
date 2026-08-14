package com.shiptrack.repository;

import com.shiptrack.entity.RouteHistoryPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RouteHistoryPointRepository extends JpaRepository<RouteHistoryPoint, Long> {

    List<RouteHistoryPoint> findByShipmentIdOrderByRecordedAtAsc(Long shipmentId);

    Optional<RouteHistoryPoint> findTopByShipmentIdOrderByRecordedAtDesc(Long shipmentId);

    void deleteByShipmentId(Long shipmentId);
}
