import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import polyline from "@mapbox/polyline";

const truckIcon = L.divIcon({
  className: "",
  html: `<div class="truck-icon" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <img src="/images/delivery-truck.png" width="28" height="28" style="display:block;pointer-events:none" />
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const originIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:14px;color:#fff;font-weight:bold">S</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  tooltipAnchor: [0, -20],
});

const destIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:14px;color:#fff;font-weight:bold">R</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  tooltipAnchor: [0, -20],
});

function setTruckFacing(marker, truckLng, destLng) {
  if (!marker) return;
  const el = marker.getElement();
  if (el) {
    const div = el.querySelector(".truck-icon");
    if (div) {
      div.style.transform = destLng >= truckLng ? "scaleX(1)" : "scaleX(-1)";
    }
  }
}

function haversineDist(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function interpolateAlongPolyline(coords, progress) {
  if (!coords || coords.length === 0) return null;
  if (coords.length === 1 || progress <= 0) return coords[0];
  if (progress >= 1) return coords[coords.length - 1];

  const distances = [0];
  for (let i = 1; i < coords.length; i++) {
    distances.push(distances[i - 1] + haversineDist(coords[i - 1], coords[i]));
  }

  const totalDist = distances[distances.length - 1];
  if (totalDist <= 0) return coords[0];

  const targetDist = totalDist * progress;

  for (let i = 1; i < coords.length; i++) {
    if (distances[i] >= targetDist) {
      const segDist = distances[i] - distances[i - 1];
      const segProgress =
        segDist > 0 ? (targetDist - distances[i - 1]) / segDist : 0;
      return [
        coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * segProgress,
        coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * segProgress,
      ];
    }
  }

  return coords[coords.length - 1];
}

function LiveTrackingMap({
  origin,
  destination,
  currentLocation,
  routePolyline,
  historyPoints,
  originLabel,
  destLabel,
  originAddress,
  destAddress,
  distanceKm,
  durationMin,
  createdAt,
  status,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const routeRef = useRef(null);
  const historyRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const animationRef = useRef(null);
  const prevLocationRef = useRef(null);
  const initializedRef = useRef(false);

  const [progress, setProgress] = useState(null);

  const hasCoordinates = origin || destination;

  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (!hasCoordinates) return;

    const map = L.map(mapRef.current, {
      zoom: 8,
      center: origin
        ? [origin.latitude, origin.longitude]
        : [destination.latitude, destination.longitude],
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      routeRef.current = null;
      originMarkerRef.current = null;
      destMarkerRef.current = null;
      initializedRef.current = false;
      prevLocationRef.current = null;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (initializedRef.current) return;

    let lat, lng;

    if (currentLocation) {
      lat = currentLocation.latitude;
      lng = currentLocation.longitude;
      prevLocationRef.current = currentLocation;
    } else if (
      createdAt &&
      durationMin &&
      origin &&
      destination &&
      routePolyline
    ) {
      const isActive =
        status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY";
      if (isActive) {
        try {
          const coords = polyline.decode(routePolyline);
          const elapsed = Date.now() - new Date(createdAt).getTime();
          const totalMs = durationMin * 60 * 1000;
          const p = Math.min(elapsed / totalMs, 0.99);
          const pos = interpolateAlongPolyline(coords, p);
          if (pos) {
            lat = pos[0];
            lng = pos[1];
            setProgress(p);
          }
        } catch (e) {
          console.warn("Failed to compute time-based position", e);
        }
      }
    }

    if (lat !== undefined && lng !== undefined) {
      const pos = [lat, lng];
      markerRef.current = L.marker(pos, { icon: truckIcon }).addTo(map);
      if (destination) {
        setTimeout(() => setTruckFacing(markerRef.current, lng, destination.longitude), 0);
      }
      map.panTo(pos);
      if (!currentLocation) {
        map.setZoom(10);
      } else {
        map.setZoom(12);
      }
      initializedRef.current = true;
    }
  }, [origin, destination, currentLocation, routePolyline, createdAt, durationMin, status]);

  const animateTo = useCallback((targetLat, targetLng) => {
    const marker = markerRef.current;
    if (!marker || !mapInstanceRef.current) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const startPos = marker.getLatLng();
    const startLat = startPos.lat;
    const startLng = startPos.lng;

    if (destination) {
      const currentDistToDest = haversineDist([startLat, startLng], [destination.latitude, destination.longitude]);
      const targetDistToDest = haversineDist([targetLat, targetLng], [destination.latitude, destination.longitude]);
      if (targetDistToDest > currentDistToDest + 0.1) {
        marker.setLatLng([targetLat, targetLng]);
        return;
      }
    }

    const dist = haversineDist([startLat, startLng], [targetLat, targetLng]);
    if (dist < 0.01) {
      marker.setLatLng([targetLat, targetLng]);
      return;
    }

    const duration = Math.min(Math.max(dist / 50 * 1000, 800), 3000);
    if (destination) {
      setTruckFacing(markerRef.current, targetLng, destination.longitude);
    }
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const lat = startLat + (targetLat - startLat) * ease;
      const lng = startLng + (targetLng - startLng) * ease;

      marker.setLatLng([lat, lng]);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        animationRef.current = null;
        mapInstanceRef.current.panTo([targetLat, targetLng]);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (!currentLocation || !markerRef.current) return;
    if (!initializedRef.current) return;

    const prev = prevLocationRef.current;
    if (
      prev &&
      prev.latitude === currentLocation.latitude &&
      prev.longitude === currentLocation.longitude
    ) {
      return;
    }

    animateTo(currentLocation.latitude, currentLocation.longitude);
    prevLocationRef.current = currentLocation;
  }, [currentLocation, animateTo]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (originMarkerRef.current) {
      map.removeLayer(originMarkerRef.current);
      originMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    if (origin) {
      const marker = L.marker([origin.latitude, origin.longitude], {
        icon: originIcon,
      })
        .addTo(map)
        .bindTooltip("Sender", { direction: "top" });
      if (originLabel || originAddress) {
        marker.bindPopup(
          `<strong>${originLabel || "Sender"}</strong><br/>${
            originAddress || ""
          }`
        );
      }
      originMarkerRef.current = marker;
    }

    if (destination) {
      const marker = L.marker([destination.latitude, destination.longitude], {
        icon: destIcon,
      })
        .addTo(map)
        .bindTooltip("Receiver", { direction: "top" });
      if (destLabel || destAddress) {
        marker.bindPopup(
          `<strong>${destLabel || "Receiver"}</strong><br/>${
            destAddress || ""
          }`
        );
      }
      destMarkerRef.current = marker;
    }

    if (!initializedRef.current) {
      const bounds = L.latLngBounds();
      if (origin) bounds.extend([origin.latitude, origin.longitude]);
      if (destination)
        bounds.extend([destination.latitude, destination.longitude]);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    }
  }, [origin, destination, originLabel, destLabel, originAddress, destAddress]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeRef.current) {
      map.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    if (routePolyline) {
      try {
        const coords = polyline.decode(routePolyline);
        routeRef.current = L.polyline(coords, {
          color: "#0F4C81",
          weight: 5,
          opacity: 0.85,
          dashArray: null,
        }).addTo(map);
      } catch (e) {
        console.warn("Failed to decode route polyline", e);
      }
    }
  }, [routePolyline]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (historyRef.current) {
      map.removeLayer(historyRef.current);
      historyRef.current = null;
    }

    if (historyPoints && historyPoints.length > 1) {
      const coords = historyPoints
        .map((p) => [p.latitude, p.longitude])
        .filter(([lat, lng]) => lat != null && lng != null);
      if (coords.length > 1) {
        historyRef.current = L.polyline(coords, {
          color: "#64748B",
          weight: 3,
          opacity: 0.8,
          dashArray: "6 8",
        }).addTo(map);
      }
    }
  }, [historyPoints]);

  useEffect(() => {
    if (status === "DELIVERED") {
      setProgress(1);
      return;
    }
    if (!createdAt || !durationMin) return;

    const update = () => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      const totalMs = durationMin * 60 * 1000;
      setProgress(Math.min(elapsed / totalMs, 1));
    };

    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [createdAt, durationMin, status]);

  const progressPct =
    progress !== null ? Math.round(progress * 100) : null;

  if (!hasCoordinates) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: 300,
          height: "50vh",
          borderRadius: 12,
          background: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          color: "#6c757d",
        }}
      >
        <i className="bi bi-geo-alt" style={{ fontSize: 48 }} />
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          Location data not available
        </div>
        <div style={{ fontSize: 14, textAlign: "center", maxWidth: 360 }}>
          Sender or receiver coordinates could not be determined for this
          shipment. Contact support or update the coordinates in the admin panel.
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={mapRef}
        style={{ width: "100%", minHeight: 400, height: "60vh", borderRadius: 12 }}
      />
      {(distanceKm || durationMin) && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255,255,255,.95)",
            borderRadius: 8,
            padding: "10px 14px",
            boxShadow: "0 2px 8px rgba(0,0,0,.12)",
            fontSize: 13,
            zIndex: 1000,
            lineHeight: 1.7,
            minWidth: 160,
          }}
        >
          {progressPct !== null && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <strong>Progress</strong>
                <span>{progressPct}%</span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "#e9ecef",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: "100%",
                    background: progressPct === 100 ? "#22c55e" : "#0F4C81",
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          )}
          {distanceKm && (
            <div>
              <strong>Distance:</strong> {distanceKm.toFixed(1)} km
            </div>
          )}
          {durationMin && (
            <div>
              <strong>Est. Duration:</strong>{" "}
              {durationMin >= 60
                ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
                : `${durationMin} min`}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default LiveTrackingMap;
