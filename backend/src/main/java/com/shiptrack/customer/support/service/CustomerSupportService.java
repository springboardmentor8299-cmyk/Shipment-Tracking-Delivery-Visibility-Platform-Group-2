package com.shiptrack.customer.support.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.shiptrack.customer.support.dto.CustomerSupportResponseDto;
import com.shiptrack.customer.support.dto.RaiseIssueDto;
import com.shiptrack.customer.support.dto.ShipmentRequestDto;

public interface CustomerSupportService {

    void createShipmentRequest(ShipmentRequestDto request);

    void raiseIssue(RaiseIssueDto request, MultipartFile attachment);

    List<CustomerSupportResponseDto> getMyRequests();

    Object getSupportRequestById(Long id);

}