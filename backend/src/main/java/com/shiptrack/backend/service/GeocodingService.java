package com.shiptrack.backend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class GeocodingService {

    // Pre-configured accurate coordinates for major Indian cities & states
    private static final Map<String, double[]> KNOWN_LOCATIONS = new HashMap<>();

    static {
        // Cities & Tech Hubs
        KNOWN_LOCATIONS.put("delhi", new double[]{28.6139, 77.2090});
        KNOWN_LOCATIONS.put("new delhi", new double[]{28.6139, 77.2090});
        KNOWN_LOCATIONS.put("mumbai", new double[]{19.0760, 72.8777});
        KNOWN_LOCATIONS.put("bengaluru", new double[]{12.9716, 77.5946});
        KNOWN_LOCATIONS.put("bangalore", new double[]{12.9716, 77.5946});
        KNOWN_LOCATIONS.put("koramangala", new double[]{12.9352, 77.6245});
        KNOWN_LOCATIONS.put("whitefield", new double[]{12.9698, 77.7500});
        KNOWN_LOCATIONS.put("chennai", new double[]{13.0827, 80.2707});
        KNOWN_LOCATIONS.put("anna nagar", new double[]{13.0850, 80.2100});
        KNOWN_LOCATIONS.put("hyderabad", new double[]{17.3850, 78.4867});
        KNOWN_LOCATIONS.put("hitech city", new double[]{17.4435, 78.3772});
        KNOWN_LOCATIONS.put("kolkata", new double[]{22.5726, 88.3639});
        KNOWN_LOCATIONS.put("salt lake", new double[]{22.5867, 88.4171});
        KNOWN_LOCATIONS.put("pune", new double[]{18.5204, 73.8567});
        KNOWN_LOCATIONS.put("kochi", new double[]{9.9312, 76.2673});
        KNOWN_LOCATIONS.put("goa", new double[]{15.2993, 74.1240});
        KNOWN_LOCATIONS.put("panaji", new double[]{15.4909, 73.8278});
        KNOWN_LOCATIONS.put("ahmedabad", new double[]{23.0225, 72.5714});
        KNOWN_LOCATIONS.put("jaipur", new double[]{26.9124, 75.7873});

        // States
        KNOWN_LOCATIONS.put("kerala", new double[]{10.8505, 76.2711});
        KNOWN_LOCATIONS.put("tamil nadu", new double[]{11.1271, 78.6569});
        KNOWN_LOCATIONS.put("karnataka", new double[]{15.3173, 75.7139});
        KNOWN_LOCATIONS.put("maharashtra", new double[]{19.7515, 75.7139});
        KNOWN_LOCATIONS.put("west bengal", new double[]{22.9868, 87.8550});
        KNOWN_LOCATIONS.put("telangana", new double[]{18.1124, 79.0193});
        KNOWN_LOCATIONS.put("andhra pradesh", new double[]{15.9129, 79.7400});
        KNOWN_LOCATIONS.put("gujarat", new double[]{22.2587, 71.1924});
    }

    public double[] geocodeAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return new double[]{28.6139, 77.2090}; // Default Delhi Hub
        }

        String normalized = address.toLowerCase();

        // Search known location map
        for (Map.Entry<String, double[]> entry : KNOWN_LOCATIONS.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                System.out.println("[Geocoding Service] Address '" + address + "' matched known location: " + entry.getKey() + " -> [" + entry.getValue()[0] + ", " + entry.getValue()[1] + "]");
                return entry.getValue();
            }
        }

        // Fallback for general addresses: hash string into a deterministic spread across India
        int hash = Math.abs(address.hashCode());
        double lat = 8.0 + (hash % 2200) / 100.0;     // Lat between 8.0 N and 30.0 N (India bounds)
        double lng = 68.0 + ((hash / 2200) % 220) / 10.0; // Lng between 68.0 E and 90.0 E (India bounds)
        System.out.println("[Geocoding Service] Address '" + address + "' generated deterministic coordinates -> [" + lat + ", " + lng + "]");
        return new double[]{lat, lng};
    }
}
