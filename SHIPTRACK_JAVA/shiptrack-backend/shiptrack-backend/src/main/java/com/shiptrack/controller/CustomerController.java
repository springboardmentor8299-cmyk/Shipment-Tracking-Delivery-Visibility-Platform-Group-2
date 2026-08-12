package com.shiptrack.controller;

import com.shiptrack.dto.customer.CustomerDashboardResponse;
import com.shiptrack.service.CustomerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/dashboard")
    public CustomerDashboardResponse getDashboard() {
        return customerService.getDashboard();
    }
}
