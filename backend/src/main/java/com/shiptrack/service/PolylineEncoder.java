package com.shiptrack.service;

import java.util.List;

final class PolylineEncoder {

    private PolylineEncoder() {}

    static String encode(List<double[]> coordinates) {
        if (coordinates == null || coordinates.isEmpty()) return null;
        StringBuilder result = new StringBuilder();
        long prevLat = 0;
        long prevLng = 0;
        for (double[] coord : coordinates) {
            // GeoJSON is [lng, lat], swap to [lat, lng]
            long lat = Math.round(coord[1] * 1e5);
            long lng = Math.round(coord[0] * 1e5);
            result.append(encodeSigned(lat - prevLat));
            result.append(encodeSigned(lng - prevLng));
            prevLat = lat;
            prevLng = lng;
        }
        return result.toString();
    }

    private static String encodeSigned(long value) {
        long shifted = value << 1;
        if (value < 0) shifted = ~shifted;
        StringBuilder result = new StringBuilder();
        while (shifted >= 0x20) {
            result.append((char) ((0x20 | (shifted & 0x1f)) + 63));
            shifted >>= 5;
        }
        result.append((char) (shifted + 63));
        return result.toString();
    }
}
