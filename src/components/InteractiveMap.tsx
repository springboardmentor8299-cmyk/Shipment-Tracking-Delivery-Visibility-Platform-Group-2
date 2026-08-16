import React, { useState, useEffect, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useAdvancedMarkerRef 
} from '@vis.gl/react-google-maps';
import { Shipment, LocationPoint } from '../types';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Layers, 
  Maximize2, 
  Zap, 
  Info, 
  ExternalLink, 
  Locate, 
  Compass,
  CheckCircle2,
  Clock,
  Key,
  X,
  Package,
  Eye,
  Check
} from 'lucide-react';
import { useLiveLocation, formatLatitude, formatLongitude } from '../hooks/useLiveLocation';

interface InteractiveMapProps {
  shipment?: Shipment;
  allShipments?: Shipment[];
  onSelectWaypoint?: (locationName: string) => void;
  onSelectShipment?: (shipment: Shipment) => void;
  isExpanded?: boolean;
  className?: string;
}

// Polyline component using Google Maps JS API
function RoutePolyline({ 
  path, 
  strokeColor = '#3b82f6', 
  strokeOpacity = 0.8, 
  strokeWeight = 4,
  dashPattern = false 
}: { 
  path: { lat: number; lng: number }[]; 
  strokeColor?: string; 
  strokeOpacity?: number; 
  strokeWeight?: number;
  dashPattern?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !path || path.length < 2) return;
    if (typeof google === 'undefined' || !google || !google.maps) return;

    const validPath = path.filter(
      p => p && typeof p.lat === 'number' && !isNaN(p.lat) && typeof p.lng === 'number' && !isNaN(p.lng)
    );

    if (validPath.length < 2) return;

    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 3
    };

    const polyline = new google.maps.Polyline({
      path: validPath,
      geodesic: true,
      strokeColor,
      strokeOpacity: dashPattern ? 0 : strokeOpacity,
      strokeWeight,
      icons: dashPattern ? [{
        icon: lineSymbol,
        offset: '0',
        repeat: '15px'
      }] : undefined
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, strokeColor, strokeOpacity, strokeWeight, dashPattern]);

  return null;
}

