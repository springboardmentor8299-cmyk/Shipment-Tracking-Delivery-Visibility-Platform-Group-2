package com.shiptrack.business_client.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.admin.shipment.service.ShipmentService;
import com.shiptrack.business_client.dto.BusinessDashboardResponse;

@Service
public class BusinessService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentService shipmentService;

    public BusinessService(
            ShipmentRepository shipmentRepository,
            ShipmentService shipmentService) {

        this.shipmentRepository = shipmentRepository;
        this.shipmentService = shipmentService;
    }

    // ==========================
    // Dashboard Statistics
    // ==========================

    public BusinessDashboardResponse getDashboard() {

        BusinessDashboardResponse response =
                new BusinessDashboardResponse();

        response.setTotalShipments(
                shipmentRepository.count());

        response.setActiveDeliveries(
                shipmentRepository.countByStatus(
                        ShipmentStatus.IN_TRANSIT));

        response.setShipmentsInTransit(
                shipmentRepository.countByStatus(
                        ShipmentStatus.IN_TRANSIT));

        response.setDeliveredToday(
                shipmentRepository.countByStatusAndDeliveryDate(
                        ShipmentStatus.DELIVERED,
                        LocalDate.now()));

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