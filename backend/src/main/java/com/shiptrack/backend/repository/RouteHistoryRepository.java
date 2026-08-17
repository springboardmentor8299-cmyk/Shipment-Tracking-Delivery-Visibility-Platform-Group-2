package com.shiptrack.backend.repository;

import com.shiptrack.backend.entity.RouteHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteHistoryRepository
        extends JpaRepository<RouteHistory, Long> {

    List<RouteHistory> findByShipmentIdOrderByUpdatedAtAsc(Long shipmentId);

}