package com.shiptrack.admin.route.service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.shiptrack.activity.service.ActivityService;
import com.shiptrack.admin.route.dto.DistanceCalculationResponse;
import com.shiptrack.admin.route.dto.RouteAnalyticsResponse;
import com.shiptrack.admin.route.dto.RoutePlanRequest;
import com.shiptrack.admin.route.entity.Route;
import com.shiptrack.admin.route.entity.RouteStatus;
import com.shiptrack.admin.route.entity.TrafficCondition;
import com.shiptrack.admin.route.repository.RouteRepository;
import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.admin.shipment.service.GeoapifyService;
import com.shiptrack.admin.shipment.service.GeoapifyService.RouteMetrics;

@Service
public class RouteService {

    private final RouteRepository routeRepository;
    private final GeoapifyService geoapifyService;
    private final ShipmentRepository shipmentRepository;
    private final ActivityService activityService;

    public RouteService(RouteRepository routeRepository, GeoapifyService geoapifyService,
            ShipmentRepository shipmentRepository, ActivityService activityService) {
        this.routeRepository = routeRepository;
        this.geoapifyService = geoapifyService;
        this.shipmentRepository = shipmentRepository;
        this.activityService = activityService;
    }

    public Route planRoute(RoutePlanRequest request, String createdBy) {
        if (request.getOrigin() == null || request.getOrigin().isBlank()
                || request.getDestination() == null || request.getDestination().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Origin and destination are required");
        }

        double[] originCoords = geoapifyService.forwardGeocode(request.getOrigin());
        double[] destCoords = geoapifyService.forwardGeocode(request.getDestination());

        if (originCoords == null || destCoords == null) {
            String which = originCoords == null && destCoords == null
                    ? "origin (\"" + request.getOrigin() + "\") and destination (\"" + request.getDestination() + "\")"
                    : originCoords == null
                            ? "origin (\"" + request.getOrigin() + "\")"
                            : "destination (\"" + request.getDestination() + "\")";
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Could not resolve the " + which + ". If this address looks correct, the geocoding "
                            + "service (Geoapify) may be unreachable, rate-limited, or misconfigured — "
                            + "check the backend logs for the exact \"Geoapify geocode API error\" line.");
        }

        RouteMetrics metrics = geoapifyService.calculateRouteMetrics(
                originCoords[0], originCoords[1], destCoords[0], destCoords[1]);

        double straightLineKm = haversineDistanceKm(
                originCoords[0], originCoords[1], destCoords[0], destCoords[1]);

        String routeCode = generateRouteCode();
        LocalDateTime now = LocalDateTime.now();
        TrafficCondition traffic = computeTrafficCondition(now, routeCode);

        Double durationMinutes = metrics.durationMinutes();
        Double trafficAdjusted = durationMinutes != null
                ? durationMinutes * trafficMultiplier(traffic)
                : null;

        Route route = Route.builder()
                .routeCode(routeCode)
                .routeName(blankToNull(request.getRouteName()))
                .origin(request.getOrigin())
                .originLatitude(originCoords[0])
                .originLongitude(originCoords[1])
                .destination(request.getDestination())
                .destinationLatitude(destCoords[0])
                .destinationLongitude(destCoords[1])
                .distanceKm(metrics.distanceKm())
                .durationMinutes(durationMinutes)
                .straightLineDistanceKm(straightLineKm)
                .optimized(false)
                .trafficCondition(traffic)
                .trafficAdjustedDurationMinutes(trafficAdjusted)
                .trafficUpdatedAt(now)
                .status(RouteStatus.PLANNED)
                .assignedTrackingId(blankToNull(request.getAssignedTrackingId()))
                .createdBy(createdBy)
                .createdAt(now)
                .notes(blankToNull(request.getNotes()))
                .build();

