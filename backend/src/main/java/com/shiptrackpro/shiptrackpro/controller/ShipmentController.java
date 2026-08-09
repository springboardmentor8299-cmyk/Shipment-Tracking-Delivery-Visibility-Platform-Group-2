package com.shiptrackpro.shiptrackpro.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrackpro.shiptrackpro.entity.Role;
import com.shiptrackpro.shiptrackpro.entity.RouteHistory;
import com.shiptrackpro.shiptrackpro.entity.Shipment;
import com.shiptrackpro.shiptrackpro.entity.User;
import com.shiptrackpro.shiptrackpro.service.ShipmentService;
import com.shiptrackpro.shiptrackpro.service.UserService;

import jakarta.validation.Valid;



@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "http://localhost:5173")
public class ShipmentController {


    @Autowired
    private ShipmentService shipmentService;




    @Autowired
    private UserService userService;



    // ADD SHIPMENT
    // ADMIN ONLY

    @PostMapping
    public Shipment addShipment(
            Authentication authentication,
            @Valid @RequestBody Shipment shipment) {


        checkAdmin(authentication);


        return shipmentService.addShipment(shipment);

    }





    // GET SHIPMENTS

    @GetMapping
public List<Shipment> getShipments(
        Authentication authentication
){

    System.out.println("Authentication = " + authentication);

    String email = authentication.getName();

        User user =
                userService.getUserByEmail(email);



        if(user.getRole() == Role.ADMIN){

            return shipmentService.getAllShipments();

        }


        return shipmentService.getShipmentsForUser(email);

    }





    // GET BY TRACKING ID

    @GetMapping("/{trackingId}")
    public Shipment getShipmentByTrackingId(
            @PathVariable String trackingId) {


        return shipmentService
                .getShipmentByTrackingId(trackingId);

    }






    // UPDATE SHIPMENT
    // ADMIN ONLY

    @PutMapping("/{trackingId}")
    public Shipment updateShipment(
            Authentication authentication,
            @PathVariable String trackingId,
            @Valid @RequestBody Shipment shipment) {


        checkAdmin(authentication);


        return shipmentService
                .updateShipment(trackingId, shipment);

    }






    // DELETE SHIPMENT
    // ADMIN ONLY

    @DeleteMapping("/{trackingId}")
    public String deleteShipment(
            Authentication authentication,
            @PathVariable String trackingId) {


        checkAdmin(authentication);


        shipmentService.deleteShipment(trackingId);


        return "Shipment Deleted Successfully";

    }

    @PutMapping("/{trackingId}/deliver")
    public Shipment confirmDelivery(
    
            Authentication authentication,
    
            @PathVariable String trackingId,
    
            @RequestBody String signature
    
    ) {
    
        checkAdmin(authentication);
    
        return shipmentService.confirmDelivery(
                trackingId,
                signature
        );
    
    }

    @GetMapping("/{trackingId}/history")
public List<RouteHistory> getRouteHistory(
        @PathVariable String trackingId
) {


    Shipment shipment =
            shipmentService.getShipmentByTrackingId(trackingId);


    return shipment.getRouteHistory();

}





    // ROLE CHECK METHOD

    private void checkAdmin(Authentication authentication){


        String email =
                authentication.getName();



        User user =
                userService.getUserByEmail(email);



        if(user.getRole() != Role.ADMIN){

            throw new RuntimeException(
                    "Access Denied! Admin Only"
            );

        }

    }


}