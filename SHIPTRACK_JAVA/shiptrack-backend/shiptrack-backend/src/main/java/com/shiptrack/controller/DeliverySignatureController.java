package com.shiptrack.controller;

import com.shiptrack.entity.DeliverySignature;
import com.shiptrack.entity.Shipment;
import com.shiptrack.repository.DeliverySignatureRepository;
import com.shiptrack.repository.ShipmentRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-signatures")
public class DeliverySignatureController {

    private static final long MAX_SIGNATURE_BYTES = 5L * 1024 * 1024;

    private final DeliverySignatureRepository deliverySignatureRepository;
    private final ShipmentRepository shipmentRepository;

    public DeliverySignatureController(
            DeliverySignatureRepository deliverySignatureRepository,
            ShipmentRepository shipmentRepository) {

        this.deliverySignatureRepository = deliverySignatureRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('DRIVER')")
    public DeliverySignature saveSignature(
            @RequestBody Map<String, Object> payload) {

        Object shipmentIdValue = payload.get("shipmentId");
        if (shipmentIdValue == null) {
            throw new RuntimeException("Shipment id is required.");
        }

        Long shipmentId;
        try {
            shipmentId = Long.valueOf(shipmentIdValue.toString());
        } catch (NumberFormatException ex) {
            throw new RuntimeException("Shipment id is invalid.");
        }

        String signatureData = payload.get("signatureData") == null
                ? null
                : payload.get("signatureData").toString();

        String[] validated = validateAndDecodeSignatureImage(signatureData);

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        if (deliverySignatureRepository.existsByShipmentId(shipmentId)) {
            throw new RuntimeException("A signature already exists for this shipment.");
        }

        DeliverySignature signature = new DeliverySignature();
        signature.setShipment(shipment);
        signature.setSignatureData(validated[1]);
        signature.setContentType(validated[0]);
        signature.setValidationStatus(DeliverySignature.ValidationStatus.PENDING);

        return deliverySignatureRepository.save(signature);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','OPERATOR')")
    public List<DeliverySignature> getAllSignatures() {

        return deliverySignatureRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','OPERATOR','DRIVER','CUSTOMER')")
    public DeliverySignature getSignatureById(
            @PathVariable Long id) {

        return deliverySignatureRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Delivery signature not found."));
    }

    @GetMapping("/shipment/{shipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','OPERATOR','DRIVER','CUSTOMER')")
    public DeliverySignature getSignatureByShipment(
            @PathVariable Long shipmentId) {

        return deliverySignatureRepository.findByShipmentId(shipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Delivery signature not found for this shipment."));
    }

    @PutMapping("/{id}/validation")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','OPERATOR')")
    public DeliverySignature validateSignature(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {

        DeliverySignature signature = deliverySignatureRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Delivery signature not found."));

        boolean validated = Boolean.TRUE.equals(payload.get("validated"));

        signature.setValidationStatus(validated
                ? DeliverySignature.ValidationStatus.VALIDATED
                : DeliverySignature.ValidationStatus.REJECTED);

        signature.setValidationMessage(payload.get("message") == null
                ? null
                : payload.get("message").toString());

        return deliverySignatureRepository.save(signature);
    }

    private String[] validateAndDecodeSignatureImage(String signatureData) {

        if (signatureData == null || signatureData.isBlank()) {
            throw new RuntimeException("Signature image is required.");
        }

        String base64 = signatureData;
        String contentType = "image/png";

        int commaIndex = signatureData.indexOf(',');
        if (commaIndex > 0) {
            String prefix = signatureData.substring(0, commaIndex);
            if (prefix.matches("^data:image/[a-zA-Z0-9.+-]+(;base64)?$")) {
                if (prefix.contains("jpeg") || prefix.contains("jpg")) {
                    contentType = "image/jpeg";
                } else if (prefix.contains("webp")) {
                    contentType = "image/webp";
                } else {
                    contentType = "image/png";
                }
                base64 = signatureData.substring(commaIndex + 1);
            }
        }

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Signature image is not valid base64 data.");
        }

        if (bytes.length < 200) {
            throw new RuntimeException("Signature image is too small to be a valid signature.");
        }
        if (bytes.length > MAX_SIGNATURE_BYTES) {
            throw new RuntimeException("Signature image exceeds the maximum allowed size.");
        }

        if (bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8) {
            contentType = "image/jpeg";
        } else if (bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89
                && (bytes[1] & 0xFF) == 0x50
                && (bytes[2] & 0xFF) == 0x4E
                && (bytes[3] & 0xFF) == 0x47) {
            contentType = "image/png";
        }

        BufferedImage image;
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes)) {
            image = ImageIO.read(inputStream);
        } catch (IOException ex) {
            throw new RuntimeException("Signature image could not be read.");
        }

        if (image == null) {
            throw new RuntimeException("Signature image format is not supported.");
        }
        if (image.getWidth() < 20 || image.getHeight() < 20) {
            throw new RuntimeException("Signature image dimensions are too small.");
        }

        return new String[]{contentType, base64};
    }
}
