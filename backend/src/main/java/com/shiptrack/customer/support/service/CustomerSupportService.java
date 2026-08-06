package com.shiptrack.customer.support.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.shiptrack.customer.support.dto.CustomerSupportResponseDto;
import com.shiptrack.customer.support.dto.RaiseIssueDto;
import com.shiptrack.customer.support.dto.ShipmentRequestDto;

public interface CustomerSupportService {

    /**
     * Customer submits a shipment request.
     */
    void createShipmentRequest(ShipmentRequestDto request);

    /**
     * Customer raises an issue for an existing shipment.
     */
    void raiseIssue(RaiseIssueDto request, MultipartFile attachment);

    /**
     * Returns all requests created by the logged-in customer.
     */
    List<CustomerSupportResponseDto> getMyRequests();

}