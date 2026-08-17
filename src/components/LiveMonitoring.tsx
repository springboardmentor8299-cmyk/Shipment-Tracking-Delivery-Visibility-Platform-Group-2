import React, { useState, useEffect } from 'react';
import { Shipment, DriverInfo } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { LiveLocationPanel } from './LiveLocationPanel';
import { 
  Navigation, 
  Truck, 
  Battery, 
  Gauge, 
  Phone, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  MapPin
} from 'lucide-react';

interface LiveMonitoringProps {
  shipments: Shipment[];
  onUpdateDriverLocation?: (shipmentId: string, lat: number, lng: number) => void;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ shipments, onUpdateDriverLocation }) => {
  const [activeShipmentId, setActiveShipmentId] = useState<string>(shipments[0]?.id || '');
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(68);

  const activeShipment = shipments.find(s => s.id === activeShipmentId) || shipments[0];

  const handleLocationUpdate = (lat: number, lng: number) => {
    if (activeShipment && activeShipment.driver) {
      activeShipment.driver.currentLat = lat;
      activeShipment.driver.currentLng = lng;
      if (activeShipment.currentLocation) {
        activeShipment.currentLocation.lat = lat;
        activeShipment.currentLocation.lng = lng;
      }
      if (onUpdateDriverLocation) {
        onUpdateDriverLocation(activeShipment.id, lat, lng);
      }
    }
  };

  // Simulated live GPS jitter timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedSpeed(Math.floor(58 + Math.random() * 20));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-400" />
              Live Delivery GPS Telemetry & Route Monitoring
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time driver location updates, geofence enter/exit alerts, vehicle speed & battery health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block text-xs">
            <span className="text-slate-400 block text-[10px]">Active Fleet Vehicles</span>
            <strong className="text-emerald-400 font-mono">4 / 4 Online</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Driver Fleet List & Live Telemetry Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Active Driver Fleet Directory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            Courier Drivers En Route
          </h3>

          <div className="space-y-3">
            {shipments.map((s) => {
              if (!s.driver) return null;
              const isSelected = s.id === activeShipment.id;

              return (
                <div
                  key={s.id}
                  onClick={() => setActiveShipmentId(s.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected 
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-lg ring-1 ring-blue-500/30' 
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{s.driver.name}</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {s.trackingNumber}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">{s.driver.vehicle}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-emerald-400" />
                      {isSelected ? simulatedSpeed : s.driver.speedKmH} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-cyan-400" />
                      {s.driver.batteryPct}%
                    </span>
                    <span className="text-slate-500">{s.driver.lastSignalTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Live Telemetry Dashboard & Interactive Map */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeShipment && (
            <>
              {/* Telemetry Gauge Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Vehicle Speed</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{simulatedSpeed} km/h</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Highway Speed Limit OK</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Device Battery</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">{activeShipment.driver?.batteryPct}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Charging (In-Vehicle)</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">GPS Lat / Lng</div>
                  <div className="text-xs font-bold text-white mt-2 font-mono">
                    {activeShipment.driver?.currentLat.toFixed(3)}, {activeShipment.driver?.currentLng.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Satellite Lock: 12 Sats</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Geofence Status</div>
                  <div className="text-xs font-bold text-blue-400 mt-2 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    Inside Transit Vector
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">No route deviation</div>
                </div>
              </div>

              {/* Map Component */}
              <InteractiveMap shipment={activeShipment} />

              {/* Live Device Geolocation Telemetry Panel */}
              <LiveLocationPanel
                title={`Live GPS Telemetry - Driver: ${activeShipment.driver?.name || 'Courier'}`}
                initialLat={activeShipment.driver?.currentLat || 19.076045}
                initialLng={activeShipment.driver?.currentLng || 72.877712}
                onLocationUpdate={handleLocationUpdate}
              />

              {/* Driver Direct Contact & Dispatch Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
                    {activeShipment.driver?.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{activeShipment.driver?.name}</h4>
                    <p className="text-[11px] text-slate-400">Assigned to #{activeShipment.trackingNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a
                    href={`tel:${activeShipment.driver?.phone}`}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Voice Call Driver
                  </a>
                </div>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
