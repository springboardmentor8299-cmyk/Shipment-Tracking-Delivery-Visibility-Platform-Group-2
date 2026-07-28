package com.shiptrack.logistics_operator.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.admin.shipment.service.ShipmentService;
import com.shiptrack.logistics_operator.dto.OperatorDashboardResponse;

@Service
public class OperatorService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentService shipmentService;

    public OperatorService(
            ShipmentRepository shipmentRepository,
            ShipmentService shipmentService) {

        this.shipmentRepository = shipmentRepository;
        this.shipmentService = shipmentService;
    }

    public OperatorDashboardResponse getDashboard() {

        OperatorDashboardResponse response =
                new OperatorDashboardResponse();

        response.setTotalShipments(
                shipmentRepository.count());

        response.setActiveDeliveries(
                shipmentRepository.countByStatus(
                        ShipmentStatus.IN_TRANSIT));

        response.setRoutesAssigned(4);

        response.setDeliveredToday(
                shipmentRepository.countByStatusAndDeliveryDate(
                        ShipmentStatus.DELIVERED,
                        LocalDate.now()));

        return response;
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment updateShipment(Long id, Shipment shipment) {
        return shipmentService.updateShipment(id, shipment);
    }
}