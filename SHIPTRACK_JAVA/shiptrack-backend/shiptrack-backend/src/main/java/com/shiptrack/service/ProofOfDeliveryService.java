package com.shiptrack.service;

import com.shiptrack.dto.PodUploadRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;

public interface ProofOfDeliveryService {

    ProofOfDeliveryResponse upload(PodUploadRequest request);

    ProofOfDeliveryResponse getByShipmentId(Long shipmentId);

    byte[] downloadPdf(Long shipmentId);
}
