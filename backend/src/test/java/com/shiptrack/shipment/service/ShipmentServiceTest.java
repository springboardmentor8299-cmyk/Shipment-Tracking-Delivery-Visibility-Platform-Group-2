package com.shiptrack.shipment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.admin.shipment.service.ShipmentService;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @InjectMocks
    private ShipmentService shipmentService;

    @Test
    void addShipment_shouldGenerateTrackingIdWhenMissing() {
        Shipment shipment = Shipment.builder()
                .customerName("Alice Johnson")
                .origin("New York")
                .destination("Los Angeles")
                .build();

        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Shipment savedShipment = shipmentService.addShipment(shipment);

        assertThat(savedShipment.getTrackingId()).isNotBlank();
        assertThat(savedShipment.getTrackingId()).startsWith("TRK-");
        verify(shipmentRepository).save(any(Shipment.class));
    }
}
