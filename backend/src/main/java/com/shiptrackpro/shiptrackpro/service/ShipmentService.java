package com.shiptrackpro.shiptrackpro.service;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shiptrackpro.shiptrackpro.dto.DeliveryReport;
import com.shiptrackpro.shiptrackpro.entity.RouteHistory;
import com.shiptrackpro.shiptrackpro.entity.Shipment;
import com.shiptrackpro.shiptrackpro.repository.RouteHistoryRepository;
import com.shiptrackpro.shiptrackpro.repository.ShipmentRepository;


@Service
public class ShipmentService {



    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
private RouteHistoryRepository routeHistoryRepository;





    // Add Shipment
    // Add Shipment
public Shipment addShipment(Shipment shipment) {

        shipment.setTrackingId(
                "TRK" + System.currentTimeMillis()
        );
    
        // ETA logic
    
        if (shipment.getDestination().equalsIgnoreCase("Bangalore")) {
    
            shipment.setEtaHours(8);
    
        } else if (shipment.getDestination().equalsIgnoreCase("Hyderabad")) {
    
            shipment.setEtaHours(4);
    
        } else if (shipment.getDestination().equalsIgnoreCase("Chennai")) {
    
            shipment.setEtaHours(10);
    
        } else {
    
            shipment.setEtaHours(12);
    
        }
    
        System.out.println(shipment.getLatitude());
System.out.println(shipment.getLongitude());


// Create initial route history

RouteHistory history = new RouteHistory();

history.setLocation(
        shipment.getCurrentLocation()
);

history.setLatitude(
        shipment.getLatitude()
);

history.setLongitude(
        shipment.getLongitude()
);

history.setStatus(
        shipment.getStatus()
);

history.setTimestamp(
        LocalDateTime.now()
);

history.setShipment(
        shipment
);


// Save shipment first
Shipment savedShipment = shipmentRepository.save(shipment);


// Attach saved shipment
history.setShipment(savedShipment);


// Save route history
routeHistoryRepository.save(history);


return savedShipment;
    
    }








    // Admin - Get All Shipments
    public List<Shipment> getAllShipments() {


        return shipmentRepository.findAll();

    }








    // Customer - Get Own Shipments
    public List<Shipment> getShipmentsForUser(String email) {


        return shipmentRepository.findByReceiverEmail(email);

    }








    // Get Shipment by Tracking ID
    public Shipment getShipmentByTrackingId(
            String trackingId
    ) {


        return shipmentRepository.findByTrackingId(trackingId)

                .orElseThrow(
                    () -> new RuntimeException(
                        "Shipment Not Found"
                    )
                );

    }








    // Update Shipment
    public Shipment updateShipment(
            String trackingId,
            Shipment updatedShipment
    ) {



        Shipment shipment =
                shipmentRepository.findByTrackingId(trackingId)

                .orElseThrow(
                    () -> new RuntimeException(
                        "Shipment Not Found"
                    )
                );



        shipment.setSenderName(
                updatedShipment.getSenderName()
        );


        shipment.setReceiverName(
                updatedShipment.getReceiverName()
        );


        shipment.setReceiverEmail(
                updatedShipment.getReceiverEmail()
        );


        shipment.setSource(
                updatedShipment.getSource()
        );


        shipment.setDestination(
                updatedShipment.getDestination()
        );


        shipment.setStatus(
                updatedShipment.getStatus()
        );


        if(!java.util.Objects.equals(
            shipment.getCurrentLocation(),
            updatedShipment.getCurrentLocation()
    )) {
    
    
        RouteHistory history = new RouteHistory();
    
    
        history.setLocation(
                updatedShipment.getCurrentLocation()
        );
    
    
        history.setLatitude(
                updatedShipment.getLatitude()
        );
    
    
        history.setLongitude(
                updatedShipment.getLongitude()
        );
    
    
        history.setStatus(
                updatedShipment.getStatus()
        );
    
    
        history.setTimestamp(
                LocalDateTime.now()
        );
    
    
        history.setShipment(
                shipment
        );
    
    
        routeHistoryRepository.save(history);
    
    }



        shipment.setCurrentLocation(
                updatedShipment.getCurrentLocation()
        );

        shipment.setLatitude(
            updatedShipment.getLatitude()
    );
    
    shipment.setLongitude(
            updatedShipment.getLongitude()
    );



        return shipmentRepository.save(shipment);

    }









    // Delete Shipment
    public void deleteShipment(String trackingId) {


        Shipment shipment =
                shipmentRepository.findByTrackingId(trackingId)

                .orElseThrow(
                    () -> new RuntimeException(
                        "Shipment Not Found"
                    )
                );



        shipmentRepository.delete(shipment);

    }
    // Confirm Delivery

    public Shipment confirmDelivery(
        String trackingId,
        String signature
) {

    Shipment shipment = shipmentRepository
            .findByTrackingId(trackingId)
            .orElseThrow(
                    () -> new RuntimeException("Shipment not found")
            );

    shipment.setDelivered(true);

    shipment.setStatus("Delivered");

    shipment.setSignature(signature);

    return shipmentRepository.save(shipment);
}



// Delivery Performance Report

public DeliveryReport getDeliveryReport() {


    List<Shipment> shipments =
            shipmentRepository.findAll();



    long totalShipments =
            shipments.size();



            long deliveredShipments =
            shipments.stream()
            .filter(
                s -> s.isDelivered()
            )
            .count();



    long pendingShipments =
            shipments.stream()
            .filter(
                s -> "Processing".equalsIgnoreCase(s.getStatus())
            )
            .count();



    long inTransitShipments =
            shipments.stream()
            .filter(
                s -> "In Transit".equalsIgnoreCase(s.getStatus())
            )
            .count();



    double successRate = 0;


    if(totalShipments > 0){

        successRate =
            ((double) deliveredShipments /
            totalShipments) * 100;

    }



    return new DeliveryReport(
            totalShipments,
            deliveredShipments,
            pendingShipments,
            inTransitShipments,
            successRate
    );

}



}