import { useEffect, useMemo } from "react";
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
    return "Unknown";
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
  const hasCurrentLocation = isValidCoordinate(
    currentLatitude,
    currentLongitude
  );

  const hasDestinationLocation = isValidCoordinate(
    destinationLatitude,
    destinationLongitude
  );

  const currentPosition = hasCurrentLocation
    ? [Number(currentLatitude), Number(currentLongitude)]
    : null;

  const destinationPosition = hasDestinationLocation
    ? [Number(destinationLatitude), Number(destinationLongitude)]
    : null;

  const positions = useMemo(() => {
    return [currentPosition, destinationPosition].filter(Boolean);
  }, [currentPosition, destinationPosition]);

  const defaultCenter = positions[0] || [22.7196, 75.8577];

  if (!hasCurrentLocation && !hasDestinationLocation) {
    return (
      <div className="shipment-map-wrapper">
        <div className="shipment-map-header">
          <div>
            <span className="shipment-map-label">Live Tracking Map</span>
            <h2>Shipment Route</h2>
            <p>
              The map will appear after current or destination coordinates are
              added to this shipment.
            </p>
          </div>
        </div>

        <div className="shipment-map-empty-state">
          <div className="shipment-map-empty-icon">🗺️</div>
          <h3>Location coordinates are not available</h3>
          <p>
            Ask the logistics operator to update the shipment latitude and
            longitude.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-map-wrapper">
      <div className="shipment-map-header">
        <div>
          <span className="shipment-map-label">Live Tracking Map</span>
          <h2>Shipment Route</h2>
          <p>
            Track the current shipment position and its delivery destination on
            OpenStreetMap.
          </p>
        </div>

        <div className="shipment-map-summary">
          <div>
            <span>Status</span>
            <strong>{formatStatus(currentStatus)}</strong>
          </div>

          <div>
            <span>Estimated Delivery</span>
            <strong>{formatDate(estimatedDeliveryTime)}</strong>
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

        <MapViewportController positions={positions} />

        {currentPosition && (
          <Marker position={currentPosition} icon={currentLocationIcon}>
            <Popup>
              <div className="shipment-map-popup">
                <strong>Current Shipment Location</strong>
                <span>Tracking: {trackingNumber || "Not available"}</span>
                <span>Status: {formatStatus(currentStatus)}</span>
                <span>Latitude: {formatCoordinate(currentLatitude)}</span>
                <span>Longitude: {formatCoordinate(currentLongitude)}</span>
                <span>Updated: {formatDate(lastLocationUpdate)}</span>
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
                <span>ETA: {formatDate(estimatedDeliveryTime)}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {currentPosition && destinationPosition && (
          <Polyline
            positions={[currentPosition, destinationPosition]}
            pathOptions={{ weight: 4, opacity: 0.8, dashArray: "10 10" }}
          />
        )}
      </MapContainer>

      <div className="shipment-map-legend">
        {currentPosition && (
          <div>
            <span className="shipment-map-legend-icon">🚚</span>
            <div>
              <strong>Current Location</strong>
              <small>
                {formatCoordinate(currentLatitude)}, {formatCoordinate(currentLongitude)}
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
                {formatCoordinate(destinationLatitude)}, {formatCoordinate(destinationLongitude)}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShipmentMap;