package com.shiptrack.support_agent.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.auth.entity.User;
import com.shiptrack.support_agent.entity.Ticket;
import com.shiptrack.support_agent.entity.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

        List<Ticket> findByCustomer(User customer);

        List<Ticket> findByAssignedTo(User assignedTo);

        List<Ticket> findByShipmentId(Long shipmentId);

        List<Ticket> findByStatus(TicketStatus status);

        long countByStatus(TicketStatus status);

        List<Ticket> findByAssignedToAndStatus(
                        User assignedTo,
                        TicketStatus status);

        List<Ticket> findByCreatedAtBetween(
                        LocalDateTime start,
                        LocalDateTime end);

}