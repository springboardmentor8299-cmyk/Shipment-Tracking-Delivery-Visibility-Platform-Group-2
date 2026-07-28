package com.shiptrack.admin.shipment.service;

import com.shiptrack.admin.shipment.dto.GeoapifyGeocodeResponse;
import com.shiptrack.admin.shipment.dto.GeoapifyRoutingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeoapifyService {

    @Value("${geoapify.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calculates distance (in km) and duration (in minutes) between current
     * location and destination.
     * Geoapify Routing API format: mode=drive&waypoints=lat,lon|lat,lon
     *
     * Returns a RouteMetrics with null values when the inputs are incomplete or the
     * API call fails —
     * callers MUST treat null as "unknown", never as "0 km / arrived". Silently
     * substituting 0.0 here
     * previously caused shipments with missing coordinates to be auto-marked
     * DELIVERED immediately.
     */
    public RouteMetrics calculateRouteMetrics(Double currentLat, Double currentLon, Double destLat, Double destLon) {
        if (currentLat == null || currentLon == null || destLat == null || destLon == null) {
            return new RouteMetrics(null, null);
        }

        String url = String.format(
                "https://api.geoapify.com/v1/routing?waypoints=%f,%f|%f,%f&mode=drive&apiKey=%s",
                currentLat, currentLon, destLat, destLon, apiKey);

        try {
            GeoapifyRoutingResponse response = restTemplate.getForObject(url, GeoapifyRoutingResponse.class);
            if (response != null && response.getFeatures() != null && !response.getFeatures().isEmpty()) {
                var properties = response.getFeatures().get(0).getProperties();

                double distanceKm = properties.getDistance() / 1000.0; // convert meters to km
                double durationMinutes = properties.getTime() / 60.0; // convert seconds to minutes

                return new RouteMetrics(distanceKm, durationMinutes);
            }
        } catch (Exception e) {
            System.err.println("Geoapify routing API error: " + e.getMessage());
        }

        return new RouteMetrics(null, null);
    }

    /**
     * Forward-geocodes a human-readable address (e.g. "Chennai, India") into
     * [latitude, longitude].
     * Returns null if the address can't be resolved or the API call fails.
     */
    public double[] forwardGeocode(String address) {
        if (address == null || address.isBlank()) {
            return null;
        }

        String url = String.format(
                "https://api.geoapify.com/v1/geocode/search?text=%s&apiKey=%s",
                java.net.URLEncoder.encode(address, java.nio.charset.StandardCharsets.UTF_8),
                apiKey);

        try {
            GeoapifyGeocodeResponse response = restTemplate.getForObject(url, GeoapifyGeocodeResponse.class);
            if (response != null && response.getFeatures() != null && !response.getFeatures().isEmpty()) {
                var coordinates = response.getFeatures().get(0).getGeometry().getCoordinates();
                if (coordinates != null && coordinates.size() >= 2) {
                    double lon = coordinates.get(0);
                    double lat = coordinates.get(1);
                    return new double[] { lat, lon };
                }
            }
        } catch (Exception e) {
            System.err.println("Geoapify geocode API error: " + e.getMessage());
        }

        return null;
    }

    public record RouteMetrics(Double distanceKm, Double durationMinutes) {
    }
}