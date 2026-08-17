package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.ProofOfDelivery;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ProofOfDeliveryService {

    ProofOfDelivery saveProof(

            Long shipmentId,

            String receiverName,

            String remarks,

            String signature,

            MultipartFile photo

    ) throws IOException;

    ProofOfDelivery getProofByShipmentId(Long shipmentId);

}