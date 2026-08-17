package com.shiptrack.backend.service.impl;

import com.shiptrack.backend.entity.RouteHistory;
import com.shiptrack.backend.repository.RouteHistoryRepository;
import com.shiptrack.backend.service.RouteHistoryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RouteHistoryServiceImpl
        implements RouteHistoryService {

    private final RouteHistoryRepository repository;

    public RouteHistoryServiceImpl(
            RouteHistoryRepository repository) {

        this.repository = repository;

    }

    @Override
    public void saveLocation(
            Long shipmentId,
            double latitude,
            double longitude) {

        RouteHistory history = new RouteHistory();

        history.setShipmentId(shipmentId);
        history.setLatitude(latitude);
        history.setLongitude(longitude);
        history.setUpdatedAt(LocalDateTime.now());

        repository.save(history);

    }

    @Override
    public List<RouteHistory> getHistory(Long shipmentId) {

        return repository.findByShipmentIdOrderByUpdatedAtAsc(shipmentId);

    }

}