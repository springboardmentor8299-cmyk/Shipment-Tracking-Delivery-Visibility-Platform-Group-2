package com.shiptrackpro.repository;

import com.shiptrackpro.entity.RoutePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutePlanRepository extends JpaRepository<RoutePlan, String> {
    List<RoutePlan> findByStatus(String status);
}
