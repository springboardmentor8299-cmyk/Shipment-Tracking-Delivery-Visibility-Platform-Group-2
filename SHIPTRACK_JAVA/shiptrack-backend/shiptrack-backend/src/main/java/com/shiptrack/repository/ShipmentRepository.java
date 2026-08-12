package com.shiptrack.repository;

import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {



    long countByShipmentStatus(ShipmentStatus shipmentStatus);

    @Query("select count(s) from Shipment s where s.shipmentStatus in :statuses")
    long countByShipmentStatusIn(@Param("statuses") Collection<ShipmentStatus> statuses);

    @Query("select count(distinct s.driver.id) from Shipment s " +
            "where s.driver is not null and s.shipmentStatus in :statuses")
    long countDistinctDriversOnStatuses(@Param("statuses") Collection<ShipmentStatus> statuses);

    long countByDriver(User driver);

    @Query("select count(s) from Shipment s where s.delayMinutes > 0")
    long countDelayed();

    @Query("select count(s) from Shipment s where s.createdBy.role.name = 'ROLE_BUSINESS'")
    long countBusinessCreated();

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    boolean existsByTrackingNumber(String trackingNumber);

    Optional<Shipment> findTopByOrderByIdDesc();
    List<Shipment> findTop3ByOrderByCreatedAtDesc();



    List<Shipment> findByCreatedBy(User customer);

    Optional<Shipment> findByIdAndCreatedBy(Long id, User customer);

    long countByCreatedBy(User customer);

    long countByCreatedByAndShipmentStatus(User customer, ShipmentStatus shipmentStatus);

    @Query("select count(s) from Shipment s where s.createdBy = :customer and s.shipmentStatus in :statuses")
    long countByCreatedByAndShipmentStatusIn(@Param("customer") User customer,
                                             @Param("statuses") Collection<ShipmentStatus> statuses);

    List<Shipment> findTop5ByCreatedByOrderByCreatedAtDesc(User customer);

    List<Shipment> findByDriver(User driver);

    List<Shipment> findByDriverAndShipmentStatusIn(User driver, Collection<ShipmentStatus> statuses);

    List<Shipment> findByDriverAndShipmentStatusOrderByCreatedAtDesc(User driver, ShipmentStatus status);

    long countByDriverAndShipmentStatus(User driver, ShipmentStatus shipmentStatus);

    long countByDriverAndShipmentStatusIn(User driver, Collection<ShipmentStatus> statuses);

    long countByDriverAndShipmentStatusNotIn(User driver, Collection<ShipmentStatus> statuses);

    @Query("select s from Shipment s where s.driver = :driver and s.shipmentStatus in :statuses " +
            "and (lower(s.trackingNumber) like lower(concat('%', :q, '%')) " +
            "or lower(s.senderName) like lower(concat('%', :q, '%')) " +
            "or lower(s.receiverName) like lower(concat('%', :q, '%')) " +
            "or lower(s.receiverAddress) like lower(concat('%', :q, '%')))")
    List<Shipment> searchDriverShipments(@Param("driver") User driver,
                                         @Param("statuses") Collection<ShipmentStatus> statuses,
                                         @Param("q") String q);

    @Modifying
    @Query(value = "update shipments set shipment_status = 'DELIVERED' where shipment_status = 'Deliverd'", nativeQuery = true)
    int fixDeliveredStatusTypos();

    @Modifying
    @Query(value = "delete from tracking_history where shipment_id = :id", nativeQuery = true)
    int deleteTrackingHistoryByShipmentIdNative(@Param("id") Long id);

    @Modifying
    @Query(value = "delete from shipments where id = :id", nativeQuery = true)
    int deleteByIdNative(@Param("id") Long id);

    @Modifying
    @Query(value = "delete from tracking_history", nativeQuery = true)
    int deleteAllTrackingHistoryNative();

    @Modifying
    @Query(value = "delete from shipments", nativeQuery = true)
    int deleteAllNative();
}
