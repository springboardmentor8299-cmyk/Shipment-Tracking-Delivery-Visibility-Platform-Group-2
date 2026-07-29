package com.shiptrack.repository;

import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    boolean existsByTrackingNumber(String trackingNumber);

    List<Shipment> findByCreatedByOrderByCreatedAtDesc(User createdBy);

    List<Shipment> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);

    List<Shipment> findByStatusIn(List<String> statuses);

    @Modifying
    @Query("UPDATE Shipment s SET s.estimatedDuration = :duration, s.estimatedDeliveryTime = :deliveryTime WHERE s.id = :id")
    void updateEtaFields(@Param("id") Long id, @Param("duration") Long duration, @Param("deliveryTime") LocalDateTime deliveryTime);
}
