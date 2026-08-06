package com.shiptrack.admin.route.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.admin.route.entity.Route;
import com.shiptrack.admin.route.entity.RouteStatus;

public interface RouteRepository extends JpaRepository<Route, Long> {

    Optional<Route> findByRouteCode(String routeCode);

    List<Route> findByStatus(RouteStatus status);

    List<Route> findByStatusIn(List<RouteStatus> statuses);

    List<Route> findAllByOrderByCreatedAtDesc();

    long countByStatus(RouteStatus status);

    long countByOptimizedTrue();

}
