package com.shiptrack.service;

import com.shiptrack.dto.DeliveryConfirmationRequest;
import com.shiptrack.dto.DeliveryConfirmationResponse;

import java.util.List;

public interface DeliveryConfirmationService {

    DeliveryConfirmationResponse confirmDelivery(DeliveryConfirmationRequest request);

    DeliveryConfirmationResponse getConfirmationById(Long id);

    List<DeliveryConfirmationResponse> getAllConfirmations();

    List<DeliveryConfirmationResponse> getConfirmationsByShipment(Long shipmentId);

    List<DeliveryConfirmationResponse> getMyDriverConfirmations();

    List<DeliveryConfirmationResponse> getMyCustomerConfirmations();
}
