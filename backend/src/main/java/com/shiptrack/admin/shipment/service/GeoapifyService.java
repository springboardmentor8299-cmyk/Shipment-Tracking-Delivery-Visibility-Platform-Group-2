package com.shiptrack.admin.shipment.service;

import com.shiptrack.admin.shipment.dto.GeoapifyGeocodeResponse;
import com.shiptrack.admin.shipment.dto.GeoapifyRoutingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
public class GeoapifyService {

    @Value("${geoapify.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private void logGeoapifyFailure(String context, Exception e) {
        if (e instanceof HttpStatusCodeException httpEx) {
            System.err.println("Geoapify " + context + " error: HTTP " + httpEx.getStatusCode()
                    + " — " + httpEx.getResponseBodyAsString());
        } else {
            System.err.println("Geoapify " + context + " error: " + e.getMessage());
        }
    }

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
            logGeoapifyFailure("routing", e);
        }

        return new RouteMetrics(null, null);
    }

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
            logGeoapifyFailure("geocode", e);
        }

        return null;
    }

    public record RouteMetrics(Double distanceKm, Double durationMinutes) {
    }

    public RouteMetrics calculateRouteMetrics(Double originLatitude, Double originLongitude,
            Double destinationLatitude, Double destinationLongitude, String geoapifyType) {
        if (originLatitude == null || originLongitude == null
                || destinationLatitude == null || destinationLongitude == null) {
            return new RouteMetrics(null, null);
        }

        String typeParam = (geoapifyType == null || geoapifyType.isBlank()) ? "" : "&type=" + geoapifyType;

        String url = String.format(
                "https://api.geoapify.com/v1/routing?waypoints=%f,%f|%f,%f&mode=drive%s&apiKey=%s",
                originLatitude, originLongitude, destinationLatitude, destinationLongitude, typeParam, apiKey);

        try {
            GeoapifyRoutingResponse response = restTemplate.getForObject(url, GeoapifyRoutingResponse.class);
            if (response != null && response.getFeatures() != null && !response.getFeatures().isEmpty()) {
                var properties = response.getFeatures().get(0).getProperties();

                double distanceKm = properties.getDistance() / 1000.0;
                double durationMinutes = properties.getTime() / 60.0;

                return new RouteMetrics(distanceKm, durationMinutes);
            }
        } catch (Exception e) {
            logGeoapifyFailure("routing (type=" + geoapifyType + ")", e);
        }

        return new RouteMetrics(null, null);
    }
}