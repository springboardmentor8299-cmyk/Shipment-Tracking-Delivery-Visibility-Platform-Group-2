package com.shiptrack.admin.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrack.admin.dto.DashboardResponse;
import com.shiptrack.admin.dto.MonthlyShipmentOverviewResponse;
import com.shiptrack.admin.dto.ShipmentStatusCountResponse;
import com.shiptrack.admin.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {

        this.adminService = adminService;

    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {

        return adminService.getDashboardStats();

    }

    @GetMapping("/dashboard/monthly-overview")
    public List<MonthlyShipmentOverviewResponse> monthlyOverview() {
        return adminService.getMonthlyShipmentOverview();
    }

    @GetMapping("/dashboard/status-counts")
    public List<ShipmentStatusCountResponse> statusCounts() {
        return adminService.getShipmentStatusCounts();
    }

}