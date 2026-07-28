package com.shiptrack.support_agent.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.admin.shipment.service.ShipmentService;
import com.shiptrack.support_agent.dto.SupportDashboardResponse;

import com.shiptrack.support_agent.repository.TicketRepository;
import com.shiptrack.support_agent.entity.TicketStatus;

@Service
public class SupportAgentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentService shipmentService;

    private final TicketRepository ticketRepository;

    public SupportAgentService(
            ShipmentRepository shipmentRepository,
            ShipmentService shipmentService, TicketRepository ticketRepository) {

        this.shipmentRepository = shipmentRepository;
        this.shipmentService = shipmentService;
        this.ticketRepository = ticketRepository;
    }

    // ==========================
    // Dashboard Statistics
    // ==========================

    public SupportDashboardResponse getDashboard() {

        SupportDashboardResponse response =
                new SupportDashboardResponse();

        response.setTotalShipments(
                shipmentRepository.count());

        response.setActiveDeliveries(
                shipmentRepository.countByStatus(
                        ShipmentStatus.IN_TRANSIT));

        response.setOpenTickets(
            ticketRepository.countByStatus(TicketStatus.OPEN));

        response.setResolvedToday(
            ticketRepository.countByStatus(TicketStatus.RESOLVED));

        return response;
    }

    // ==========================
    // Get All Shipments
    // ==========================

    public List<Shipment> getAllShipments() {

        return shipmentRepository.findAll();

    }

    // ==========================
    // Update Shipment
    // ==========================

    public Shipment updateShipment(Long id, Shipment shipment) {

        return shipmentService.updateShipment(id, shipment);

    }

}