// Helper to auto-fit map bounds
function AutoFitMapBounds({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    if (typeof google === 'undefined' || !google || !google.maps) return;

    const bounds = new google.maps.LatLngBounds();
    let validCount = 0;

    points.forEach(pt => {
      if (pt && typeof pt.lat === 'number' && typeof pt.lng === 'number' && !isNaN(pt.lat) && !isNaN(pt.lng)) {
        bounds.extend(pt);
        validCount++;
      }
    });

    if (validCount > 0) {
      if (validCount === 1) {
        map.setCenter(points[0]);
        map.setZoom(11);
      } else {
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    }
  }, [map, points]);

  return null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shipment,
  allShipments,
  onSelectWaypoint,
  onSelectShipment,
  isExpanded = false,
  className = '',
}) => {
  const [selectedShipmentInMap, setSelectedShipmentInMap] = useState<Shipment | null>(null);
  const [selectedMarkerType, setSelectedMarkerType] = useState<string | null>(null);
  const [showDeviceGPS, setShowDeviceGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { lat: deviceLat, lng: deviceLng, loading: geoLoading, fetchCurrentLocation } = useLiveLocation();

  // API Key detection
  const API_KEY = 
    (process.env.GOOGLE_MAPS_API_KEY as string) ||
    (process.env.GOOGLE_MAPS_PLATFORM_KEY as string) ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_API_KEY ||
    '';

  const hasValidKey = Boolean(API_KEY) && API_KEY.trim().length > 5 && API_KEY !== 'YOUR_API_KEY';

  // Single shipment coordinates setup
  const singleShipmentPoints = useMemo(() => {
    if (!shipment) return [];
    const pts: { lat: number; lng: number; name?: string }[] = [];

    if (shipment.senderAddress?.lat && shipment.senderAddress?.lng) {
      pts.push({ lat: shipment.senderAddress.lat, lng: shipment.senderAddress.lng, name: `Origin: ${shipment.senderAddress.city}` });
    }

    if (shipment.routePath && shipment.routePath.length > 0) {
      shipment.routePath.forEach(rp => {
        if (rp.lat && rp.lng) pts.push({ lat: rp.lat, lng: rp.lng, name: rp.name });
      });
    }

    const currentLat = shipment.driver?.currentLat ?? shipment.currentLocation?.lat;
    const currentLng = shipment.driver?.currentLng ?? shipment.currentLocation?.lng;
    if (currentLat && currentLng) {
      pts.push({ lat: currentLat, lng: currentLng, name: `Current Location: ${shipment.currentLocation?.city || 'In-Transit'}` });
    }

    if (shipment.receiverAddress?.lat && shipment.receiverAddress?.lng) {
      pts.push({ lat: shipment.receiverAddress.lat, lng: shipment.receiverAddress.lng, name: `Destination: ${shipment.receiverAddress.city}` });
    }

    return pts;
  }, [shipment]);

  // Multi-shipment list setup
  const displayedShipments = useMemo(() => {
    if (shipment) return [shipment];
    if (allShipments && allShipments.length > 0) {
      return allShipments.filter(s => {
        const matchesSearch = 
          s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.assignedOperatorName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }
    return [];
  }, [shipment, allShipments, searchQuery, statusFilter]);

  // Multi-shipment points for auto-fitting bounds
  const multiShipmentPoints = useMemo(() => {
    const pts: { lat: number; lng: number }[] = [];
    displayedShipments.forEach(s => {
      const lat = s.driver?.currentLat ?? s.currentLocation?.lat ?? s.receiverAddress?.lat ?? s.senderAddress?.lat;
      const lng = s.driver?.currentLng ?? s.currentLocation?.lng ?? s.receiverAddress?.lng ?? s.senderAddress?.lng;
      if (lat && lng) pts.push({ lat, lng });
    });
    if (showDeviceGPS && deviceLat && deviceLng) {
      pts.push({ lat: deviceLat, lng: deviceLng });
    }
    return pts;
  }, [displayedShipments, showDeviceGPS, deviceLat, deviceLng]);

  // Default Map Center
  const defaultCenter = useMemo(() => {
    if (multiShipmentPoints.length > 0) return multiShipmentPoints[0];
    return { lat: 19.0760, lng: 72.8777 }; // Mumbai coordinates default
  }, [multiShipmentPoints]);

  const handleLocateMe = () => {
    fetchCurrentLocation();
    setShowDeviceGPS(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return { bg: '#10b981', glyph: '#ffffff', border: '#047857', badge: 'bg-emerald-500/20 text-emerald-300' };
      case 'Out for Delivery': return { bg: '#06b6d4', glyph: '#ffffff', border: '#0e7490', badge: 'bg-cyan-500/20 text-cyan-300' };
      case 'In Transit': return { bg: '#3b82f6', glyph: '#ffffff', border: '#1d4ed8', badge: 'bg-blue-500/20 text-blue-300' };
      case 'Picked Up': return { bg: '#8b5cf6', glyph: '#ffffff', border: '#6d28d9', badge: 'bg-purple-500/20 text-purple-300' };
      case 'Created': return { bg: '#f59e0b', glyph: '#ffffff', border: '#b45309', badge: 'bg-amber-500/20 text-amber-300' };
      case 'Failed Delivery': return { bg: '#ef4444', glyph: '#ffffff', border: '#b91c1c', badge: 'bg-rose-500/20 text-rose-300' };
      case 'Cancelled': return { bg: '#64748b', glyph: '#ffffff', border: '#334155', badge: 'bg-slate-500/20 text-slate-300' };
      default: return { bg: '#3b82f6', glyph: '#ffffff', border: '#1d4ed8', badge: 'bg-blue-500/20 text-blue-300' };
    }
  };

  // If NO Google Maps API key provided, render the fallback instructions splash screen
  if (!hasValidKey) {
    return (
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 space-y-4">
          <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400">
            <Key className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Google Maps API Key Required</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              To render real interactive satellite/street maps with live shipment markers and route polylines, please add your Google Maps API key using the variable name <code className="text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">GOOGLE_MAPS_API_KEY</code>.
            </p>
          </div>

          <div className="w-full bg-slate-850 border border-slate-800 rounded-xl p-4 text-left text-xs text-slate-300 space-y-2.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Step-by-Step Setup Guide:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
              <li>
                Obtain a key from the{' '}
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Google Maps Platform Console
                </a>.
              </li>
              <li>
                In Google AI Studio, open <strong>Settings</strong> (⚙️ gear icon in top-right corner) → <strong>Secrets</strong>.
              </li>
              <li>
                Add secret name: <code className="text-cyan-300 font-mono">GOOGLE_MAPS_API_KEY</code> and paste your key.
              </li>
              <li>
                Alternatively, add <code className="text-cyan-300 font-mono">GOOGLE_MAPS_API_KEY=your_key_here</code> to your <code className="text-slate-200 font-mono">.env</code> file.
              </li>
            </ol>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl text-[11px] text-slate-400 w-full flex items-center justify-between border border-slate-700/50">
            <span>Required Maps API Services: Maps JavaScript API</span>
            <span className="text-emerald-400 font-semibold">Ready for Key</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative flex flex-col ${className}`}>
      
      {/* Top Map Control Bar */}
      <div className="bg-slate-850 p-3 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white">
            {allShipments ? 'Global Fleet & Shipment GPS Tracking Map' : `Live Route Map - #${shipment?.trackingNumber}`}
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
            Google Maps API Active
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {allShipments && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter map shipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={handleLocateMe}
            disabled={geoLoading}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow cursor-pointer"
            title="Locate my current device latitude and longitude"
          >
            <Locate className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Locating...' : 'Pin My Live GPS'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Rendering Area */}
      <div className={`relative w-full ${isExpanded ? 'h-[520px]' : 'h-96'} bg-slate-950 overflow-hidden`}>
        
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={10}
            mapId="SHIPMENT_TRACKING_MAP"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
            mapTypeControl={true}
            scaleControl={true}
            streetViewControl={false}
            fullscreenControl={true}
          >
            <AutoFitMapBounds points={multiShipmentPoints} />

            {/* SINGLE SHIPMENT ROUTE POLYLINES */}
            {shipment && (
              <>
                {/* Planned / Waypoint Polyline */}
                {shipment.routePath && shipment.routePath.length > 1 && (
                  <RoutePolyline 
                    path={shipment.routePath.map(r => ({ lat: r.lat, lng: r.lng }))} 
                    strokeColor="#8b5cf6" 
                    strokeWeight={4}
                  />
                )}

                {/* Direct Origin -> Current Location -> Destination Polyline */}
                <RoutePolyline 
                  path={[
                    { lat: shipment.senderAddress.lat, lng: shipment.senderAddress.lng },
                    { 
                      lat: shipment.driver?.currentLat ?? shipment.currentLocation?.lat ?? shipment.senderAddress.lat, 
                      lng: shipment.driver?.currentLng ?? shipment.currentLocation?.lng ?? shipment.senderAddress.lng 
                    },
                    { lat: shipment.receiverAddress.lat, lng: shipment.receiverAddress.lng }
                  ]} 
                  strokeColor="#3b82f6" 
                  strokeWeight={4}
                />

                {/* Origin Marker */}
                <AdvancedMarker 
                  position={{ lat: shipment.senderAddress.lat, lng: shipment.senderAddress.lng }}
                  onClick={() => setSelectedMarkerType('origin')}
                >
                  <Pin background="#3b82f6" glyphColor="#ffffff" borderColor="#1d4ed8" />
                </AdvancedMarker>

                {/* Destination Marker */}
                <AdvancedMarker 
                  position={{ lat: shipment.receiverAddress.lat, lng: shipment.receiverAddress.lng }}
                  onClick={() => setSelectedMarkerType('destination')}
                >
                  <Pin background="#10b981" glyphColor="#ffffff" borderColor="#047857" />
                </AdvancedMarker>

                {/* Active Live Driver / Package Marker */}
                {(() => {
                  const driverLat = shipment.driver?.currentLat ?? shipment.currentLocation?.lat;
                  const driverLng = shipment.driver?.currentLng ?? shipment.currentLocation?.lng;
                  const hasValidDriverPos = typeof driverLat === 'number' && !isNaN(driverLat) && typeof driverLng === 'number' && !isNaN(driverLng);

                  if (!hasValidDriverPos) return null;

                  return (
                    <>
                      <AdvancedMarker 
                        position={{ lat: driverLat!, lng: driverLng! }}
                        onClick={() => setSelectedMarkerType('driver')}
                      >
                        <div className="relative group cursor-pointer">
                          <div className="absolute -inset-2 bg-blue-500/40 rounded-full animate-ping" />
                          <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs relative z-10">
                            <Truck className="w-5 h-5" />
                          </div>
                        </div>
                      </AdvancedMarker>

                      {selectedMarkerType === 'driver' && (
                        <InfoWindow 
                          position={{ lat: driverLat!, lng: driverLng! }}
                          onCloseClick={() => setSelectedMarkerType(null)}
                        >
                          <div className="p-2 text-slate-900 text-xs max-w-xs space-y-1 font-sans">
                            <div className="font-bold text-blue-700 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              <span>Live Courier Telemetry</span>
                            </div>
                            <p className="font-semibold text-slate-800">{shipment.driver?.name || 'Assigned Courier Operator'}</p>
                            <p className="text-slate-600">Location: {shipment.currentLocation?.city || 'En Route'}</p>
                            <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-600 flex justify-between gap-2">
                              <span>Speed: <strong>{shipment.driver?.speedKmH ?? 65} km/h</strong></span>
                              <span>Battery: <strong>{shipment.driver?.batteryPct ?? 90}%</strong></span>
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </>
                  );
                })()}
              </>
            )}

            {/* MULTI-SHIPMENT FLEET MARKERS */}
            {!shipment && displayedShipments.map((s) => {
              const lat = s.driver?.currentLat ?? s.currentLocation?.lat ?? s.receiverAddress?.lat ?? s.senderAddress?.lat;
              const lng = s.driver?.currentLng ?? s.currentLocation?.lng ?? s.receiverAddress?.lng ?? s.senderAddress?.lng;
              if (!lat || !lng) return null;

              const statusStyling = getStatusColor(s.status);

              return (
                <AdvancedMarker
                  key={s.id}
                  position={{ lat, lng }}
                  onClick={() => setSelectedShipmentInMap(s)}
                >
                  <Pin 
                    background={statusStyling.bg} 
                    glyphColor={statusStyling.glyph} 
                    borderColor={statusStyling.border} 
                  />
                </AdvancedMarker>
              );
            })}

            {/* MULTI-SHIPMENT SELECTED INFOWINDOW */}
            {selectedShipmentInMap && (
              <InfoWindow
                position={{
                  lat: selectedShipmentInMap.driver?.currentLat ?? selectedShipmentInMap.currentLocation?.lat ?? selectedShipmentInMap.receiverAddress?.lat ?? selectedShipmentInMap.senderAddress?.lat,
                  lng: selectedShipmentInMap.driver?.currentLng ?? selectedShipmentInMap.currentLocation?.lng ?? selectedShipmentInMap.receiverAddress?.lng ?? selectedShipmentInMap.senderAddress?.lng,
                }}
                onCloseClick={() => setSelectedShipmentInMap(null)}
              >
                <div className="p-2.5 text-slate-900 text-xs max-w-sm space-y-2 font-sans">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-mono font-bold text-blue-700 text-sm">#{selectedShipmentInMap.trackingNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(selectedShipmentInMap.status).badge}`}>
                      {selectedShipmentInMap.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Customer Name</span>
                      <strong className="text-slate-800">{selectedShipmentInMap.receiverName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Operator</span>
                      <strong className="text-slate-800">{selectedShipmentInMap.assignedOperatorName || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Origin</span>
                      <span className="text-slate-700">{selectedShipmentInMap.senderAddress.city}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Destination</span>
                      <span className="text-slate-700">{selectedShipmentInMap.receiverAddress.city}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Location:</span>
                      <strong className="text-slate-800">{selectedShipmentInMap.currentLocation?.city || selectedShipmentInMap.currentLocation?.address || 'In Transit'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Delivery:</span>
                      <strong className="text-emerald-700">{selectedShipmentInMap.estimatedDeliveryTime}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Value: ${selectedShipmentInMap.declaredValueUsd}</span>
                    {onSelectShipment && (
                      <button
                        onClick={() => {
                          onSelectShipment(selectedShipmentInMap);
                          setSelectedShipmentInMap(null);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Shipment</span>
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* USER LIVE GPS DEVICE PIN MARKER */}
            {showDeviceGPS && deviceLat !== null && deviceLng !== null && (
              <AdvancedMarker position={{ lat: deviceLat, lng: deviceLng }}>
                <div className="relative cursor-pointer">
                  <div className="absolute -inset-3 bg-cyan-400/40 rounded-full animate-ping" />
                  <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs relative z-10">
                    📍
                  </div>
                </div>
              </AdvancedMarker>
            )}

          </Map>
        </APIProvider>

        {/* Status Legend Overlay on Map */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl text-[11px] text-white shadow-lg space-y-1.5 hidden sm:block">
          <div className="font-bold text-slate-300 text-[10px] uppercase tracking-wider mb-1">Status Color Legend</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Out for Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>In Transit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Created / Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Failed / Exception</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Cancelled</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
