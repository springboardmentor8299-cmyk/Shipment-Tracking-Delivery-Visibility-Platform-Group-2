import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { sanitizeLatLng } from '../../utils/mapUtils';

// Fix Leaflet default icon paths in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom truck marker for active drivers
const truckMarkerIcon = L.divIcon({
  className: 'custom-truck-marker',
  html: `<div style="
    background: linear-gradient(135deg, #1e40af, #2563eb);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 16px rgba(37,99,235,0.5);
    border: 2.5px solid #ffffff;
    font-size: 20px;
  ">🚚</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

// Destination marker icon
const destinationMarkerIcon = L.divIcon({
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
    box-shadow: 0 4px 16px rgba(22,163,74,0.5);
    border: 2.5px solid #ffffff;
    font-size: 18px;
  ">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// Helper component to center map dynamically when selected shipment changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

function ShipmentMap({ shipments = [], selectedShipment = null, height = "500px" }) {
  const defaultCenter = [20.5937, 78.9629]; // Center of India

  // Determine active center point with lat/lng validation
  let activeCenter = defaultCenter;
  if (selectedShipment) {
    activeCenter = sanitizeLatLng(selectedShipment.latitude, selectedShipment.longitude);
  } else if (shipments.length > 0 && shipments[0].latitude && shipments[0].longitude) {
    activeCenter = sanitizeLatLng(shipments[0].latitude, shipments[0].longitude);
  }

  return (
    <div style={{ width: '100%', height, borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', position: 'relative' }}>
      <MapContainer
        center={activeCenter}
        zoom={7}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapRecenter center={activeCenter} />

        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render shipment markers and polylines without wrapping inside <div> */}
        {shipments.map((s) => {
          const [lat, lng] = sanitizeLatLng(s.latitude, s.longitude, 28.6139, 77.2090);
          const [destLat, destLng] = sanitizeLatLng(s.destLatitude, s.destLongitude, lat + 0.8, lng + 0.8);

          const routePolyline = [
            [lat, lng],
            [destLat, destLng],
          ];

          const formattedEta = s.etaMinutes != null ? `${s.etaMinutes} mins (${s.distanceKm || '12.5'} km)` : 'Calculating...';

          return (
            <React.Fragment key={s.id || s.trackingNumber || `${lat}-${lng}`}>
              {/* Active Driver Live Location Marker */}
              <Marker position={[lat, lng]} icon={truckMarkerIcon}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', padding: '6px', minWidth: '180px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{s.trackingNumber}</div>
                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                      Status: {s.status || 'IN_TRANSIT'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                      <strong>Driver:</strong> {s.driverName || 'Sanjai Driver'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      <strong>Receiver:</strong> {s.receiverName || 'Customer'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      <strong>Destination:</strong> {s.deliveryAddress}
                    </div>

                    {/* ETA Prediction Badge in Popup */}
                    <div style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: s.isDelayed ? '#fef2f2' : '#eff6ff',
                      color: s.isDelayed ? '#dc2626' : '#1d4ed8',
                      border: s.isDelayed ? '1px solid #fecaca' : '1px solid #bfdbfe',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      ⚡ Est. Arrival: {formattedEta}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={[destLat, destLng]} icon={destinationMarkerIcon}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#16a34a' }}>Destination Location</div>
                    <div style={{ fontSize: '12px', color: '#334155' }}>{s.deliveryAddress}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Planned Route Polyline */}
              <Polyline
                positions={routePolyline}
                pathOptions={{ color: s.isDelayed ? '#dc2626' : '#2563eb', weight: 4, opacity: 0.85, dashArray: '8, 8' }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default ShipmentMap;