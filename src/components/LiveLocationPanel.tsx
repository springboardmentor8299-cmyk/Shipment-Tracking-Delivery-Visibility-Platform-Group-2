import React, { useState } from 'react';
import { useLiveLocation, formatLatitude, formatLongitude } from '../hooks/useLiveLocation';
import { 
  Locate, 
  Radio, 
  MapPin, 
  Compass, 
  Copy, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Gauge,
  Edit3
} from 'lucide-react';

interface LiveLocationPanelProps {
  initialLat?: number;
  initialLng?: number;
  title?: string;
  onLocationUpdate?: (lat: number, lng: number, address?: string) => void;
  compact?: boolean;
}

export const LiveLocationPanel: React.FC<LiveLocationPanelProps> = ({
  initialLat = 19.076045,
  initialLng = 72.877712,
  title = "Device Live GPS Telemetry",
  onLocationUpdate,
  compact = false,
}) => {
  const {
    lat,
    lng,
    accuracy,
    speedKmH,
    timestamp,
    isTracking,
    loading,
    error,
    fetchCurrentLocation,
    toggleLiveTracking,
    setManualCoords,
  } = useLiveLocation(initialLat, initialLng);

  const [copied, setCopied] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLatInput, setManualLatInput] = useState<string>(initialLat.toString());
  const [manualLngInput, setManualLngInput] = useState<string>(initialLng.toString());

  const currentLat = lat ?? initialLat;
  const currentLng = lng ?? initialLng;

  const handleFetchLocation = () => {
    fetchCurrentLocation();
    if (onLocationUpdate && lat !== null && lng !== null) {
      onLocationUpdate(lat, lng);
    }
  };

  const handleCopyCoords = () => {
    const text = `${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveManualModal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(manualLatInput);
    const parsedLng = parseFloat(manualLngInput);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      setManualCoords(parsedLat, parsedLng);
      if (onLocationUpdate) {
        onLocationUpdate(parsedLat, parsedLng);
      }
      setShowManualModal(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white space-y-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-semibold text-blue-400 flex items-center gap-1 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            Live Coordinates
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
            {isTracking ? 'GPS Live Stream' : timestamp ? `Updated ${timestamp}` : 'Ready'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950/70 p-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-[9px] text-slate-400 block font-sans">Latitude</span>
            <span className="text-cyan-300 font-bold">{formatLatitude(currentLat)}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-sans">Longitude</span>
            <span className="text-cyan-300 font-bold">{formatLongitude(currentLng)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 pt-1">
          <button
            onClick={handleFetchLocation}
            disabled={loading}
            className="flex-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Locate className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Locating...' : 'Get Live GPS'}</span>
          </button>

          <button
            onClick={handleCopyCoords}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
            title="Copy Coordinates"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>

          <a
            href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        {error && (
          <p className="text-[10px] text-rose-400 flex items-center gap-1 pt-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {title}
              {isTracking && (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live GPS Stream Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Precise satellite latitude & longitude positioning telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveTracking}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
              isTracking 
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isTracking ? 'animate-pulse text-rose-400' : 'text-emerald-400'}`} />
            <span>{isTracking ? 'Stop Stream' : 'Start Live GPS Stream'}</span>
          </button>
        </div>
      </div>

      {/* Main Coordinates Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Latitude Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Latitude (N / S)
            </span>
            <span className="font-mono text-[10px] text-slate-500">Y-Axis</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 tracking-tight">
            {formatLatitude(currentLat)}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Decimal Deg: {currentLat.toFixed(6)}°
          </p>
        </div>

        {/* Longitude Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Longitude (E / W)
            </span>
            <span className="font-mono text-[10px] text-slate-500">X-Axis</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300 tracking-tight">
            {formatLongitude(currentLng)}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Decimal Deg: {currentLng.toFixed(6)}°
          </p>
        </div>
      </div>

      {/* Accuracy & Metadata Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-slate-400">GPS Accuracy: </span>
            <strong className="text-emerald-400 font-mono">±{accuracy ?? 10} meters</strong>
          </div>
          {speedKmH !== null && (
            <div>
              <span className="text-slate-400">GPS Speed: </span>
              <strong className="text-cyan-400 font-mono">{speedKmH} km/h</strong>
            </div>
          )}
          <div>
            <span className="text-slate-400">Timestamp: </span>
            <strong className="text-white font-mono">{timestamp || 'Initial'}</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFetchLocation}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Locate className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Locating...' : 'Fetch Device GPS'}</span>
          </button>

          <button
            onClick={handleCopyCoords}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Lat,Lng'}</span>
          </button>

          <button
            onClick={() => {
              setManualLatInput(currentLat.toString());
              setManualLngInput(currentLng.toString());
              setShowManualModal(true);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Manual Edit</span>
          </button>

          <a
            href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Manual Lat / Lng Edit Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                Set Custom Latitude & Longitude
              </h4>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Latitude (Decimal Degrees, -90 to +90)
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={manualLatInput}
                  onChange={(e) => setManualLatInput(e.target.value)}
                  placeholder="e.g. 19.076045"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-cyan-300 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Positive = North, Negative = South
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Longitude (Decimal Degrees, -180 to +180)
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={manualLngInput}
                  onChange={(e) => setManualLngInput(e.target.value)}
                  placeholder="e.g. 72.877712"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-purple-300 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Positive = East, Negative = West
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  Apply Coordinates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
