package com.shiptrack.support_agent.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.support_agent.dto.TicketRequest;
import com.shiptrack.support_agent.dto.TicketResponse;
import com.shiptrack.support_agent.entity.Ticket;
import com.shiptrack.support_agent.entity.TicketStatus;
import com.shiptrack.support_agent.repository.TicketRepository;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            ShipmentRepository shipmentRepository) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
    }

    // ==========================
    // CREATE TICKET
    // ==========================

    public TicketResponse createTicket(TicketRequest request) {

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        User supportAgent = null;

        if (request.getAssignedTo() != null) {

            supportAgent = userRepository.findById(request.getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("Support Agent not found"));
        }

        Ticket ticket = Ticket.builder()
                .customer(customer)
                .shipment(shipment)
                .subject(request.getSubject())
                .description(request.getDescription())
                .assignedTo(supportAgent)
                .status(TicketStatus.valueOf(request.getStatus()))
                .build();

        return convertToResponse(ticketRepository.save(ticket));
    }

    // ==========================
    // GET ALL TICKETS
    // ==========================

    public List<TicketResponse> getAllTickets() {

        return ticketRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

    }

    // ==========================
    // GET TICKET BY ID
    // ==========================

    public TicketResponse getTicket(Long id) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return convertToResponse(ticket);

    }

    // ==========================
    // UPDATE TICKET
    // ==========================

    public TicketResponse updateTicket(Long id,
                                       TicketRequest request) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setSubject(request.getSubject());

        ticket.setDescription(request.getDescription());

        ticket.setStatus(
                TicketStatus.valueOf(request.getStatus()));

        if (request.getAssignedTo() != null) {

            User supportAgent =
                    userRepository.findById(request.getAssignedTo())
                            .orElseThrow(() ->
                                    new RuntimeException("Support Agent not found"));

            ticket.setAssignedTo(supportAgent);

        }

        return convertToResponse(ticketRepository.save(ticket));

    }

    // ==========================
    // DELETE TICKET
    // ==========================

    public void deleteTicket(Long id) {

        ticketRepository.deleteById(id);

    }

    // ==========================
    // ENTITY → DTO
    // ==========================

    private TicketResponse convertToResponse(Ticket ticket) {

        return TicketResponse.builder()

                .id(ticket.getId())

                .customerId(ticket.getCustomer().getId())
                .customerName(ticket.getCustomer().getName())

                .shipmentId(ticket.getShipment().getId())
                .trackingId(ticket.getShipment().getTrackingId())

                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())

                .assignedToId(
                        ticket.getAssignedTo() != null
                                ? ticket.getAssignedTo().getId()
                                : null)

                .assignedToName(
                        ticket.getAssignedTo() != null
                                ? ticket.getAssignedTo().getName()
                                : null)

                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())

                .build();

    }

}