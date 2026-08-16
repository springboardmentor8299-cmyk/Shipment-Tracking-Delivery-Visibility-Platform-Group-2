import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
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

const FALLBACK_POSITION = [23.259933, 77.412613];

const sourceIcon = L.divIcon({
  className: "shipment-map-custom-icon",
  html: '<div class="shipment-map-marker source-marker">🏭</div>',
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  popupAnchor: [0, -38],
});

const selectedIcon = L.divIcon({
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

function createPosition(latitude, longitude) {
  if (
    latitude === null ||
    latitude === undefined ||
    latitude === "" ||
    longitude === null ||
    longitude === undefined ||
    longitude === ""
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function convertRouteCoordinates(geometry) {
  if (!geometry?.coordinates) return [];

  if (geometry.type === "LineString") {
    return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.flatMap((line) =>
      line.map(([lng, lat]) => [lat, lng])
    );
  }

  return [];
}

function findNearestRoutePoint(clickedPoint, routePositions) {
  if (!routePositions.length) return null;

  let nearestPoint = routePositions[0];
  let nearestDistance = clickedPoint.distanceTo(
    L.latLng(nearestPoint[0], nearestPoint[1])
  );

  for (let index = 1; index < routePositions.length; index += 1) {
    const point = routePositions[index];
    const distance = clickedPoint.distanceTo(L.latLng(point[0], point[1]));

    if (distance < nearestDistance) {
      nearestPoint = point;
      nearestDistance = distance;
    }
  }

  return nearestPoint;
}

function RouteClickHandler({ routePositions, onLocationSelect }) {
  useMapEvents({
    click(event) {
      if (!routePositions.length) return;

      const point = findNearestRoutePoint(event.latlng, routePositions);
      if (!point) return;

      onLocationSelect?.({
        latitude: Number(point[0].toFixed(6)),
        longitude: Number(point[1].toFixed(6)),
      });
    },
  });

  return null;
}

function MapViewport({ positions }) {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();

      if (positions.length === 1) {
        map.setView(positions[0], 13);
      } else if (positions.length > 1) {
        map.fitBounds(L.latLngBounds(positions), {
          padding: [45, 45],
          maxZoom: 14,
        });
      }
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [map, positions]);

  return null;
}

function OperatorMap({
  sourceLatitude,
  sourceLongitude,
  currentLatitude,
  currentLongitude,
  destinationLatitude,
  destinationLongitude,
  onLocationSelect,
}) {
  const [routePositions, setRoutePositions] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const sourcePosition = useMemo(
    () => createPosition(sourceLatitude, sourceLongitude),
    [sourceLatitude, sourceLongitude]
  );

  const selectedPosition = useMemo(
    () => createPosition(currentLatitude, currentLongitude),
    [currentLatitude, currentLongitude]
  );

  const destinationPosition = useMemo(
    () => createPosition(destinationLatitude, destinationLongitude),
    [destinationLatitude, destinationLongitude]
  );

  const routeStartPosition = sourcePosition || selectedPosition;
  const mapCenter =
    selectedPosition ||
    sourcePosition ||
    destinationPosition ||
    FALLBACK_POSITION;

  useEffect(() => {
    if (!routeStartPosition || !destinationPosition) {
      setRoutePositions([]);
      setRouteError(
        "Source and destination coordinates are required to display the route."
      );
      return undefined;
    }

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    if (!apiKey) {
      setRoutePositions([routeStartPosition, destinationPosition]);
      setRouteError(
        "Geoapify API key is missing. A straight selectable path is displayed."
      );
      return undefined;
    }

    const controller = new AbortController();

    const loadRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError("");

        const waypoints =
          `${routeStartPosition[0]},${routeStartPosition[1]}|` +
          `${destinationPosition[0]},${destinationPosition[1]}`;

        const response = await fetch(
          "https://api.geoapify.com/v1/routing" +
            `?waypoints=${encodeURIComponent(waypoints)}` +
            "&mode=drive&type=balanced" +
            `&apiKey=${encodeURIComponent(apiKey)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Routing request failed: ${response.status}`);
        }

        const data = await response.json();
        const route = convertRouteCoordinates(data.features?.[0]?.geometry);

        if (route.length < 2) {
          throw new Error("No valid route was returned.");
        }

        setRoutePositions(route);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Unable to load delivery route:", error);
        setRoutePositions([routeStartPosition, destinationPosition]);
        setRouteError(
          "The road route could not be loaded. A straight selectable path is displayed."
        );
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    loadRoute();
    return () => controller.abort();
  }, [routeStartPosition, destinationPosition]);

  const visiblePositions = useMemo(() => {
    const positions = routePositions.length
      ? [...routePositions]
      : [routeStartPosition, destinationPosition].filter(Boolean);

    if (selectedPosition) {
      positions.push(selectedPosition);
    }

    return positions;
  }, [
    routePositions,
    routeStartPosition,
    destinationPosition,
    selectedPosition,
  ]);

  return (
    <div className="shipment-map-wrapper">
      <div className="shipment-map-header">
        <div>
          <span className="shipment-map-label">
            OPERATOR ROUTE SELECTOR
          </span>
          <h2>Select location from the delivery route</h2>
          <p>
            Click near the displayed route. The location marker moves
            to the nearest point on the route.
          </p>
        </div>
      </div>

      {routeLoading && (
        <div className="shipment-map-message">
          Loading delivery route...
        </div>
      )}

      {routeError && (
        <div
          className="shipment-map-message"
          role="alert"
          style={{ marginBottom: 12 }}
        >
          {routeError}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom
        className="shipment-map"
        style={{
          width: "100%",
          height: "460px",
          minHeight: "460px",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport positions={visiblePositions} />

        <RouteClickHandler
          routePositions={routePositions}
          onLocationSelect={onLocationSelect}
        />

        {sourcePosition && (
          <Marker position={sourcePosition} icon={sourceIcon}>
            <Popup>Shipment source</Popup>
          </Marker>
        )}

        {selectedPosition && (
          <Marker position={selectedPosition} icon={selectedIcon}>
            <Popup>
              Selected location:
              <br />
              {selectedPosition[0].toFixed(6)},{" "}
              {selectedPosition[1].toFixed(6)}
            </Popup>
          </Marker>
        )}

        {destinationPosition && (
          <Marker position={destinationPosition} icon={destinationIcon}>
            <Popup>Shipment destination</Popup>
          </Marker>
        )}

        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{ weight: 7, opacity: 0.9 }}
          />
        )}
      </MapContainer>

      <div className="shipment-map-legend">
        <div>
          <span className="shipment-map-legend-icon">🏭</span>
          <div>
            <strong>Source</strong>
            <small>
              {sourcePosition
                ? `${sourcePosition[0].toFixed(6)}, ${sourcePosition[1].toFixed(6)}`
                : "Coordinates unavailable"}
            </small>
          </div>
        </div>

        <div>
          <span className="shipment-map-legend-icon">📍</span>
          <div>
            <strong>Selected location</strong>
            <small>
              {selectedPosition
                ? `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`
                : "Select a point on the route"}
            </small>
          </div>
        </div>

        <div>
          <span className="shipment-map-legend-icon">📦</span>
          <div>
            <strong>Destination</strong>
            <small>
              {destinationPosition
                ? `${destinationPosition[0].toFixed(6)}, ${destinationPosition[1].toFixed(6)}`
                : "Coordinates unavailable"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperatorMap;