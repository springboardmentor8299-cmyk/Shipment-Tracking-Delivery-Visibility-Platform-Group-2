package com.shiptrackpro.shiptrackpro.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrackpro.shiptrackpro.entity.RouteHistory;


public interface RouteHistoryRepository 
        extends JpaRepository<RouteHistory, Long> {


}