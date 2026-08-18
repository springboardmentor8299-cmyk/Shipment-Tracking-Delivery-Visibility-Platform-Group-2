package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.PodRecord;
import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.AnalyticsMetricRepository;
import com.shiptrack.backend.repository.PodRecordRepository;
import com.shiptrack.backend.repository.ShipmentRepository;
import com.shiptrack.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AnalyticsServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private PodRecordRepository podRecordRepository;

    @Mock
    private AnalyticsMetricRepository analyticsMetricRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAdminAnalytics() {
        Shipment s1 = new Shipment();
        s1.setStatus("DELIVERED");
        Shipment s2 = new Shipment();
        s2.setStatus("IN_TRANSIT");

        when(shipmentRepository.findAll()).thenReturn(List.of(s1, s2));
        when(podRecordRepository.findAll()).thenReturn(List.of(new PodRecord()));
        when(userRepository.count()).thenReturn(5L);

        Map<String, Object> adminData = analyticsService.getAdminAnalytics();

        assertNotNull(adminData);
        assertEquals(2L, adminData.get("platformTotalShipments"));
        assertEquals(5L, adminData.get("totalUsersCount"));
        assertEquals("ALL_SERVICES_OPERATIONAL", adminData.get("systemStatus"));
    }

    @Test
    void testGetBusinessAnalytics() {
        when(shipmentRepository.findAll()).thenReturn(List.of());
        when(userRepository.count()).thenReturn(10L);

        Map<String, Object> bizData = analyticsService.getBusinessAnalytics(101L);

        assertNotNull(bizData);
        assertEquals(101L, bizData.get("businessId"));
        assertTrue(bizData.containsKey("volumeTrend"));
        assertTrue(bizData.containsKey("delayByRegion"));
    }
}
