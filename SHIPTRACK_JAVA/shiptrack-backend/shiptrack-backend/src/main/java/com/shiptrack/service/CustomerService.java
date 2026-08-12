package com.shiptrack.service;

import com.shiptrack.dto.customer.*;

import java.util.List;

public interface CustomerService {

    CustomerDashboardResponse getDashboard();

    List<CustomerShipmentResponse> getMyShipments();

    CustomerShipmentResponse getShipmentDetails(Long shipmentId);

    CustomerProfileResponse getProfile();

    CustomerProfileResponse updateProfile(CustomerProfileUpdateRequest request);

    List<CustomerNotificationResponse> getNotifications();

    CustomerSupportResponse createSupportRequest(CustomerSupportRequest request);
}