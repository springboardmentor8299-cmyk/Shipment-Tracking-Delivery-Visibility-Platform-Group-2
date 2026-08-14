package com.shiptrack.service;

import com.shiptrack.dto.AnalyticsOverviewResponse;
import com.shiptrack.dto.DailyTrendPoint;
import com.shiptrack.dto.DeliveryPerformanceReport;
import com.shiptrack.dto.TrendsResponse;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.exception.ForbiddenException;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final List<String> ALL_STATUSES = List.of(
            "CREATED", "PICKED_UP", "AT_SORTING_FACILITY", "IN_TRANSIT",
            "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"
    );

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void requireAdminOrSupport(User user) {
        String role = user.getRole();
        if (!"ADMIN".equalsIgnoreCase(role) && !"SUPPORT_ASSISTANT".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Access denied. Admins or Support only.");
        }
    }

    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview(String currentUserEmail) {
        requireAdminOrSupport(getUserByEmail(currentUserEmail));

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (String status : ALL_STATUSES) {
            byStatus.put(status, shipmentRepository.countByStatus(status));
        }

        List<Shipment> delivered = shipmentRepository.findByStatus("DELIVERED");
        long onTime = 0;
        long onTimeBase = 0;
        for (Shipment s : delivered) {
            if (s.getActualDeliveryTime() == null || s.getEstimatedDeliveryTime() == null) {
                continue;
            }
            onTimeBase++;
            if (!s.getActualDeliveryTime().isAfter(s.getEstimatedDeliveryTime())) {
                onTime++;
            }
        }
        Double onTimeRate = onTimeBase == 0
                ? null
                : Math.round((onTime * 100.0 / onTimeBase) * 10.0) / 10.0;

        Double avgDeliveryHours = delivered.stream()
                .filter(s -> s.getCreatedAt() != null && s.getActualDeliveryTime() != null)
                .mapToDouble(s -> Duration.between(s.getCreatedAt(), s.getActualDeliveryTime()).toMinutes() / 60.0)
                .average()
                .stream()
                .map(v -> Math.round(v * 10.0) / 10.0)
                .boxed()
                .findFirst()
                .orElse(null);

        List<Shipment> all = shipmentRepository.findAll();
        Double avgDistanceKm = all.stream()
                .filter(s -> s.getTotalDistance() != null)
                .mapToDouble(Shipment::getTotalDistance)
                .average()
                .stream()
                .map(v -> Math.round(v * 10.0) / 10.0)
                .boxed()
                .findFirst()
                .orElse(null);
        double totalDistanceKm = all.stream()
                .filter(s -> s.getTotalDistance() != null)
                .mapToDouble(Shipment::getTotalDistance)
                .sum();

        return AnalyticsOverviewResponse.builder()
                .total(all.size())
                .byStatus(byStatus)
                .delivered(byStatus.getOrDefault("DELIVERED", 0L))
                .inTransit(byStatus.getOrDefault("IN_TRANSIT", 0L))
                .outForDelivery(byStatus.getOrDefault("OUT_FOR_DELIVERY", 0L))
                .cancelled(byStatus.getOrDefault("CANCELLED", 0L))
                .onTimeRate(onTimeRate)
                .avgDeliveryHours(avgDeliveryHours)
                .avgDistanceKm(avgDistanceKm)
                .totalDistanceKm(Math.round(totalDistanceKm * 10.0) / 10.0)
                .build();
    }

    @Transactional(readOnly = true)
    public TrendsResponse getTrends(int days, String currentUserEmail) {
        requireAdminOrSupport(getUserByEmail(currentUserEmail));

        if (days < 1 || days > 365) {
            throw new IllegalArgumentException("days must be between 1 and 365.");
        }

        LocalDateTime cutoff = LocalDate.now().minusDays(days - 1L).atStartOfDay();

        Map<LocalDate, DailyTrendPoint> points = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            points.put(date, DailyTrendPoint.builder()
                    .date(date.toString())
                    .created(0)
                    .delivered(0)
                    .build());
        }

        shipmentRepository.findByCreatedAtAfter(cutoff).forEach(s -> {
            LocalDate date = s.getCreatedAt().toLocalDate();
            DailyTrendPoint p = points.get(date);
            if (p != null) {
                p.setCreated(p.getCreated() + 1);
            }
        });

        shipmentRepository.findByActualDeliveryTimeAfter(cutoff).forEach(s -> {
            LocalDate date = s.getActualDeliveryTime().toLocalDate();
            DailyTrendPoint p = points.get(date);
            if (p != null) {
                p.setDelivered(p.getDelivered() + 1);
            }
        });

        return TrendsResponse.builder()
                .days(days)
                .points(new ArrayList<>(points.values()))
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStatusDistribution(int days, String currentUserEmail) {
        requireAdminOrSupport(getUserByEmail(currentUserEmail));

        if (days < 1 || days > 365) {
            throw new IllegalArgumentException("days must be between 1 and 365.");
        }

        LocalDateTime cutoff = LocalDate.now().minusDays(days - 1L).atStartOfDay();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (String status : ALL_STATUSES) {
            byStatus.put(status, 0L);
        }

        shipmentRepository.findByCreatedAtAfter(cutoff).forEach(s -> {
            byStatus.merge(s.getStatus(), 1L, Long::sum);
        });

        return byStatus;
    }

    @Transactional(readOnly = true)
    public DeliveryPerformanceReport getDeliveryPerformanceReport(int days, String currentUserEmail) {
        requireAdminOrSupport(getUserByEmail(currentUserEmail));

        if (days < 1 || days > 365) {
            throw new IllegalArgumentException("days must be between 1 and 365.");
        }

        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days - 1L);
        LocalDateTime cutoff = from.atStartOfDay();

        List<Shipment> createdInPeriod = shipmentRepository.findByCreatedAtAfter(cutoff);

        Map<LocalDate, List<Shipment>> byDay = createdInPeriod.stream()
                .collect(Collectors.groupingBy(s -> s.getCreatedAt().toLocalDate()));

        List<DeliveryPerformanceReport> rows = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = from.plusDays(i);
            rows.add(buildReport(byDay.getOrDefault(date, List.of()), date, date));
        }

        DeliveryPerformanceReport total = buildReport(createdInPeriod, from, today);
        total.setRows(rows);
        return total;
    }

    private DeliveryPerformanceReport buildReport(List<Shipment> shipments, LocalDate from, LocalDate to) {
        long total = shipments.size();
        long cancelled = shipments.stream().filter(s -> "CANCELLED".equals(s.getStatus())).count();
        long created = shipments.stream().filter(s -> "CREATED".equals(s.getStatus())).count();
        long pickedUp = shipments.stream().filter(s -> "PICKED_UP".equals(s.getStatus())).count();
        long atSortingFacility = shipments.stream().filter(s -> "AT_SORTING_FACILITY".equals(s.getStatus())).count();
        long inTransit = shipments.stream().filter(s -> "IN_TRANSIT".equals(s.getStatus())).count();
        long outForDelivery = shipments.stream().filter(s -> "OUT_FOR_DELIVERY".equals(s.getStatus())).count();
        long returned = shipments.stream().filter(s -> "RETURNED".equals(s.getStatus())).count();

        List<Shipment> delivered = shipments.stream()
                .filter(s -> "DELIVERED".equals(s.getStatus()) && s.getActualDeliveryTime() != null)
                .collect(Collectors.toList());

        long onTime = delivered.stream()
                .filter(s -> s.getEstimatedDeliveryTime() != null
                        && !s.getActualDeliveryTime().isAfter(s.getEstimatedDeliveryTime()))
                .count();
        long late = delivered.stream()
                .filter(s -> s.getEstimatedDeliveryTime() == null
                        || s.getActualDeliveryTime().isAfter(s.getEstimatedDeliveryTime()))
                .count();
        Double onTimeRate = delivered.isEmpty()
                ? null
                : Math.round((onTime * 100.0 / delivered.size()) * 10.0) / 10.0;

        Double avgDeliveryHours = delivered.stream()
                .filter(s -> s.getCreatedAt() != null)
                .mapToDouble(s -> Duration.between(s.getCreatedAt(), s.getActualDeliveryTime()).toMinutes() / 60.0)
                .average()
                .stream()
                .map(v -> Math.round(v * 10.0) / 10.0)
                .boxed()
                .findFirst()
                .orElse(null);

        Double avgDistanceKm = shipments.stream()
                .filter(s -> s.getTotalDistance() != null)
                .mapToDouble(Shipment::getTotalDistance)
                .average()
                .stream()
                .map(v -> Math.round(v * 10.0) / 10.0)
                .boxed()
                .findFirst()
                .orElse(null);

        return DeliveryPerformanceReport.builder()
                .periodFrom(from)
                .periodTo(to)
                .totalShipments(total)
                .delivered(delivered.size())
                .onTime(onTime)
                .late(late)
                .onTimeRate(onTimeRate)
                .avgDeliveryHours(avgDeliveryHours)
                .avgDistanceKm(avgDistanceKm)
                .cancelled(cancelled)
                .created(created)
                .pickedUp(pickedUp)
                .atSortingFacility(atSortingFacility)
                .inTransit(inTransit)
                .outForDelivery(outForDelivery)
                .returned(returned)
                .build();
    }

    public String toCsv(DeliveryPerformanceReport report) {
        StringBuilder sb = new StringBuilder();
        sb.append("Period From,Period To,Total Shipments,Delivered,On Time,Late,On Time Rate,Avg Delivery Hours,Avg Distance Km,Cancelled,Created,Picked Up,At Sorting Facility,In Transit,Out For Delivery,Returned\n");
        List<DeliveryPerformanceReport> rows = report.getRows();
        if (rows != null) {
            for (DeliveryPerformanceReport row : rows) {
                appendRow(sb, row);
            }
        }
        appendRow(sb, report);
        return sb.toString();
    }

    private void appendRow(StringBuilder sb, DeliveryPerformanceReport r) {
        sb.append(r.getPeriodFrom()).append(',')
                .append(r.getPeriodTo()).append(',')
                .append(r.getTotalShipments()).append(',')
                .append(r.getDelivered()).append(',')
                .append(r.getOnTime()).append(',')
                .append(r.getLate()).append(',')
                .append(nullToEmpty(r.getOnTimeRate())).append(',')
                .append(nullToEmpty(r.getAvgDeliveryHours())).append(',')
                .append(nullToEmpty(r.getAvgDistanceKm())).append(',')
                .append(r.getCancelled()).append(',')
                .append(r.getCreated()).append(',')
                .append(r.getPickedUp()).append(',')
                .append(r.getAtSortingFacility()).append(',')
                .append(r.getInTransit()).append(',')
                .append(r.getOutForDelivery()).append(',')
                .append(r.getReturned()).append('\n');
    }

    private String nullToEmpty(Double value) {
        return value == null ? "" : String.valueOf(value);
    }
}
