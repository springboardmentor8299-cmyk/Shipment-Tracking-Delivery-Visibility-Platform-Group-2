import React, { useState } from 'react';
import { Shipment, RoutePlan, RouteWaypoint } from '../types';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  History, 
  Calculator, 
  AlertTriangle, 
  BarChart3, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Fuel, 
  DollarSign, 
  Shuffle, 
  Trash2, 
  RotateCcw, 
  Compass, 
  ShieldAlert, 
  Check, 
  Layers, 
  TrendingDown, 
  Sliders, 
  Globe
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';

interface RouteManagementProps {
  shipments: Shipment[];
}

// Initial Sample Pre-Populated Routes
const INITIAL_ROUTES: RoutePlan[] = [
  {
    id: 'route-101',
    routeName: 'NH-48 Golden Quadrilateral Corridor',
    corridor: 'New Delhi -> Jaipur -> Ahmedabad -> Mumbai (Pan-India Highway)',
    origin: 'Delhi Okhla Terminal (Phase 3 Industrial Area)',
    destination: 'Mumbai JNPT Port & Bhiwandi Hub',
    totalDistanceKm: 1420,
    estimatedDurationHours: 18.5,
    trafficLevel: 'Moderate',
    waypoints: [
      { id: 'wp-1', name: 'Delhi Okhla Terminal', city: 'New Delhi', address: 'Okhla Phase 3 Industrial Area', lat: 28.5283, lng: 77.2783, stopType: 'Pickup', estimatedArrival: '08:00 AM', completed: true, packageCount: 15 },
      { id: 'wp-2', name: 'Gurgaon Toll Plaza', city: 'Gurgaon', address: 'Kherki Daula Toll, NH-48', lat: 28.4595, lng: 77.0266, stopType: 'Waypoint Hub', estimatedArrival: '09:30 AM', completed: true, packageCount: 8 },
      { id: 'wp-3', name: 'Jaipur Highway Hub', city: 'Jaipur', address: 'Jaipur Expressway Bypass', lat: 26.9124, lng: 75.7873, stopType: 'Waypoint Hub', estimatedArrival: '02:00 PM', completed: true, packageCount: 12 },
      { id: 'wp-4', name: 'Udaipur Freight Depot', city: 'Udaipur', address: 'Sukher Industrial Area', lat: 24.5854, lng: 73.7125, stopType: 'Waypoint Hub', estimatedArrival: '09:15 PM', completed: false, packageCount: 6 },
      { id: 'wp-5', name: 'Ahmedabad Logistics Terminal', city: 'Ahmedabad', address: 'Narol Industrial Estate', lat: 23.0225, lng: 72.5714, stopType: 'Waypoint Hub', estimatedArrival: '04:45 AM (Next Day)', completed: false, packageCount: 20 },
      { id: 'wp-6', name: 'Mumbai Bhiwandi Central Depot', city: 'Mumbai', address: 'Bhiwandi Complex', lat: 19.0760, lng: 72.8777, stopType: 'Delivery Dropoff', estimatedArrival: '01:00 PM (Next Day)', completed: false, packageCount: 25 },
    ],
    fuelEstimateLiters: 420,
    co2SavingsKg: 180,
    status: 'In Progress',
    createdAt: '2026-07-25 08:00',
    efficiencyScorePct: 96.4,
  },
  {
    id: 'route-102',
    routeName: 'NH-44 South Corridor - Hyderabad to Chennai',
    corridor: 'Hyderabad -> Vijayawada -> Nellore -> Chennai (NH-16)',
    origin: 'Hyderabad Hitech City Depot',
    destination: 'Chennai Guindy Site',
    totalDistanceKm: 630,
    estimatedDurationHours: 10.2,
    trafficLevel: 'Heavy',
    waypoints: [
      { id: 'wp-201', name: 'Hyderabad Hitech Terminal', city: 'Hyderabad', address: 'Hitech City Phase 2', lat: 17.4483, lng: 78.3741, stopType: 'Pickup', estimatedArrival: '06:00 AM', completed: true, packageCount: 30 },
      { id: 'wp-202', name: 'Vijayawada Highway Hub', city: 'Vijayawada', address: 'Vijayawada Highway Toll', lat: 16.5062, lng: 80.6480, stopType: 'Waypoint Hub', estimatedArrival: '11:45 AM', completed: true, packageCount: 14 },
      { id: 'wp-203', name: 'Nellore Transit Depot', city: 'Nellore', address: 'Gudur NH-16 Bypass', lat: 14.4426, lng: 79.9865, stopType: 'Waypoint Hub', estimatedArrival: '03:30 PM', completed: false, packageCount: 10 },
      { id: 'wp-204', name: 'Chennai Guindy Site', city: 'Chennai', address: 'Guindy Industrial Estate', lat: 13.0067, lng: 80.2020, stopType: 'Delivery Dropoff', estimatedArrival: '07:15 PM', completed: false, packageCount: 34 },
    ],
    fuelEstimateLiters: 180,
    co2SavingsKg: 75,
    status: 'In Progress',
    createdAt: '2026-07-26 06:00',
    efficiencyScorePct: 92.1,
  },
];

