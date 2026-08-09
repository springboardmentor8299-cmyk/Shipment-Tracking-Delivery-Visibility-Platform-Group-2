package com.shiptrackpro.shiptrackpro.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrackpro.shiptrackpro.dto.DeliveryReport;
import com.shiptrackpro.shiptrackpro.service.ShipmentService;


@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins="http://localhost:5173")
public class ReportController {


    @Autowired
    private ShipmentService shipmentService;



    @GetMapping("/delivery-performance")
    public DeliveryReport getDeliveryPerformance(){


        return shipmentService.getDeliveryReport();

    }

}