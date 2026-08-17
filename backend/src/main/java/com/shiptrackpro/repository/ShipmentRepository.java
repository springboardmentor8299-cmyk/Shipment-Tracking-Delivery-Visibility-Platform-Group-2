package com.shiptrackpro.repository;

import com.shiptrackpro.entity.DispatchStatus;
import com.shiptrackpro.entity.Shipment;
import com.shiptrackpro.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, String> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findByCreatedByUser(String createdByUser);
    List<Shipment> findByAssignedOperatorId(String operatorId);
    List<Shipment> findByDispatchStatus(DispatchStatus dispatchStatus);

    @Query("SELECT s FROM Shipment s WHERE LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.senderName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.receiverName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Shipment> searchShipments(@Param("query") String query);
}
