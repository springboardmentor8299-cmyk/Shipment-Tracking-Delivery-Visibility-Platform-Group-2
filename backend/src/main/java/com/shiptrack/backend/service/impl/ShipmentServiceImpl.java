package com.shiptrack.backend.service.impl;

import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.ShipmentRepository;
import com.shiptrack.backend.service.ShipmentService;
import org.springframework.stereotype.Service;

import java.util.List;

import java.time.LocalDateTime;

import com.shiptrack.backend.service.RouteHistoryService;
@Service
public class ShipmentServiceImpl implements ShipmentService {

private final ShipmentRepository shipmentRepository;
private final RouteHistoryService routeHistoryService;

    public ShipmentServiceImpl(
        ShipmentRepository shipmentRepository,
        RouteHistoryService routeHistoryService) {

    this.shipmentRepository = shipmentRepository;
    this.routeHistoryService = routeHistoryService;
}

    @Override
public Shipment createShipment(Shipment shipment) {

    // Truck starts from pickup
    shipment.setCurrentLatitude(shipment.getPickupLatitude());
    shipment.setCurrentLongitude(shipment.getPickupLongitude());

    shipment.setLastLocationUpdate(LocalDateTime.now());

    return shipmentRepository.save(shipment);

}

    @Override
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    @Override
    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id).orElse(null);
    }

    @Override
    public Shipment updateShipment(Long id, Shipment shipment) {

        Shipment existing = shipmentRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setTrackingNumber(shipment.getTrackingNumber());
        existing.setSenderName(shipment.getSenderName());
        existing.setReceiverName(shipment.getReceiverName());
        existing.setPickupAddress(shipment.getPickupAddress());
        existing.setDeliveryAddress(shipment.getDeliveryAddress());
        existing.setPickupLatitude(
        shipment.getPickupLatitude());

existing.setPickupLongitude(
        shipment.getPickupLongitude());

existing.setDestinationLatitude(
        shipment.getDestinationLatitude());

existing.setDestinationLongitude(
        shipment.getDestinationLongitude());
        existing.setStatus(shipment.getStatus());
        // If delivered, move the truck to the destination
if ("Delivered".equalsIgnoreCase(shipment.getStatus())) {

    existing.setStatus("Delivered");

}
        existing.setWeight(shipment.getWeight());
        existing.setPrice(shipment.getPrice());

        // Driver Details
        existing.setDriverName(shipment.getDriverName());
        existing.setVehicleNumber(shipment.getVehicleNumber());
        existing.setEstimatedDelivery(shipment.getEstimatedDelivery());

        return shipmentRepository.save(existing);
    }

    @Override
    public void deleteShipment(Long id) {
        shipmentRepository.deleteById(id);
    }

    // ================= Driver =================

    @Override
public List<Shipment> getShipmentsByDriver(String driverName) {

    return shipmentRepository.findByDriverName(driverName);

}
    // ================= Customer =================

    @Override
    public List<Shipment> getShipmentsByCustomer(String customerName) {
        return shipmentRepository.findByReceiverName(customerName);
    }
    
@Override
public Shipment updateLocation(Long id,
                               Double latitude,
                               Double longitude) {

    Shipment shipment =
            shipmentRepository.findById(id).orElse(null);

    if (shipment == null) {

        return null;

    }

    shipment.setCurrentLatitude(latitude);
    shipment.setCurrentLongitude(longitude);

    shipment.setLastLocationUpdate(
            LocalDateTime.now());
System.out.println(
    "Saving Route History: " +
    latitude + ", " + longitude
);
    routeHistoryService.saveLocation(

            id,

            latitude,

            longitude

    );

    return shipmentRepository.save(shipment);

}

}