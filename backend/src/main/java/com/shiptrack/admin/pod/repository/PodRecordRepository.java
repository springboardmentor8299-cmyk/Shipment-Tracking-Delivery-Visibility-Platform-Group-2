package com.shiptrack.admin.pod.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.admin.pod.entity.PodRecord;

public interface PodRecordRepository extends JpaRepository<PodRecord, Long> {

    // (v) POD record management — newest first
    List<PodRecord> findAllByOrderByDeliveredAtDesc();

    // Most recent POD captured for a given tracking ID
    Optional<PodRecord> findFirstByShipment_TrackingIdOrderByDeliveredAtDesc(String trackingId);

    List<PodRecord> findByShipment_TrackingId(String trackingId);

}
