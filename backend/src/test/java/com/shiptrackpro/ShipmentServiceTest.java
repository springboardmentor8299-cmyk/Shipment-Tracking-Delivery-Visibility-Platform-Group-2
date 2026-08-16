package com.shiptrackpro;

import com.shiptrackpro.dto.ShipmentDTO;
import com.shiptrackpro.entity.LocationPoint;
import com.shiptrackpro.entity.Shipment;
import com.shiptrackpro.entity.ShipmentStatus;
import com.shiptrackpro.repository.ShipmentEventRepository;
import com.shiptrackpro.repository.ShipmentRepository;
import com.shiptrackpro.service.NotificationService;
import com.shiptrackpro.service.ShipmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private ShipmentEventRepository eventRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ShipmentService shipmentService;

    private Shipment sampleShipment;

    @BeforeEach
    void setUp() {
        sampleShipment = new Shipment();
        sampleShipment.setId("ship-test-1");
        sampleShipment.setTrackingNumber("STP-1234-IN");
        sampleShipment.setStatus(ShipmentStatus.CREATED);
        sampleShipment.setSenderName("Alpha Logistics");
        sampleShipment.setReceiverName("Beta Corp");
    }

    @Test
    void testGetShipmentByTrackingNumber() {
        when(shipmentRepository.findByTrackingNumber("STP-1234-IN")).thenReturn(Optional.of(sampleShipment));

        Optional<Shipment> result = shipmentService.getShipmentByTrackingNumber("STP-1234-IN");
        assertTrue(result.isPresent());
        assertEquals("STP-1234-IN", result.get().getTrackingNumber());
        verify(shipmentRepository, times(1)).findByTrackingNumber("STP-1234-IN");
    }

    @Test
    void testCreateShipment() {
        ShipmentDTO.CreateRequest req = new ShipmentDTO.CreateRequest();
        req.setSenderName("Sender Company");
        req.setReceiverName("Receiver Company");
        req.setSenderAddress(new LocationPoint("Mumbai", "MH", "India", 19.0, 72.8, "Mumbai Hub"));
        req.setReceiverAddress(new LocationPoint("Pune", "MH", "India", 18.5, 73.8, "Pune Hub"));

        when(shipmentRepository.save(any(Shipment.class))).thenReturn(sampleShipment);

        Shipment created = shipmentService.createShipment(req);
        assertNotNull(created);
        assertEquals("STP-1234-IN", created.getTrackingNumber());
        verify(shipmentRepository, times(1)).save(any(Shipment.class));
        verify(eventRepository, times(1)).save(any());
    }

    @Test
    void testCancelShipment() {
        when(shipmentRepository.findById("ship-test-1")).thenReturn(Optional.of(sampleShipment));
        when(shipmentRepository.save(any(Shipment.class))).thenReturn(sampleShipment);

        Shipment cancelled = shipmentService.cancelShipment("ship-test-1", "Client request");
        assertNotNull(cancelled);
        assertEquals(ShipmentStatus.CANCELLED, sampleShipment.getStatus());
        assertEquals("Client request", sampleShipment.getCancellationReason());
    }
}
