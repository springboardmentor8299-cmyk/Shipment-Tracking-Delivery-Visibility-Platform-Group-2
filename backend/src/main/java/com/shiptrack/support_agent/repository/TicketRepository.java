package com.shiptrack.support_agent.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.auth.entity.User;
import com.shiptrack.support_agent.entity.Ticket;
import com.shiptrack.support_agent.entity.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ==========================
    // Customer
    // ==========================

    List<Ticket> findByCustomer(User customer);

    // ==========================
    // Support Agent
    // ==========================

    List<Ticket> findByAssignedTo(User assignedTo);

    // ==========================
    // Shipment
    // ==========================

    List<Ticket> findByShipmentId(Long shipmentId);

    // ==========================
    // Status
    // ==========================

    List<Ticket> findByStatus(TicketStatus status);

    long countByStatus(TicketStatus status);

    // ==========================
    // Assigned Agent + Status
    // ==========================

    List<Ticket> findByAssignedToAndStatus(
            User assignedTo,
            TicketStatus status
    );

    // ==========================
    // Created Between
    // ==========================

    List<Ticket> findByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

}