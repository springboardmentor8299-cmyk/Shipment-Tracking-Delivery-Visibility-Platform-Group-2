package com.shiptrack.shipment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.shiptrack.activity.service.ActivityService;
import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.admin.shipment.service.GeoapifyService;
import com.shiptrack.admin.shipment.service.ShipmentService;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.driver.repository.DriverRepository;
import com.shiptrack.notification.service.NotificationService;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private ActivityService activityService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private GeoapifyService geoapifyService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ShipmentService shipmentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(
                shipmentService,
                "geoapifyService",
                geoapifyService);

        ReflectionTestUtils.setField(
                shipmentService,
                "userRepository",
                userRepository);

        ReflectionTestUtils.setField(
                shipmentService,
                "driverRepository",
                driverRepository);

        ReflectionTestUtils.setField(
                shipmentService,
                "notificationService",
                notificationService);
    }

    @Test
    void addShipment_shouldGenerateTrackingIdWhenMissing() {

        Shipment shipment = Shipment.builder()
                .customerName("Alice Johnson")
                .origin("New York")
                .destination("Los Angeles")
                .build();

        when(geoapifyService.forwardGeocode(any(String.class)))
                .thenReturn(null);

        when(shipmentRepository.save(any(Shipment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Shipment savedShipment = shipmentService.addShipment(shipment);

        assertThat(savedShipment.getTrackingId()).isNotBlank();
        assertThat(savedShipment.getTrackingId()).startsWith("TRK-");

        verify(shipmentRepository).save(any(Shipment.class));
    }
}