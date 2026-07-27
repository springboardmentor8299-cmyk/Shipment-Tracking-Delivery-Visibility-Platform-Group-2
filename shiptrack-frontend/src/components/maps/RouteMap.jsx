import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "../ShipmentMap.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const sourceIcon = L.divIcon({
  className: "shipment-map-custom-icon",
  html: '<div class="shipment-map-marker current-marker">📍</div>',
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  popupAnchor: [0, -38],
});

const destinationIcon = L.divIcon({
  className: "shipment-map-custom-icon",
  html: '<div class="shipment-map-marker destination-marker">📦</div>',
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  popupAnchor: [0, -38],
});

function isValidCoordinate(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function formatCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(6) : "Not available";
}

function formatStatus(status) {
  if (!status) {
    return "Route Preview";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDistance(distanceInMeters) {
  const distance = Number(distanceInMeters);

  if (!Number.isFinite(distance) || distance < 0) {
    return "Not available";
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(1)} km`;
}

function formatDuration(durationInSeconds) {
  const totalSeconds = Number(durationInSeconds);

  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "Not available";
  }

  const totalMinutes = Math.round(totalSeconds / 60);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`);
  }

  if (hours > 0) {
    parts.push(`${hours} hr${hours === 1 ? "" : "s"}`);
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} min`);
  }

  return parts.join(" ");
}

function calculateArrivalTime(durationInSeconds) {
  const duration = Number(durationInSeconds);

  if (!Number.isFinite(duration) || duration < 0) {
    return "Not available";
  }

  const arrival = new Date(Date.now() + duration * 1000);

  return arrival.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function convertGeoJsonCoordinatesToLeaflet(geometry) {
  if (!geometry?.coordinates) {
    return [];
  }

  if (geometry.type === "LineString") {
    return geometry.coordinates.map(([longitude, latitude]) => [
      latitude,
      longitude,
    ]);
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.flatMap((line) =>
      line.map(([longitude, latitude]) => [latitude, longitude])
    );
  }

  return [];
}

function MapViewportController({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 13, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(positions);

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 14,
      animate: true,
    });
  }, [map, positions]);

  return null;
}

function RouteMap({
  trackingNumber,
  currentLatitude,
  currentLongitude,
  destinationLatitude,
  destinationLongitude,
  currentStatus,
  estimatedDeliveryTime,
  lastLocationUpdate,
}) {
  const [routePositions, setRoutePositions] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const hasCurrentLocation = isValidCoordinate(
    currentLatitude,
    currentLongitude
  );

  const hasDestinationLocation = isValidCoordinate(
    destinationLatitude,
    destinationLongitude
  );

  const currentPosition = useMemo(
    () =>
      hasCurrentLocation
        ? [Number(currentLatitude), Number(currentLongitude)]
        : null,
    [hasCurrentLocation, currentLatitude, currentLongitude]
  );

  const destinationPosition = useMemo(
    () =>
      hasDestinationLocation
        ? [Number(destinationLatitude), Number(destinationLongitude)]
        : null,
    [
      hasDestinationLocation,
      destinationLatitude,
      destinationLongitude,
    ]
  );

  useEffect(() => {
    if (!currentPosition || !destinationPosition) {
      setRoutePositions([]);
      setRouteDistance(null);
      setRouteDuration(null);
      setRouteError("");
      return undefined;
    }

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    if (!apiKey) {
      setRoutePositions([]);
      setRouteDistance(null);
      setRouteDuration(null);
      setRouteError(
        "Geoapify API key is missing. Add VITE_GEOAPIFY_API_KEY to the .env file."
      );
      return undefined;
    }

    const controller = new AbortController();

    const loadRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError("");

        const waypoints =
          `${currentPosition[0]},${currentPosition[1]}|` +
          `${destinationPosition[0]},${destinationPosition[1]}`;

        const url =
          "https://api.geoapify.com/v1/routing" +
          `?waypoints=${encodeURIComponent(waypoints)}` +
          "&mode=drive" +
          "&type=balanced" +
          `&apiKey=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Geoapify routing request failed with status ${response.status}.`
          );
        }

        const data = await response.json();
        const routeFeature = data.features?.[0];

        if (!routeFeature?.geometry) {
          throw new Error(
            "No driving route was found between the selected locations."
          );
        }

        const leafletPositions = convertGeoJsonCoordinatesToLeaflet(
          routeFeature.geometry
        );

        if (leafletPositions.length < 2) {
          throw new Error("The routing service returned an invalid route.");
        }

        setRoutePositions(leafletPositions);
        setRouteDistance(routeFeature.properties?.distance ?? null);
        setRouteDuration(routeFeature.properties?.time ?? null);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Unable to load road route:", error);
        setRoutePositions([]);
        setRouteDistance(null);
        setRouteDuration(null);
        setRouteError(
          error.message ||
            "Unable to calculate the road route. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    loadRoute();

    return () => {
      controller.abort();
    };
  }, [currentPosition, destinationPosition]);

  const viewportPositions = useMemo(() => {
    if (routePositions.length > 0) {
      return routePositions;
    }

    return [currentPosition, destinationPosition].filter(Boolean);
  }, [routePositions, currentPosition, destinationPosition]);

  const defaultCenter = viewportPositions[0] || [22.7196, 75.8577];

  if (!hasCurrentLocation && !hasDestinationLocation) {
    return (
      <div className="shipment-map-wrapper">
        <div className="shipment-map-header">
          <div>
            <span className="shipment-map-label">Route Preview</span>
            <h2>Shipment Route</h2>
            <p>
              Select the source and destination addresses to calculate the road
              route.
            </p>
          </div>
        </div>

        <div className="shipment-map-empty-state">
          <div className="shipment-map-empty-icon">🗺️</div>
          <h3>Locations are not available</h3>
          <p>Select both addresses from the search suggestions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-map-wrapper">
      <div className="shipment-map-header">
        <div>
          <span className="shipment-map-label">Road Route Preview</span>
          <h2>Shipment Route</h2>
          <p>
            View the driving route, estimated distance, and expected travel
            time.
          </p>
        </div>

        <div className="shipment-map-summary">
          <div>
            <span>Status</span>
            <strong>{formatStatus(currentStatus)}</strong>
          </div>

          <div>
            <span>Driving Distance</span>
            <strong>
              {routeLoading
                ? "Calculating..."
                : formatDistance(routeDistance)}
            </strong>
          </div>

          <div>
            <span>Travel Time</span>
            <strong>
              {routeLoading
                ? "Calculating..."
                : formatDuration(routeDuration)}
            </strong>
          </div>

          <div>
            <span>Expected Arrival</span>
            <strong>
              {routeDuration
                ? calculateArrivalTime(routeDuration)
                : formatDate(estimatedDeliveryTime)}
            </strong>
          </div>
        </div>
      </div>

      {routeError && (
        <div
          role="alert"
          style={{
            marginBottom: "12px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
          }}
        >
          <strong>Route unavailable: </strong>
          {routeError}
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom
        className="shipment-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewportController positions={viewportPositions} />

        {currentPosition && (
          <Marker position={currentPosition} icon={sourceIcon}>
            <Popup>
              <div className="shipment-map-popup">
                <strong>Shipment Source</strong>
                <span>Tracking: {trackingNumber || "Not available"}</span>
                <span>Status: {formatStatus(currentStatus)}</span>
                <span>Latitude: {formatCoordinate(currentLatitude)}</span>
                <span>Longitude: {formatCoordinate(currentLongitude)}</span>
                {lastLocationUpdate && (
                  <span>Updated: {formatDate(lastLocationUpdate)}</span>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {destinationPosition && (
          <Marker position={destinationPosition} icon={destinationIcon}>
            <Popup>
              <div className="shipment-map-popup">
                <strong>Delivery Destination</strong>
                <span>Tracking: {trackingNumber || "Not available"}</span>
                <span>
                  Latitude: {formatCoordinate(destinationLatitude)}
                </span>
                <span>
                  Longitude: {formatCoordinate(destinationLongitude)}
                </span>
                <span>
                  Route ETA:{" "}
                  {routeDuration
                    ? formatDuration(routeDuration)
                    : formatDate(estimatedDeliveryTime)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {routePositions.length > 0 ? (
          <Polyline
            positions={routePositions}
            pathOptions={{
              weight: 6,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        ) : (
          currentPosition &&
          destinationPosition && (
            <Polyline
              positions={[currentPosition, destinationPosition]}
              pathOptions={{
                weight: 4,
                opacity: 0.65,
                dashArray: "10 10",
              }}
            />
          )
        )}
      </MapContainer>

      <div className="shipment-map-legend">
        {currentPosition && (
          <div>
            <span className="shipment-map-legend-icon">📍</span>
            <div>
              <strong>Source</strong>
              <small>
                {formatCoordinate(currentLatitude)},{" "}
                {formatCoordinate(currentLongitude)}
              </small>
            </div>
          </div>
        )}

        {destinationPosition && (
          <div>
            <span className="shipment-map-legend-icon">📦</span>
            <div>
              <strong>Destination</strong>
              <small>
                {formatCoordinate(destinationLatitude)},{" "}
                {formatCoordinate(destinationLongitude)}
              </small>
            </div>
          </div>
        )}

        <div>
          <span className="shipment-map-legend-icon">🛣️</span>
          <div>
            <strong>Road Route</strong>
            <small>
              {routeLoading
                ? "Calculating route..."
                : routePositions.length > 0
                  ? `${formatDistance(routeDistance)} • ${formatDuration(
                      routeDuration
                    )}`
                  : "Straight-line fallback"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteMap;