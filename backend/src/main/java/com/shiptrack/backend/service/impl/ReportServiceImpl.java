package com.shiptrack.backend.service.impl;

import com.shiptrack.backend.dto.ReportResponse;
import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.CustomerRepository;
import com.shiptrack.backend.repository.DriverRepository;
import com.shiptrack.backend.repository.ShipmentRepository;
import com.shiptrack.backend.service.ReportService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final ShipmentRepository shipmentRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;

    public ReportServiceImpl(
            ShipmentRepository shipmentRepository,
            DriverRepository driverRepository,
            CustomerRepository customerRepository
    ) {
        this.shipmentRepository = shipmentRepository;
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public ReportResponse getDashboardReport() {

        var shipments = shipmentRepository.findAll();

        long total = shipments.size();

        long delivered = shipments.stream()
                .filter(s -> "Delivered".equalsIgnoreCase(s.getStatus()))
                .count();

        long inTransit = shipments.stream()
                .filter(s -> "In Transit".equalsIgnoreCase(s.getStatus()))
                .count();

        long pending = shipments.stream()
                .filter(s -> "Pending".equalsIgnoreCase(s.getStatus()))
                .count();

        // ⭐ Delayed Shipments
        long delayedShipments = shipments.stream()
                .filter(s ->
                        s.getEstimatedDelivery() != null &&
                        s.getEstimatedDelivery().isBefore(LocalDate.now()) &&
                        !"Delivered".equalsIgnoreCase(s.getStatus())
                )
                .count();

        // ⭐ Delivery Success Rate
        double successRate = total == 0
                ? 0
                : ((double) delivered / total) * 100;

        // ⭐ Average Delivery Time
        // (Temporary fixed value for the project)
        double averageDeliveryTime = 2.8;

        // Driver Performance
        Map<String, Long> driverPerformance = shipments.stream()
                .filter(s -> s.getDriverName() != null &&
                        !s.getDriverName().isBlank())
                .collect(Collectors.groupingBy(
                        Shipment::getDriverName,
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        // ⭐ Top Driver
        String topDriver = "N/A";
        long maxDeliveries = 0;

        for (Map.Entry<String, Long> entry : driverPerformance.entrySet()) {

            if (entry.getValue() > maxDeliveries) {

                maxDeliveries = entry.getValue();
                topDriver = entry.getKey();

            }

        }

        // Monthly Shipments
        Map<String, Long> monthlyShipments = shipments.stream()
                .filter(s -> s.getEstimatedDelivery() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getEstimatedDelivery()
                                .getMonth()
                                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        return new ReportResponse(

                total,
                delivered,
                inTransit,
                pending,

                driverRepository.count(),
                customerRepository.count(),

                delayedShipments,
                successRate,
                averageDeliveryTime,
                topDriver,

                driverPerformance,
                monthlyShipments
        );
    }

}