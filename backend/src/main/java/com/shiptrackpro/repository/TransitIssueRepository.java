package com.shiptrackpro.repository;

import com.shiptrackpro.entity.TransitIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransitIssueRepository extends JpaRepository<TransitIssue, String> {
    List<TransitIssue> findByShipmentId(String shipmentId);
    List<TransitIssue> findByStatus(String status);
}
