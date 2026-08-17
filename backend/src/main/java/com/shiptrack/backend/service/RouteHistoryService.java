package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.RouteHistory;

import java.util.List;

public interface RouteHistoryService {

    void saveLocation(
            Long shipmentId,
            double latitude,
            double longitude
    );

    List<RouteHistory> getHistory(Long shipmentId);

}