        Route saved = routeRepository.save(route);
        syncShipmentIfLinked(saved, "planned");
        return saved;
    }

    public Route optimizeRoute(Long id, String strategy) {
        Route route = getRouteOrThrow(id);

        if (route.getOriginLatitude() == null || route.getDestinationLatitude() == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Route is missing coordinates and cannot be optimized");
        }

        String normalizedStrategy = (strategy == null || strategy.isBlank())
                ? "SHORTEST"
                : strategy.trim().toUpperCase();

        String geoapifyType = switch (normalizedStrategy) {
            case "FEWER_TURNS" -> "less_maneuvers";
            case "BALANCED" -> "balanced";
            default -> "short";
        };

        RouteMetrics optimized = geoapifyService.calculateRouteMetrics(
                route.getOriginLatitude(), route.getOriginLongitude(),
                route.getDestinationLatitude(), route.getDestinationLongitude(),
                geoapifyType);

        boolean usedFallback = false;
        if (optimized.distanceKm() == null) {
            optimized = geoapifyService.calculateRouteMetrics(
                    route.getOriginLatitude(), route.getOriginLongitude(),
                    route.getDestinationLatitude(), route.getDestinationLongitude());
            usedFallback = true;
        }

        if (optimized.distanceKm() == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Routing service could not calculate an optimized route right now. "
                            + "Check the backend logs for the exact Geoapify error (bad/missing API key, "
                            + "rate limit, or unsupported request).");
        }

        Double baselineDistance = route.getDistanceKm();
        Double savingsPercent = (baselineDistance != null && baselineDistance > 0)
                ? ((baselineDistance - optimized.distanceKm()) / baselineDistance) * 100.0
                : null;

        route.setOptimized(true);
        route.setOptimizationStrategy(
                usedFallback ? normalizedStrategy + " (fallback: default routing)" : normalizedStrategy);
        route.setOptimizedDistanceKm(optimized.distanceKm());
        route.setOptimizedDurationMinutes(optimized.durationMinutes());
        route.setOptimizationSavingsPercent(savingsPercent);

        Route saved = routeRepository.save(route);
        syncShipmentIfLinked(saved, "optimized");
        return saved;
    }

    public List<Route> getHistory() {
        return routeRepository.findByStatusIn(List.of(RouteStatus.COMPLETED, RouteStatus.ARCHIVED));
    }

    public List<Route> getAllRoutes(RouteStatus statusFilter) {
        if (statusFilter != null) {
            return routeRepository.findByStatus(statusFilter);
        }
        return routeRepository.findAllByOrderByCreatedAtDesc();
    }

    public Route getRoute(Long id) {
        return getRouteOrThrow(id);
    }

    public Route updateStatus(Long id, RouteStatus newStatus) {
        Route route = getRouteOrThrow(id);
        route.setStatus(newStatus);
        if (newStatus == RouteStatus.COMPLETED) {
            route.setCompletedAt(LocalDateTime.now());
        }
        return routeRepository.save(route);
    }

    public void deleteRoute(Long id) {
        Route route = getRouteOrThrow(id);
        routeRepository.delete(route);
    }

    public DistanceCalculationResponse calculateDistance(String origin, String destination) {
        if (origin == null || origin.isBlank() || destination == null || destination.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Origin and destination are required");
        }

        double[] originCoords = geoapifyService.forwardGeocode(origin);
        double[] destCoords = geoapifyService.forwardGeocode(destination);

        if (originCoords == null || destCoords == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Could not resolve one or both addresses");
        }

        RouteMetrics metrics = geoapifyService.calculateRouteMetrics(
                originCoords[0], originCoords[1], destCoords[0], destCoords[1]);

        double straightLineKm = haversineDistanceKm(
                originCoords[0], originCoords[1], destCoords[0], destCoords[1]);

        return DistanceCalculationResponse.builder()
                .origin(origin)
                .originLatitude(originCoords[0])
                .originLongitude(originCoords[1])
                .destination(destination)
                .destinationLatitude(destCoords[0])
                .destinationLongitude(destCoords[1])
                .drivingDistanceKm(metrics.distanceKm())
                .drivingDurationMinutes(metrics.durationMinutes())
                .straightLineDistanceKm(straightLineKm)
                .build();
    }

    public Route refreshTraffic(Long id) {
        Route route = getRouteOrThrow(id);

        LocalDateTime now = LocalDateTime.now();
        TrafficCondition traffic = computeTrafficCondition(now, route.getRouteCode());

        Double baseDuration = route.getOptimized() != null && route.getOptimized()
                ? route.getOptimizedDurationMinutes()
                : route.getDurationMinutes();

        route.setTrafficCondition(traffic);
        route.setTrafficAdjustedDurationMinutes(
                baseDuration != null ? baseDuration * trafficMultiplier(traffic) : null);
        route.setTrafficUpdatedAt(now);

        Route saved = routeRepository.save(route);
        syncShipmentIfLinked(saved, "traffic refreshed");
        return saved;
    }

    private TrafficCondition computeTrafficCondition(LocalDateTime at, String routeSeed) {
        boolean isWeekend = at.getDayOfWeek() == DayOfWeek.SATURDAY || at.getDayOfWeek() == DayOfWeek.SUNDAY;
        int hour = at.getHour();
        boolean isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
        boolean isMidday = hour >= 11 && hour <= 16;

        int baseScore;
        if (isWeekend) {
            baseScore = isMidday ? 45 : 20;
        } else if (isRushHour) {
            baseScore = 65;
        } else if (isMidday) {
            baseScore = 40;
        } else {
            baseScore = 20;
        }

        long seed = Objects.hash(routeSeed, at.toLocalDate(), hour);
        int jitter = new Random(seed).nextInt(45); // 0-44, deterministic per route+hour

        int score = baseScore + jitter;

        if (score >= 75)
            return TrafficCondition.HEAVY;
        if (score >= 45)
            return TrafficCondition.MODERATE;
        return TrafficCondition.LIGHT;
    }

    private double trafficMultiplier(TrafficCondition condition) {
        return switch (condition) {
            case HEAVY -> 1.45;
            case MODERATE -> 1.15;
            case LIGHT -> 1.0;
            default -> 1.1;
        };
    }

    public RouteAnalyticsResponse getAnalytics() {
        List<Route> allRoutes = routeRepository.findAll();

        long total = allRoutes.size();
        long planned = countByStatus(allRoutes, RouteStatus.PLANNED);
        long active = countByStatus(allRoutes, RouteStatus.ACTIVE);
        long completed = countByStatus(allRoutes, RouteStatus.COMPLETED);
        long archived = countByStatus(allRoutes, RouteStatus.ARCHIVED);
        long cancelled = countByStatus(allRoutes, RouteStatus.CANCELLED);

        List<Double> distances = allRoutes.stream()
                .map(Route::getDistanceKm)
                .filter(d -> d != null)
                .toList();

        List<Double> durations = allRoutes.stream()
                .map(Route::getDurationMinutes)
                .filter(d -> d != null)
                .toList();

        Double avgDistance = average(distances);
        Double avgDuration = average(durations);
        Double totalDistance = distances.stream().mapToDouble(Double::doubleValue).sum();

        List<Route> optimizedRoutes = allRoutes.stream()
                .filter(r -> Boolean.TRUE.equals(r.getOptimized()) && r.getOptimizationSavingsPercent() != null)
                .toList();

        Double avgSavings = average(
                optimizedRoutes.stream().map(Route::getOptimizationSavingsPercent).toList());

        Map<String, Long> trafficBreakdown = new LinkedHashMap<>();
        for (TrafficCondition condition : TrafficCondition.values()) {
            long count = allRoutes.stream()
                    .filter(r -> r.getTrafficCondition() == condition)
                    .count();
            trafficBreakdown.put(condition.name(), count);
        }

        RouteAnalyticsResponse.RouteSummary longest = allRoutes.stream()
                .filter(r -> r.getDistanceKm() != null)
                .max(Comparator.comparingDouble(Route::getDistanceKm))
                .map(this::toSummary)
                .orElse(null);

        RouteAnalyticsResponse.RouteSummary shortest = allRoutes.stream()
                .filter(r -> r.getDistanceKm() != null)
                .min(Comparator.comparingDouble(Route::getDistanceKm))
                .map(this::toSummary)
                .orElse(null);

        return RouteAnalyticsResponse.builder()
                .totalRoutes(total)
                .plannedCount(planned)
                .activeCount(active)
                .completedCount(completed)
                .archivedCount(archived)
                .cancelledCount(cancelled)
                .averageDistanceKm(avgDistance)
                .averageDurationMinutes(avgDuration)
                .totalDistanceKm(totalDistance)
                .optimizedRouteCount(optimizedRoutes.size())
                .averageOptimizationSavingsPercent(avgSavings)
                .trafficBreakdown(trafficBreakdown)
                .longestRoute(longest)
                .shortestRoute(shortest)
                .build();
    }

    // Helpers
    private RouteAnalyticsResponse.RouteSummary toSummary(Route route) {
        return RouteAnalyticsResponse.RouteSummary.builder()
                .routeCode(route.getRouteCode())
                .origin(route.getOrigin())
                .destination(route.getDestination())
                .distanceKm(route.getDistanceKm())
                .build();
    }

    private long countByStatus(List<Route> routes, RouteStatus status) {
        return routes.stream().filter(r -> r.getStatus() == status).count();
    }

    private Double average(List<Double> values) {
        if (values == null || values.isEmpty())
            return null;
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private void syncShipmentIfLinked(Route route, String actionLabel) {
        String trackingId = route.getAssignedTrackingId();
        if (trackingId == null || trackingId.isBlank()) {
            route.setShipmentSynced(false);
            route.setShipmentSyncMessage("No shipment linked (no tracking ID on this route)");
            return;
        }

        Shipment shipment = shipmentRepository.findByTrackingId(trackingId).orElse(null);
        if (shipment == null) {
            route.setShipmentSynced(false);
            route.setShipmentSyncMessage("Tracking ID " + trackingId + " not found — nothing synced");
            return;
        }

        boolean useOptimized = Boolean.TRUE.equals(route.getOptimized())
                && route.getOptimizedDistanceKm() != null;

        Double distanceKm = useOptimized ? route.getOptimizedDistanceKm() : route.getDistanceKm();

        Double baseDuration = useOptimized && route.getOptimizedDurationMinutes() != null
                ? route.getOptimizedDurationMinutes()
                : route.getDurationMinutes();

        Double etaDuration = route.getTrafficAdjustedDurationMinutes() != null
                ? route.getTrafficAdjustedDurationMinutes()
                : baseDuration;

        LocalDateTime now = LocalDateTime.now();

        if (distanceKm != null) {
            shipment.setRemainingDistance(distanceKm);
        }
        if (etaDuration != null) {
            shipment.setEstimatedDeliveryTime(now.plusMinutes(Math.round(etaDuration)));
        }
        shipment.setLastLocationUpdate(now);

        shipmentRepository.save(shipment);

        route.setShipmentSynced(true);
        route.setShipmentSyncMessage(
                "Shipment " + trackingId + " updated (route " + actionLabel + ")");

        StringBuilder details = new StringBuilder("Route ")
                .append(route.getRouteCode())
                .append(" ").append(actionLabel)
                .append(" → synced to shipment ").append(trackingId);

        if (distanceKm != null || etaDuration != null) {
            details.append(" (");
            if (distanceKm != null) {
                details.append(String.format("%.1f km", distanceKm));
            }
            if (etaDuration != null) {
                if (distanceKm != null)
                    details.append(", ");
                details.append(String.format("ETA %.0f min", etaDuration));
            }
            details.append(")");
        }

        activityService.save(
                route.getCreatedBy() != null ? route.getCreatedBy() : "system",
                "ROUTE_SHIPMENT_SYNC",
                details.toString());
    }

    private Route getRouteOrThrow(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Route not found: " + id));
    }

    private String generateRouteCode() {
        return "RT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    private double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

}