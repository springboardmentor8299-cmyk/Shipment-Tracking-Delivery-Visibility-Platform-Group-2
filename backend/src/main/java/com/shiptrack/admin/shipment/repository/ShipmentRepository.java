package com.shiptrack.admin.shipment.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;

import com.shiptrack.auth.entity.User;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

        long countByStatus(ShipmentStatus status);

        long countByStatusAndDeliveryDate(
                        ShipmentStatus status,
                        LocalDate deliveryDate);

        @Query("SELECT MONTH(s.shipmentDate), YEAR(s.shipmentDate), COUNT(s) " +
                        "FROM Shipment s " +
                        "WHERE s.shipmentDate >= :fromDate " +
                        "GROUP BY YEAR(s.shipmentDate), MONTH(s.shipmentDate) " +
                        "ORDER BY YEAR(s.shipmentDate), MONTH(s.shipmentDate)")
        List<Object[]> countShipmentsByMonthSince(@Param("fromDate") LocalDate fromDate);

        @Query("SELECT s.status, COUNT(s) FROM Shipment s GROUP BY s.status")
        List<Object[]> countShipmentsByStatus();

        List<Shipment> findByCustomerId(User customerId);

        Optional<Shipment> findByTrackingId(String trackingId);

        List<Shipment> findByAssignedDriverIsNullAndStatusNotIn(List<ShipmentStatus> excludedStatuses);

        List<Shipment> findByAssignedDriver_Id(Long driverId);

        long countByAssignedDriver_IdAndStatus(Long driverId, ShipmentStatus status);

}