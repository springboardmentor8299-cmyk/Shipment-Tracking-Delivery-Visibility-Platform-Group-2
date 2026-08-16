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
import "./ShipmentMap.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const currentLocationIcon = L.divIcon({
  className: "shipment-map-custom-icon",
  html: '<div class="shipment-map-marker current-marker">🚚</div>',
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
  if (
    latitude === null ||
    latitude === undefined ||
    latitude === "" ||
    longitude === null ||
    longitude === undefined ||
    longitude === ""
  ) {
    return false;
  }

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

  return Number.isFinite(number)
    ? number.toFixed(6)
    : "Not available";
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
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

function MapViewportController({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) {
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 13, {
        animate: true,
      });

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

function convertRouteCoordinates(geometry) {
  if (!geometry || !geometry.coordinates) {
    return [];
  }

  /*
   * Geoapify returns GeoJSON coordinates in this format:
   * [longitude, latitude]
   *
   * React Leaflet requires:
   * [latitude, longitude]
   */

  if (geometry.type === "LineString") {
    return geometry.coordinates.map(
      ([longitude, latitude]) => [
        latitude,
        longitude,
      ]
    );
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.flatMap((line) =>
      line.map(([longitude, latitude]) => [
        latitude,
        longitude,
      ])
    );
  }

  return [];
}

function ShipmentMap({
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

  const currentPosition = useMemo(() => {
    if (!hasCurrentLocation) {
      return null;
    }

    return [
      Number(currentLatitude),
      Number(currentLongitude),
    ];
  }, [
    hasCurrentLocation,
    currentLatitude,
    currentLongitude,
  ]);

  const destinationPosition = useMemo(() => {
    if (!hasDestinationLocation) {
      return null;
    }

    return [
      Number(destinationLatitude),
      Number(destinationLongitude),
    ];
  }, [
    hasDestinationLocation,
    destinationLatitude,
    destinationLongitude,
  ]);

  const markerPositions = useMemo(() => {
    return [
      currentPosition,
      destinationPosition,
    ].filter(Boolean);
  }, [currentPosition, destinationPosition]);

  const viewportPositions = useMemo(() => {
    if (routePositions.length > 0) {
      return routePositions;
    }

    return markerPositions;
  }, [routePositions, markerPositions]);

  const defaultCenter =
    markerPositions[0] || [22.7196, 75.8577];

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRoadRoute() {
      if (!currentPosition || !destinationPosition) {
        setRoutePositions([]);
        setRouteError("");
        return;
      }

      const apiKey =
        import.meta.env.VITE_GEOAPIFY_API_KEY;

      if (!apiKey) {
        console.error(
          "VITE_GEOAPIFY_API_KEY is missing from the .env file."
        );

        setRoutePositions([]);
        setRouteError("Routing API key is missing.");
        return;
      }

      try {
        setRouteLoading(true);
        setRouteError("");

        const waypoints =
          `${currentPosition[0]},${currentPosition[1]}|` +
          `${destinationPosition[0]},${destinationPosition[1]}`;

        const routeUrl =
          "https://api.geoapify.com/v1/routing" +
          `?waypoints=${encodeURIComponent(waypoints)}` +
          "&mode=drive" +
          `&apiKey=${encodeURIComponent(apiKey)}`;

        const response = await fetch(routeUrl, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Geoapify routing request failed with status ${response.status}.`
          );
        }

        const data = await response.json();

        const routeGeometry =
          data.features?.[0]?.geometry;

        const convertedRoute =
          convertRouteCoordinates(routeGeometry);

        if (convertedRoute.length === 0) {
          throw new Error(
            "No road route was returned for these locations."
          );
        }

        setRoutePositions(convertedRoute);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error(
          "Unable to load the shipment road route:",
          error
        );

        setRoutePositions([]);
        setRouteError(
          "The road route could not be loaded."
        );
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    }

    fetchRoadRoute();

    return () => {
      controller.abort();
    };
  }, [
    currentLatitude,
    currentLongitude,
    destinationLatitude,
    destinationLongitude,
  ]);

  if (!hasCurrentLocation && !hasDestinationLocation) {
    return (
      <div className="shipment-map-wrapper">
        <div className="shipment-map-header">
          <div>
            <span className="shipment-map-label">
              Live Tracking Map
            </span>

            <h2>Shipment Route</h2>

            <p>
              The map will appear after current or destination
              coordinates are added to this shipment.
            </p>
          </div>
        </div>

        <div className="shipment-map-empty-state">
          <div className="shipment-map-empty-icon">
            🗺️
          </div>

          <h3>Location coordinates are not available</h3>

          <p>
            Ask the logistics operator to update the shipment
            latitude and longitude.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-map-wrapper">
      <div className="shipment-map-header">
        <div>
          <span className="shipment-map-label">
            Live Tracking Map
          </span>

          <h2>Shipment Route</h2>

          <p>
            Track the current shipment position and its delivery
            destination on OpenStreetMap.
          </p>

          {routeLoading && (
            <small>Loading road route...</small>
          )}

          {routeError && (
            <small>{routeError}</small>
          )}
        </div>

        <div className="shipment-map-summary">
          <div>
            <span>Status</span>

            <strong>
              {formatStatus(currentStatus)}
            </strong>
          </div>

          <div>
            <span>Estimated Delivery</span>

            <strong>
              {formatDate(estimatedDeliveryTime)}
            </strong>
          </div>
        </div>
      </div>

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

        <MapViewportController
          positions={viewportPositions}
        />

        {currentPosition && (
          <Marker
            position={currentPosition}
            icon={currentLocationIcon}
          >
            <Popup>
              <div className="shipment-map-popup">
                <strong>
                  Current Shipment Location
                </strong>

                <span>
                  Tracking:{" "}
                  {trackingNumber || "Not available"}
                </span>

                <span>
                  Status: {formatStatus(currentStatus)}
                </span>

                <span>
                  Latitude:{" "}
                  {formatCoordinate(currentLatitude)}
                </span>

                <span>
                  Longitude:{" "}
                  {formatCoordinate(currentLongitude)}
                </span>

                <span>
                  Updated:{" "}
                  {formatDate(lastLocationUpdate)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {destinationPosition && (
          <Marker
            position={destinationPosition}
            icon={destinationIcon}
          >
            <Popup>
              <div className="shipment-map-popup">
                <strong>
                  Delivery Destination
                </strong>

                <span>
                  Tracking:{" "}
                  {trackingNumber || "Not available"}
                </span>

                <span>
                  Latitude:{" "}
                  {formatCoordinate(
                    destinationLatitude
                  )}
                </span>

                <span>
                  Longitude:{" "}
                  {formatCoordinate(
                    destinationLongitude
                  )}
                </span>

                <span>
                  ETA:{" "}
                  {formatDate(
                    estimatedDeliveryTime
                  )}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {routePositions.length > 0 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>

      <div className="shipment-map-legend">
        {currentPosition && (
          <div>
            <span className="shipment-map-legend-icon">
              🚚
            </span>

            <div>
              <strong>Current Location</strong>

              <small>
                {formatCoordinate(currentLatitude)},{" "}
                {formatCoordinate(currentLongitude)}
              </small>
            </div>
          </div>
        )}

        {destinationPosition && (
          <div>
            <span className="shipment-map-legend-icon">
              📦
            </span>

            <div>
              <strong>Destination</strong>

              <small>
                {formatCoordinate(destinationLatitude)},{" "}
                {formatCoordinate(destinationLongitude)}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShipmentMap;