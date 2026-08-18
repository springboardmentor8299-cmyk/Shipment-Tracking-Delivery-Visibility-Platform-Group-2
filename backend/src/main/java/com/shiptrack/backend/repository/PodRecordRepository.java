package com.shiptrack.backend.repository;

import com.shiptrack.backend.entity.PodRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PodRecordRepository extends JpaRepository<PodRecord, Long> {

    Optional<PodRecord> findByShipmentId(Long shipmentId);

    List<PodRecord> findByStatus(String status);

    List<PodRecord> findByDeliveryAgentId(Long deliveryAgentId);
}