// Historical Executed Route Log
const HISTORICAL_ROUTES = [
  { id: 'hist-1', name: 'Mumbai -> Pune Expressway Direct', date: '2026-07-24', distanceKm: 150, durationHrs: 2.5, status: 'Completed', variance: '-15 mins', efficiency: 98.8 },
  { id: 'hist-2', name: 'Bengaluru -> Mysuru Express Corridor', date: '2026-07-23', distanceKm: 145, durationHrs: 2.1, status: 'Completed', variance: '+5 mins', efficiency: 97.5 },
  { id: 'hist-3', name: 'Delhi NCR -> Agra Yamuna Expressway', date: '2026-07-22', distanceKm: 210, durationHrs: 3.0, status: 'Completed', variance: '-10 mins', efficiency: 99.1 },
  { id: 'hist-4', name: 'Kolkata -> Bhubaneswar Coastal Route', date: '2026-07-21', distanceKm: 440, durationHrs: 7.2, status: 'Completed', variance: '+15 mins (Monsoon)', efficiency: 93.8 },
];

export const RouteManagement: React.FC<RouteManagementProps> = ({ shipments }) => {
  const [routes, setRoutes] = useState<RoutePlan[]>(INITIAL_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RoutePlan>(INITIAL_ROUTES[0]);
  const [activeTab, setActiveTab] = useState<'Planning' | 'Optimization' | 'Calculator' | 'Traffic' | 'History' | 'Analytics'>('Planning');

  // Traffic Simulation Slider (1: Clear, 2: Moderate, 3: Heavy, 4: Severe Congestion)
  const [trafficSeverity, setTrafficSeverity] = useState<number>(2);
  const [trafficDetourActive, setTrafficDetourActive] = useState<boolean>(false);

  // Distance Calculator state
  const [calcLat1, setCalcLat1] = useState<number>(19.0760); // Mumbai
  const [calcLng1, setCalcLng1] = useState<number>(72.8777);
  const [calcLat2, setCalcLat2] = useState<number>(28.6139); // New Delhi
  const [calcLng2, setCalcLng2] = useState<number>(77.2090);
  const [calculatedDistanceKm, setCalculatedDistanceKm] = useState<number>(1420);
  const [calculatedTollEstimateUsd, setCalculatedTollEstimateUsd] = useState<number>(120);

  // Optimization Animation State
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationComplete, setOptimizationComplete] = useState<boolean>(false);

  // New Waypoint Form
  const [newWpName, setNewWpName] = useState('');
  const [newWpCity, setNewWpCity] = useState('');
  const [newWpAddress, setNewWpAddress] = useState('');
  const [newWpStopType, setNewWpStopType] = useState<'Pickup' | 'Waypoint Hub' | 'Delivery Dropoff'>('Waypoint Hub');

  // Haversine Distance Calculator logic
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c * 1.25); // Road winding factor 1.25
    setCalculatedDistanceKm(distanceKm);
    setCalculatedTollEstimateUsd(Math.round(distanceKm * 0.045));
  };

  // Trigger Route Optimization
  const handleOptimizeRoute = () => {
    setIsOptimizing(true);
    setOptimizationComplete(false);

    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizationComplete(true);

      // Reorder waypoints to simulate optimal traveling salesman pass
      const reordered = [...selectedRoute.waypoints].sort((a, b) => b.packageCount! - a.packageCount!);
      const updatedRoute: RoutePlan = {
        ...selectedRoute,
        waypoints: reordered,
        totalDistanceKm: Math.round(selectedRoute.totalDistanceKm * 0.91), // 9% distance reduction
        estimatedDurationHours: Number((selectedRoute.estimatedDurationHours * 0.88).toFixed(1)), // 12% time reduction
        fuelEstimateLiters: Math.round(selectedRoute.fuelEstimateLiters * 0.90),
        co2SavingsKg: selectedRoute.co2SavingsKg + 85,
        status: 'Optimized',
        efficiencyScorePct: 99.2,
      };

      setSelectedRoute(updatedRoute);
      setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
    }, 1500);
  };

  // Add Custom Waypoint
  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWpName || !newWpCity) return;

    const newWp: RouteWaypoint = {
      id: `wp-user-${Date.now()}`,
      name: newWpName,
      city: newWpCity,
      address: newWpAddress || `${newWpCity} Central Freight Bay`,
      lat: 39.8283,
      lng: -98.5795,
      stopType: newWpStopType,
      estimatedArrival: '12:00 PM',
      completed: false,
      packageCount: 10,
    };

    const updatedWaypoints = [...selectedRoute.waypoints, newWp];
    const updatedRoute = {
      ...selectedRoute,
      waypoints: updatedWaypoints,
      totalDistanceKm: selectedRoute.totalDistanceKm + 180,
    };

    setSelectedRoute(updatedRoute);
    setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
    setNewWpName('');
    setNewWpCity('');
    setNewWpAddress('');
  };

  // Remove Waypoint
  const handleRemoveWaypoint = (id: string) => {
    const filtered = selectedRoute.waypoints.filter(w => w.id !== id);
    const updatedRoute = { ...selectedRoute, waypoints: filtered };
    setSelectedRoute(updatedRoute);
    setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
  };

  // Calculate total miles
  const distanceMiles = Math.round(selectedRoute.totalDistanceKm * 0.621371);

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Route Management Module
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Route Planning, Multi-Stop Optimization & Traffic Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic stop sequencing, distance matrix calculations, traffic congestion avoidance, route history audit, and fleet fuel efficiency.
          </p>
        </div>

        {/* Route Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">Active Corridor:</span>
          <select
            value={selectedRoute.id}
            onChange={(e) => {
              const r = routes.find(x => x.id === e.target.value);
              if (r) setSelectedRoute(r);
            }}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.routeName} ({r.waypoints.length} stops)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Header Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-slate-900 p-2 rounded-2xl border border-slate-800 text-xs">
        {[
          { id: 'Planning', label: 'Route Planning', icon: Navigation },
          { id: 'Optimization', label: 'AI Optimization Engine', icon: Zap },
          { id: 'Traffic', label: 'Traffic-Aware Routing', icon: AlertTriangle },
          { id: 'Calculator', label: 'Distance & Toll Matrix', icon: Calculator },
          { id: 'History', label: 'Route History Audit', icon: History },
          { id: 'Analytics', label: 'Route Analytics', icon: BarChart3 },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROUTE PLANNING */}
      {activeTab === 'Planning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Waypoints & Stop Sequencing List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Waypoint Sequence ({selectedRoute.waypoints.length} Stops)
                </h3>
                <p className="text-[11px] text-slate-400">Drag or reorder stops along the corridor</p>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedRoute.status === 'Optimized' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {selectedRoute.status}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedRoute.waypoints.map((wp, idx) => (
                <div key={wp.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 font-bold text-white flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{wp.name}</span>
                        {wp.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400">{wp.city} • ETA: {wp.estimatedArrival}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                      wp.stopType === 'Pickup' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      wp.stopType === 'Delivery Dropoff' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {wp.stopType}
                    </span>

                    {selectedRoute.waypoints.length > 2 && (
                      <button
                        onClick={() => handleRemoveWaypoint(wp.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Waypoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Waypoint Form */}
            <form onSubmit={handleAddWaypoint} className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block">Add Intermediate Waypoint Stop:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Stop Name (e.g. Reno Hub)"
                  value={newWpName}
                  onChange={(e) => setNewWpName(e.target.value)}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newWpCity}
                  onChange={(e) => setNewWpCity(e.target.value)}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={newWpStopType}
                  onChange={(e) => setNewWpStopType(e.target.value as any)}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs w-1/2"
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Waypoint Hub">Waypoint Hub</option>
                  <option value="Delivery Dropoff">Delivery Dropoff</option>
                </select>

                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Stop
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Map & Route Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedRoute.routeName}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedRoute.corridor}</p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Distance</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedRoute.totalDistanceKm} km ({distanceMiles} mi)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Est Duration</span>
                  <span className="font-mono font-bold text-white">{selectedRoute.estimatedDurationHours} hrs</span>
                </div>
              </div>
            </div>

            {/* Interactive Google Maps for Route */}
            <div className="h-96 rounded-xl overflow-hidden border border-slate-800">
              <InteractiveMap shipment={shipments.find(s => s.trackingNumber === selectedRoute?.id) || shipments[0]} isExpanded={true} />
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Estimated Fuel</span>
                <span className="font-bold text-amber-400 font-mono">{selectedRoute.fuelEstimateLiters} Liters</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">CO2 Emissions Saved</span>
                <span className="font-bold text-emerald-400 font-mono">{selectedRoute.co2SavingsKg} kg</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Efficiency Score</span>
                <span className="font-bold text-blue-400 font-mono">{selectedRoute.efficiencyScorePct}%</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ROUTE OPTIMIZATION ENGINE */}
      {activeTab === 'Optimization' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  AI Algorithmic Engine
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Multi-Stop Route Optimization & TSP Solver
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Computes optimal traveling salesman sequence considering delivery deadlines, traffic bottlenecks, and fuel economy.
              </p>
            </div>

            <button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 text-xs"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Computing Optimal TSP Path...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Execute AI Route Optimization
                </>
              )}
            </button>
          </div>

          {/* Optimization Results Comparison Cards */}
          {optimizationComplete && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-sm block">Route Optimization Applied Successfully!</span>
                <p className="mt-0.5 text-slate-300">
                  Waypoints re-sequenced to eliminate 142 km of redundant highway backtracking, reducing fuel consumption by 115L.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Before Optimization */}
            <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-750 pb-2 text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Baseline Unoptimized Sequence</span>
                <span className="text-slate-400">Standard Sequential</span>
              </div>

              <div className="space-y-2 text-xs">
                {selectedRoute.waypoints.map((wp, i) => (
                  <div key={wp.id} className="p-2.5 bg-slate-900 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-medium">{i + 1}. {wp.name} ({wp.city})</span>
                    <span className="text-slate-500 font-mono text-[10px]">{wp.stopType}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-400 flex justify-between border-t border-slate-750">
                <span>Baseline Distance: <strong className="text-slate-200 font-mono">4,128 km</strong></span>
                <span>Est Time: <strong className="text-slate-200 font-mono">42.5 hrs</strong></span>
              </div>
            </div>

            {/* After Optimization */}
            <div className="p-5 bg-slate-800/80 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-750 pb-2 text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  AI Optimized Sequence
                </span>
                <span className="text-emerald-400 font-mono font-bold">-9% Distance / -12% Time</span>
              </div>

              <div className="space-y-2 text-xs">
                {selectedRoute.waypoints.map((wp, i) => (
                  <div key={wp.id} className="p-2.5 bg-slate-900 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                    <span className="text-white font-semibold">{i + 1}. {wp.name} ({wp.city})</span>
                    <span className="text-emerald-400 font-mono text-[10px] font-bold">Optimal Priority</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-400 flex justify-between border-t border-slate-750">
                <span>Optimized Distance: <strong className="text-emerald-400 font-mono">3,756 km</strong></span>
                <span>Est Time: <strong className="text-emerald-400 font-mono">37.4 hrs</strong></span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: TRAFFIC-AWARE ROUTING */}
      {activeTab === 'Traffic' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Real-Time Traffic Congestion & Dynamic Detour Rerouting
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Monitors highway incidents, construction work zones, and weather slowdowns along the corridor.
              </p>
            </div>

            {/* Traffic Severity Selector */}
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 font-semibold">Simulate Congestion Level:</span>
              <button
                onClick={() => setTrafficSeverity(1)}
                className={`px-2.5 py-1 rounded-lg transition ${trafficSeverity === 1 ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300'}`}
              >
                Clear
              </button>
              <button
                onClick={() => setTrafficSeverity(2)}
                className={`px-2.5 py-1 rounded-lg transition ${trafficSeverity === 2 ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'}`}
              >
                Moderate
              </button>
              <button
                onClick={() => setTrafficSeverity(3)}
                className={`px-2.5 py-1 rounded-lg transition ${trafficSeverity === 3 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300'}`}
              >
                Heavy
              </button>
              <button
                onClick={() => setTrafficSeverity(4)}
                className={`px-2.5 py-1 rounded-lg transition ${trafficSeverity === 4 ? 'bg-rose-600 text-white font-bold' : 'text-slate-300'}`}
              >
                Severe
              </button>
            </div>
          </div>

          {/* Traffic Alert Banner & Dynamic Detour Suggestion */}
          {trafficSeverity >= 3 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Traffic Alert: Highway Construction & Lane Closure on I-80 Mile marker 142
                </span>
                <span className="text-amber-400 font-mono font-bold">+45 Mins Delay Risk</span>
              </div>

              <p className="text-slate-300">
                Heavy traffic bottleneck detected near Salt Lake Crossing. Average speed down to 18 km/h.
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-amber-500/20">
                <span className="text-slate-300 font-semibold">Dynamic Detour Suggestion: Reroute via State Highway 20 Bypass</span>
                <button
                  onClick={() => setTrafficDetourActive(!trafficDetourActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    trafficDetourActive ? 'bg-emerald-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {trafficDetourActive ? 'Detour Applied (-32 mins saved)' : 'Apply Dynamic Detour'}
                </button>
              </div>
            </div>
          )}

          {/* Active Corridor Live Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <span className="text-slate-400 block text-[10px]">Average Highway Speed</span>
              <div className="font-bold text-xl text-white font-mono">
                {trafficSeverity === 1 ? '92 km/h' : trafficSeverity === 2 ? '78 km/h' : trafficSeverity === 3 ? '45 km/h' : '18 km/h'}
              </div>
              <p className="text-slate-500 text-[10px]">Target Speed: 85 km/h</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <span className="text-slate-400 block text-[10px]">Congestion Level</span>
              <div className={`font-bold text-xl font-mono ${
                trafficSeverity === 1 ? 'text-emerald-400' : trafficSeverity === 2 ? 'text-blue-400' : trafficSeverity === 3 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {trafficSeverity === 1 ? 'Clear Flow' : trafficSeverity === 2 ? 'Moderate Flow' : trafficSeverity === 3 ? 'Heavy Traffic' : 'Severe Congestion'}
              </div>
              <p className="text-slate-500 text-[10px]">Updated via Live Telemetry Feed</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <span className="text-slate-400 block text-[10px]">Estimated Corridor Delay</span>
              <div className="font-bold text-xl text-amber-400 font-mono">
                {trafficSeverity === 1 ? '0 mins' : trafficSeverity === 2 ? '+8 mins' : trafficSeverity === 3 ? '+45 mins' : '+110 mins'}
              </div>
              <p className="text-slate-500 text-[10px]">Impact on Arrival ETA</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DISTANCE & TOLL MATRIX CALCULATOR */}
      {activeTab === 'Calculator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Haversine Distance & Toll Cost Matrix Calculator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Calculate exact geodesic and road distance matrix parameters between any global GPS coordinate pairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Coordinates Input Form */}
            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-4">
              <span className="font-bold text-white text-xs block">Origin & Destination Coordinate Matrix:</span>

              <div className="space-y-2">
                <label className="block text-slate-300">Origin Point (Lat, Lng):</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={calcLat1}
                    onChange={(e) => setCalcLat1(Number(e.target.value))}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="37.7749 (SF)"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={calcLng1}
                    onChange={(e) => setCalcLng1(Number(e.target.value))}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="-122.4194"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300">Destination Point (Lat, Lng):</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={calcLat2}
                    onChange={(e) => setCalcLat2(Number(e.target.value))}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="40.7128 (NY)"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={calcLng2}
                    onChange={(e) => setCalcLng2(Number(e.target.value))}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    placeholder="-74.0060"
                  />
                </div>
              </div>

              <button
                onClick={() => calculateHaversine(calcLat1, calcLng1, calcLat2, calcLng2)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Compute Haversine Distance Matrix
              </button>
            </div>

            {/* Calculated Output Matrix */}
            <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-4">
              <span className="font-bold text-white text-xs block">Matrix Distance & Cost Output:</span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-750">
                  <span className="text-slate-400 text-[10px] block">Road Distance (KM)</span>
                  <span className="font-mono font-bold text-xl text-emerald-400">{calculatedDistanceKm} km</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-750">
                  <span className="text-slate-400 text-[10px] block">Road Distance (Miles)</span>
                  <span className="font-mono font-bold text-xl text-cyan-400">{Math.round(calculatedDistanceKm * 0.621371)} mi</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-750">
                  <span className="text-slate-400 text-[10px] block">Est Highway Toll Cost</span>
                  <span className="font-mono font-bold text-xl text-amber-400">${calculatedTollEstimateUsd}</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-750">
                  <span className="text-slate-400 text-[10px] block">Est Heavy Fuel Usage</span>
                  <span className="font-mono font-bold text-xl text-purple-400">{Math.round(calculatedDistanceKm * 0.28)} L</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: ROUTE HISTORY AUDIT TRAIL */}
      {activeTab === 'History' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Completed & Historical Route Execution Log
              </h3>
              <p className="text-xs text-slate-400">Historical performance, schedule variance, and driver compliance log.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Route Corridor</th>
                  <th className="p-3">Execution Date</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Actual Duration</th>
                  <th className="p-3">Schedule Variance</th>
                  <th className="p-3 text-right">Efficiency Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {HISTORICAL_ROUTES.map((hr) => (
                  <tr key={hr.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-white">{hr.name}</td>
                    <td className="p-3 font-mono text-slate-400">{hr.date}</td>
                    <td className="p-3 font-mono">{hr.distanceKm} km</td>
                    <td className="p-3 font-mono text-cyan-400">{hr.durationHrs} hrs</td>
                    <td className="p-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hr.variance.includes('-') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {hr.variance}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-right font-bold text-emerald-400">{hr.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ROUTE ANALYTICS */}
      {activeTab === 'Analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
            <span className="text-slate-400 text-xs font-semibold block">Fleet Corridor Utilization</span>
            <div className="text-2xl font-bold text-white font-mono">98.4%</div>
            <p className="text-[10px] text-slate-500">Active trucks assigned to optimal corridors</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
            <span className="text-slate-400 text-xs font-semibold block">Total Mileage Reduced via TSP</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">14,820 km</div>
            <p className="text-[10px] text-slate-500">Accumulated distance savings this month</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
            <span className="text-slate-400 text-xs font-semibold block">Idle Time Ratio</span>
            <div className="text-2xl font-bold text-cyan-400 font-mono">2.1%</div>
            <p className="text-[10px] text-slate-500">Industry benchmark: 5.0%</p>
          </div>
        </div>
      )}

    </div>
  );
};
