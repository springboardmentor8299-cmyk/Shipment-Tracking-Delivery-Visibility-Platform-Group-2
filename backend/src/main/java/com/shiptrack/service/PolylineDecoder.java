package com.shiptrack.service;

import com.shiptrack.dto.LatLng;

import java.util.ArrayList;
import java.util.List;

final class PolylineDecoder {

    private PolylineDecoder() {}

    static List<LatLng> decode(String polyline) {
        if (polyline == null || polyline.isEmpty()) return List.of();

        List<LatLng> coords = new ArrayList<>();
        int index = 0;
        int len = polyline.length();
        int lat = 0;
        int lng = 0;

        while (index < len) {
            int shift = 0;
            int result = 0;
            int b;
            do {
                b = polyline.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = polyline.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
            lng += dlng;

            coords.add(LatLng.builder()
                    .latitude(lat / 1e5)
                    .longitude(lng / 1e5)
                    .build());
        }

        return coords;
    }
}
