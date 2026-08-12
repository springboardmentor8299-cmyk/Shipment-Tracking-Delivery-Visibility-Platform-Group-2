package com.shiptrack.repository;

import com.shiptrack.entity.DeliveryConfirmation;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeliveryConfirmationRepository extends JpaRepository<DeliveryConfirmation, Long> {

    Optional<DeliveryConfirmation> findByShipmentId(Long shipmentId);

    Optional<DeliveryConfirmation> findByShipment(Shipment shipment);

    Optional<DeliveryConfirmation> findByShipmentAndDeliveryStatus(
            Shipment shipment,
            DeliveryConfirmationStatus status);

    List<DeliveryConfirmation> findByDriver(User driver);

    List<DeliveryConfirmation> findByCustomer(User customer);

    boolean existsByShipmentId(Long shipmentId);

    boolean existsByShipmentIdAndDeliveryStatus(Long shipmentId, DeliveryConfirmationStatus status);

    List<DeliveryConfirmation> findAllByOrderByCreatedAtDesc();

    long countByDriverAndDeliveryStatusAndDeliveryTimeBetween(
            User driver,
            DeliveryConfirmationStatus status,
            LocalDateTime start,
            LocalDateTime end);

    long countByDeliveryStatus(DeliveryConfirmationStatus status);

    List<DeliveryConfirmation> findByDeliveryStatus(DeliveryConfirmationStatus status);

    long countByDeliveryStatusAndDeliveryTimeBetween(
            DeliveryConfirmationStatus status,
            LocalDateTime start,
            LocalDateTime end);

    long countByDriverAndDeliveryStatus(
            User driver,
            DeliveryConfirmationStatus status);

    List<DeliveryConfirmation> findByDriverOrderByDeliveryTimeDesc(User driver);

    void deleteByDriver(User driver);
}
