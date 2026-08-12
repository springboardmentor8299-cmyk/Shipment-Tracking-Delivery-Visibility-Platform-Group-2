package com.shiptrack.service;

import com.shiptrack.dto.tracking.LiveDeliveryMonitorResponse;
import com.shiptrack.dto.tracking.ShipmentMonitoringResponse;
import com.shiptrack.entity.Shipment;
import java.util.List;

public interface DeliveryMonitoringService {

    LiveDeliveryMonitorResponse getLiveDeliveryMonitoring(Long shipmentId);
    List<ShipmentMonitoringResponse> getAllShipmentMonitoring();
    ShipmentMonitoringResponse getShipmentMonitoring(Shipment shipment);
}
