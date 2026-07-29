package com.shiptrack.service;

import com.shiptrack.dto.LatLng;
import com.shiptrack.dto.RouteInfo;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeocodingService {

    private static final String GEOCODE_URL =
            "https://api.geoapify.com/v1/geocode/search?text={address}&apiKey={apiKey}&limit=1";
    private static final String ROUTE_URL =
            "https://api.geoapify.com/v1/routing?waypoints={origin}&waypoints={destination}&mode=drive&apiKey={apiKey}";

    private static final String OSRM_ROUTE_URL =
            "https://router.project-osrm.org/route/v1/driving/{origin};{destination}?geometries=geojson&overview=full&alternatives=false";

    private static final String NOMINATIM_GEOCODE_URL =
            "https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1";

    @Value("${geoapify.api.key:}")
    private String apiKey;

    private RestTemplate restTemplate;
    private boolean keyValid = false;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Geoapify API key is not configured. Will fall back to Nominatim (OSM) geocoder.");
            restTemplate = new RestTemplateBuilder()
                    .defaultHeader("Accept", "application/json")
                    .defaultHeader("User-Agent", "ShipTrack-Pro/1.0")
                    .build();
            return;
        }
        restTemplate = new RestTemplateBuilder()
                .defaultHeader("Accept", "application/json")
                .build();

        try {
            Map<String, Object> test = restTemplate.getForObject(
                    GEOCODE_URL, Map.class, "test", apiKey);
            if (test != null && test.containsKey("features")) {
                keyValid = true;
                log.info("Geoapify API key validated successfully.");
            } else {
                log.warn("Geoapify API key test returned unexpected response. Will use fallback.");
            }
        } catch (Exception e) {
            log.warn("Geoapify API key validation failed: {}. Will fall back to Nominatim.", e.getMessage());
        }
    }

    public LatLng geocodeAddress(String address) {
        if (address == null || address.isBlank()) return null;

        if (keyValid) {
            LatLng result = geocodeWithGeoapify(address);
            if (result != null) return result;
            log.warn("Geoapify geocoding failed for '{}', trying fallback...", address);
        }

        return geocodeWithNominatim(address);
    }

    private LatLng geocodeWithGeoapify(String address) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    GEOCODE_URL, Map.class, address, apiKey);
            if (response == null) return null;
            List<?> features = (List<?>) response.get("features");
            if (features == null || features.isEmpty()) {
                log.warn("No Geoapify geocoding results for address: {}", address);
                return null;
            }
            Map<?, ?> first = (Map<?, ?>) features.get(0);
            Map<?, ?> props = (Map<?, ?>) first.get("properties");
            Number lat = (Number) props.get("lat");
            Number lon = (Number) props.get("lon");
            if (lat == null || lon == null) return null;
            return LatLng.builder()
                    .latitude(lat.doubleValue())
                    .longitude(lon.doubleValue())
                    .build();
        } catch (Exception e) {
            log.error("Geoapify geocoding failed for address: {}", address, e);
            return null;
        }
    }

    private LatLng geocodeWithNominatim(String address) {
        try {
            RestTemplate nomRest = new RestTemplateBuilder()
                    .defaultHeader("User-Agent", "ShipTrack-Pro/1.0")
                    .build();

            List<Map<String, Object>> response = nomRest.exchange(
                    NOMINATIM_GEOCODE_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {},
                    address
            ).getBody();

            if (response == null || response.isEmpty()) {
                log.warn("No Nominatim results for address: {}", address);
                return null;
            }

            Map<String, Object> first = response.get(0);
            String latStr = (String) first.get("lat");
            String lonStr = (String) first.get("lon");
            if (latStr == null || lonStr == null) return null;

            log.info("Nominatim geocoded '{}' -> ({}, {})", address, latStr, lonStr);
            return LatLng.builder()
                    .latitude(Double.parseDouble(latStr))
                    .longitude(Double.parseDouble(lonStr))
                    .build();
        } catch (Exception e) {
            log.error("Nominatim geocoding failed for address: {}", address, e);
            return null;
        }
    }

    public RouteInfo calculateRoute(LatLng origin, LatLng destination) {
        RouteInfo result = null;

        if (keyValid) {
            result = routeWithGeoapify(origin, destination);
            if (result != null) return result;
            log.warn("Geoapify routing failed, trying OSRM fallback...");
        }

        result = routeWithOsrm(origin, destination);
        if (result != null) return result;

        log.warn("All routing providers failed for ({},{}) -> ({},{})",
                origin.getLatitude(), origin.getLongitude(),
                destination.getLatitude(), destination.getLongitude());
        return null;
    }

    private RouteInfo routeWithGeoapify(LatLng origin, LatLng destination) {
        try {
            String originStr = origin.getLatitude() + "," + origin.getLongitude();
            String destStr = destination.getLatitude() + "," + destination.getLongitude();

            Map<String, Object> response = restTemplate.getForObject(
                    ROUTE_URL, Map.class, originStr, destStr, apiKey);
            if (response == null) return null;

            List<?> features = (List<?>) response.get("features");
            if (features == null || features.isEmpty()) {
                log.warn("No Geoapify route found");
                return null;
            }

            Map<?, ?> first = (Map<?, ?>) features.get(0);
            Map<?, ?> props = (Map<?, ?>) first.get("properties");
            Number distance = (Number) props.get("distance");
            Number time = (Number) props.get("time");

            String polyline = null;
            Map<?, ?> geometry = (Map<?, ?>) first.get("geometry");
            if (geometry != null) {
                polyline = coordsToPolyline((List<?>) geometry.get("coordinates"));
            }

            return RouteInfo.builder()
                    .distanceKm(distance.doubleValue() / 1000.0)
                    .durationMin((long) (time.doubleValue() / 60.0))
                    .polylinePoints(polyline)
                    .build();
        } catch (Exception e) {
            log.error("Geoapify routing failed", e);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private RouteInfo routeWithOsrm(LatLng origin, LatLng destination) {
        try {
            String originStr = origin.getLongitude() + "," + origin.getLatitude();
            String destStr = destination.getLongitude() + "," + destination.getLatitude();

            Map<String, Object> response = new RestTemplateBuilder()
                    .defaultHeader("User-Agent", "ShipTrack-Pro/1.0")
                    .build()
                    .getForObject(OSRM_ROUTE_URL, Map.class, originStr, destStr);

            if (response == null || !"Ok".equals(response.get("code"))) return null;

            List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");
            if (routes == null || routes.isEmpty()) return null;

            Map<String, Object> route = routes.get(0);
            Number distance = (Number) route.get("distance");
            Number time = (Number) route.get("duration");

            Map<String, Object> geometry = (Map<String, Object>) route.get("geometry");
            String polyline = null;
            if (geometry != null) {
                polyline = coordsToPolyline((List<?>) geometry.get("coordinates"));
            }

            log.info("OSRM route found: {} km, {} min",
                    String.format("%.1f", distance.doubleValue() / 1000.0),
                    Math.round(time.doubleValue() / 60.0));

            return RouteInfo.builder()
                    .distanceKm(distance.doubleValue() / 1000.0)
                    .durationMin((long) (time.doubleValue() / 60.0))
                    .polylinePoints(polyline)
                    .build();
        } catch (Exception e) {
            log.warn("OSRM routing failed", e);
            return null;
        }
    }

    private String coordsToPolyline(List<?> coords) {
        if (coords == null || coords.isEmpty()) return null;
        return PolylineEncoder.encode(
                coords.stream().map(c -> {
                    List<?> point = (List<?>) c;
                    return new double[]{
                            ((Number) point.get(0)).doubleValue(),
                            ((Number) point.get(1)).doubleValue()
                    };
                }).toList());
    }

    public Long calculateDuration(LatLng origin, LatLng destination) {
        RouteInfo route = calculateRoute(origin, destination);
        return route != null ? route.getDurationMin() : null;
    }
}
