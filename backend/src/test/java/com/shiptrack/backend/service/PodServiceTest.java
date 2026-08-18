package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.PodRecord;
import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.PodRecordRepository;
import com.shiptrack.backend.repository.ShipmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PodServiceTest {

    @Mock
    private PodRecordRepository podRecordRepository;

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private RouteHistoryService routeHistoryService;

    @InjectMocks
    private PodService podService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveSignature() {
        Long shipmentId = 100L;
        String signatureData = "data:image/png;base64,sampleSignature";

        when(podRecordRepository.findByShipmentId(shipmentId)).thenReturn(Optional.empty());
        when(podRecordRepository.save(any(PodRecord.class))).thenAnswer(i -> i.getArgument(0));

        PodRecord result = podService.saveSignature(shipmentId, signatureData);

        assertNotNull(result);
        assertEquals(shipmentId, result.getShipmentId());
        assertEquals(signatureData, result.getSignatureUrl());
        assertEquals("CAPTURED", result.getStatus());
        verify(podRecordRepository, times(1)).save(any(PodRecord.class));
    }

    @Test
    void testConfirmDelivery() {
        Long shipmentId = 101L;
        Shipment shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setTrackingNumber("SH1001");
        shipment.setStatus("IN_TRANSIT");

        when(podRecordRepository.findByShipmentId(shipmentId)).thenReturn(Optional.empty());
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));
        when(podRecordRepository.save(any(PodRecord.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, Object> payload = Map.of(
                "signatureData", "data:image/svg;sample",
                "recipientName", "John Doe",
                "geoLat", 28.6139,
                "geoLng", 77.2090
        );

        PodRecord result = podService.confirmDelivery(shipmentId, payload);

        assertNotNull(result);
        assertEquals("CAPTURED", result.getStatus());
        assertEquals("DELIVERED", shipment.getStatus());
        verify(shipmentRepository, times(1)).save(shipment);
    }

    @Test
    void testVerifyPodDisputed() {
        Long shipmentId = 102L;
        PodRecord record = new PodRecord();
        record.setShipmentId(shipmentId);
        record.setStatus("CAPTURED");

        when(podRecordRepository.findByShipmentId(shipmentId)).thenReturn(Optional.of(record));
        when(podRecordRepository.save(any(PodRecord.class))).thenAnswer(i -> i.getArgument(0));

        PodRecord verified = podService.verifyPod(shipmentId, "DISPUTED", "support_amy", "Damage reported");

        assertNotNull(verified);
        assertEquals("DISPUTED", verified.getStatus());
        assertEquals("support_amy", verified.getVerifiedBy());
        assertTrue(verified.getNotes().contains("Damage reported"));
    }
}
