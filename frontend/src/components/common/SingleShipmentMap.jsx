import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { sanitizeLatLng } from '../../utils/mapUtils';

// Leaflet default icon fixes
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Leaflet Icons
const pickupIcon = L.divIcon({
  className: 'custom-pickup-marker',
  html: `<div style="
    background: linear-gradient(135deg, #475569, #1e293b);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    border: 2px solid #ffffff;
    font-size: 15px;
  ">📦</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const driverIcon = L.divIcon({
  className: 'custom-driver-marker',
  html: `<div style="
    background: linear-gradient(135deg, #1e40af, #2563eb);
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 6px 18px rgba(37,99,235,0.5);
    border: 2.5px solid #ffffff;
    font-size: 20px;
  ">🚚</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -22],
});

const destinationIcon = L.divIcon({
  className: 'custom-destination-marker',
  html: `<div style="
    background: linear-gradient(135deg, #16a34a, #22c55e);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 14px rgba(22,163,74,0.45);
    border: 2px solid #ffffff;
    font-size: 16px;
  ">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

function SingleShipmentMap({ shipment, height = "520px" }) {
  if (!shipment) return null;

  // Compute Pickup, Current Driver, Destination coordinates in [lat, lng]
  const [currentLat, currentLng] = sanitizeLatLng(
    shipment.latitude,
    shipment.longitude,
    28.6139,
    77.2090
  );

  const [pickupLat, pickupLng] = sanitizeLatLng(
    shipment.pickupLatitude || currentLat - 0.4,
    shipment.pickupLongitude || currentLng - 0.4,
    currentLat - 0.4,
    currentLng - 0.4
  );

  const [destLat, destLng] = sanitizeLatLng(
    shipment.destLatitude || currentLat + 0.6,
    shipment.destLongitude || currentLng + 0.6,
    currentLat + 0.6,
    currentLng + 0.6
  );

  // Covered Path: Solid line from Pickup -> Current Driver Position
  const coveredPolyline = [
    [pickupLat, pickupLng],
    [currentLat, currentLng],
  ];

  // Remaining Path: Dashed line from Current Driver Position -> Destination
  const remainingPolyline = [
    [currentLat, currentLng],
    [destLat, destLng],
  ];

  const mapCenter = [currentLat, currentLng];

  return (
    <div style={{ width: '100%', height, borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={8}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapRecenter center={mapCenter} />

        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Pickup Marker (Origin) */}
        <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#475569' }}>Pickup Origin</div>
              <div style={{ fontSize: '12px', color: '#0f172a', marginTop: '2px' }}>{shipment.senderName || 'Origin Warehouse'}</div>
            </div>
          </Popup>
        </Marker>

        {/* 2. Driver Current Position Marker */}
        <Marker position={[currentLat, currentLng]} icon={driverIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', padding: '6px', minWidth: '180px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{shipment.trackingNumber}</div>
              <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                Status: {shipment.status || 'IN_TRANSIT'}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                <strong>Driver:</strong> {shipment.driverName || 'Sanjai Driver'}
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                <strong>Current Speed:</strong> 48 km/h
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                <strong>Last Ping:</strong> {shipment.lastUpdated || 'Just now'}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* 3. Destination Marker */}
        <Marker position={[destLat, destLng]} icon={destinationIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#16a34a' }}>Destination Location</div>
              <div style={{ fontSize: '12px', color: '#0f172a', marginTop: '2px' }}>{shipment.deliveryAddress}</div>
            </div>
          </Popup>
        </Marker>

        {/* 4. Covered Path Polyline (Solid Blue) */}
        <Polyline
          positions={coveredPolyline}
          pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.9 }}
        />

        {/* 5. Remaining Path Polyline (Dashed Blue/Amber) */}
        <Polyline
          positions={remainingPolyline}
          pathOptions={{ color: shipment.isDelayed ? '#dc2626' : '#3b82f6', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
        />
      </MapContainer>
    </div>
  );
}

export default SingleShipmentMap;
