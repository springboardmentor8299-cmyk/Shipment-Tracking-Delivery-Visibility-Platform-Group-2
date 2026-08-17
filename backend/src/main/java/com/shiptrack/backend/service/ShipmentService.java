package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.Shipment;
import java.util.List;

public interface ShipmentService {

    Shipment createShipment(Shipment shipment);

    List<Shipment> getAllShipments();

    Shipment getShipmentById(Long id);

    Shipment updateShipment(Long id, Shipment shipment);

    void deleteShipment(Long id);

    List<Shipment> getShipmentsByDriver(String driverName);

    List<Shipment> getShipmentsByCustomer(String customerName);

    Shipment updateLocation(Long id, Double latitude, Double longitude);
}