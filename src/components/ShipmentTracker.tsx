import React, { useState } from 'react';
import { Shipment, ShipmentStatus, UserRole } from '../types';
import { generatePodPdf } from '../utils/generatePodPdf';
import { InteractiveMap } from './InteractiveMap';
import { LiveLocationPanel } from './LiveLocationPanel';
import { 
  Package, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Phone, 
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  Download,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  X
} from 'lucide-react';

interface ShipmentTrackerProps {
  shipment: Shipment | null;
  allShipments?: Shipment[];
  userRole?: UserRole;
  onSelectShipment?: (shipment: Shipment) => void;
  onOpenPodModal: () => void;
  onOpenAiPredictor: () => void;
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({
  shipment,
  allShipments = [],
  userRole = 'Customer',
  onSelectShipment,
  onOpenPodModal,
  onOpenAiPredictor,
}) => {
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(false);

  React.useEffect(() => {
    let timer: any;
    if (showCallModal) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showCallModal]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  if (!shipment) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Package className="w-12 h-12 mx-auto text-slate-600 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white mb-2">No Shipment Selected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please enter a valid tracking number above (e.g. <span className="font-mono text-blue-400">STP-9482-IN</span> or <span className="font-mono text-blue-400">STP-3104-IN</span>) to view real-time delivery status.
        </p>
      </div>
    );
  }

  const statusSteps: ShipmentStatus[] = [
    'Created',
    'Picked Up',
    'In Transit',
    'Out for Delivery',
    'Delivered',
  ];

  const isFailed = shipment.status === 'Failed Delivery';
  const isCancelled = shipment.status === 'Cancelled';

  const getStepIndex = (status: ShipmentStatus) => {
    if (status === 'Failed Delivery') return 3; // Attempted at Out for Delivery stage
    if (status === 'Cancelled') return 0;
    return statusSteps.indexOf(status);
  };

  const currentStepIdx = getStepIndex(shipment.status);

  return (
    <div className="space-y-6">
      
      {/* ALL PACKAGES SELECTOR BAR (Shows all customer packages & locations) */}
      {allShipments?.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Package className="w-4 h-4 text-blue-400" />
              All Registered Packages ({allShipments.length})
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click any package to track location & courier</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {allShipments.map((pkg) => {
              const isSelected = pkg.id === shipment.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => onSelectShipment && onSelectShipment(pkg)}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-lg shadow-blue-500/10' 
                      : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 pr-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 truncate">{pkg.trackingNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        pkg.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        pkg.status === 'Out for Delivery' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                        pkg.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {pkg.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-medium">
                      To: {pkg.receiverName} ({pkg.receiverAddress.city})
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Banner & Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-md font-semibold">
                {shipment.trackingNumber}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                shipment.priority === 'Critical Freight' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                shipment.priority === 'Express' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {shipment.priority} Priority
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              {shipment.packageType} for {shipment.receiverName}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Origin: <strong className="text-slate-200">{shipment.senderAddress.city}, {shipment.senderAddress.country}</strong></span>
              <span>•</span>
              <span>Destination: <strong className="text-slate-200">{shipment.receiverAddress.city}, {shipment.receiverAddress.country}</strong></span>
            </p>
          </div>

          {/* Dynamic ETA Widget */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center gap-4 min-w-[260px]">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estimated Delivery</div>
              <div className="text-base font-bold text-white">{shipment.estimatedDeliveryTime}</div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                On-Time Confidence: 94%
              </div>
            </div>
          </div>
        </div>

        {/* Failed Delivery or Cancelled Special Alert Banner */}
        {isFailed && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-rose-200">Delivery Attempt Failed</div>
              <p className="mt-0.5">
                The courier attempted delivery but was unable to complete it (e.g. security access, business closed, or recipient unavailable). Re-attempt scheduled for next business morning.
              </p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-3 text-xs text-slate-300">
            <ShieldAlert className="w-6 h-6 text-slate-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Shipment Cancelled</div>
              <p className="mt-0.5 text-slate-400">
                {shipment.cancellationReason || 'This shipment was cancelled prior to final delivery completion.'}
              </p>
            </div>
          </div>
        )}

        {/* Lifecycle Stepper Progress Bar */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-3">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Shipment Lifecycle</span>
            <span className="text-blue-400 font-mono">Current Status: {shipment.status}</span>
          </div>

          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
            {/* Active Progress Line */}
           {/* Active Progress Line */}
              <div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStepIdx / Math.max(1, (statusSteps?.length || 1) - 1)) * 100}%` }}
              />

              {(statusSteps || []).map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    isCompleted 
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 ring-4 ring-slate-900' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] mt-2 font-medium hidden sm:block ${
                    isCurrent ? 'text-white font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Telemetry Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Map & Event Log */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map View Component */}
          <InteractiveMap shipment={shipment} />

          {/* Tracking History Event Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Transit Checkpoint History
              </h3>
              <span className="text-[11px] text-slate-400">{shipment.events.length} Events Recorded</span>
            </div>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
              {shipment.events.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Event Marker Icon */}
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900 shadow" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <span className="font-bold text-white">{evt.status} - {evt.location}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{evt.description}</p>
                  <span className="text-[10px] text-slate-500 mt-1 inline-block">Updated by: {evt.updatedBy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Courier Info, Package Specs, Proof of Delivery */}
        <div className="space-y-6">
          
          {/* AI Risk Predictor Trigger Button */}
          <button
            onClick={onOpenAiPredictor}
            className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-900 hover:to-purple-900 border border-indigo-500/40 p-4 rounded-2xl text-left transition shadow-lg group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                AI Delay Risk Engine
              </span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-xs text-slate-300">
              Run server-side Gemini simulation for weather, traffic, and customs delays.
            </p>
          </button>

          {/* Assigned Driver Card */}
          {shipment.driver && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  Assigned Courier
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {shipment.driver.rating} ★
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
                  {shipment.driver.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{shipment.driver.name}</h4>
                  <p className="text-xs text-slate-400">{shipment.driver.vehicle}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Plate: {shipment.driver.licensePlate}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCallModal(true)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  Call Courier Driver Directly
                </button>
              </div>

              {/* Compact Live GPS Lat & Lng Panel */}
              <div className="pt-2">
                <LiveLocationPanel
                  compact
                  initialLat={shipment.driver.currentLat}
                  initialLng={shipment.driver.currentLng}
                />
              </div>
            </div>
          )}

          {/* Package Technical Specifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <h4 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Package Specifications
            </h4>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">Weight</span>
                <strong className="text-white">{shipment.weightKg} kg</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Dimensions</span>
                <strong className="text-white">{shipment.dimensionsCm} cm</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Declared Value</span>
                <strong className="text-white">${shipment.declaredValueUsd} USD</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Package Type</span>
                <strong className="text-white">{shipment.packageType}</strong>
              </div>
            </div>

            <button
              onClick={() => generatePodPdf(shipment)}
              className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 hover:border-blue-500/50 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Download Package PDF Receipt
            </button>
          </div>

          {/* Proof of Delivery Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Proof of Delivery
              </span>
              {shipment.proofOfDelivery && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                  shipment.proofOfDelivery.verificationStatus === 'VERIFIED' || !shipment.proofOfDelivery.verificationStatus
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {shipment.proofOfDelivery.verificationStatus === 'VERIFIED' || !shipment.proofOfDelivery.verificationStatus ? 'Verified ✅' : 'Pending Audit'}
                </span>
              )}
            </div>

            {shipment.proofOfDelivery ? (
              <div className="space-y-2 text-xs">
                <p className="text-slate-300">
                  Recipient: <strong className="text-white">{shipment.proofOfDelivery.recipientName}</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Delivered At: {shipment.proofOfDelivery.deliveredAt || shipment.proofOfDelivery.timestamp}
                </p>
                
                {/* Signature Preview */}
                {(shipment.proofOfDelivery.signatureImageUrl || shipment.proofOfDelivery.signatureDataUrl) && (
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-1">Digital Signature:</span>
                    <img
                      src={shipment.proofOfDelivery.signatureImageUrl || shipment.proofOfDelivery.signatureDataUrl}
                      alt="Digital Signature"
                      className="h-12 max-w-full object-contain filter invert"
                    />
                  </div>
                )}

                <button
                  onClick={onOpenPodModal}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Proof of Delivery
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {shipment.status === 'Delivered' 
                    ? 'Package is delivered. Verification receipt processing by courier.' 
                    : 'Proof of Delivery signature & photo will be uploaded automatically upon delivery.'}
                </p>
                {shipment.status === 'Delivered' && userRole !== 'Customer' && userRole !== 'Business Client' ? (
                  <button
                    onClick={onOpenPodModal}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Record POD Signature
                  </button>
                ) : (
                  <button
                    onClick={onOpenPodModal}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Package & Delivery Details
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DIRECT IN-APP DRIVER CALL DIALER MODAL */}
      {showCallModal && shipment.driver && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCallModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-6 my-auto animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setShowCallModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-blue-500/50 flex items-center justify-center font-black text-3xl text-white shadow-xl mx-auto">
                {shipment.driver.name.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-950">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{shipment.driver.name}</h3>
              <p className="text-xs text-blue-400 font-mono mt-0.5">{shipment.driver.phone}</p>
              <p className="text-[11px] text-slate-400 mt-1">{shipment.driver.vehicle} ({shipment.driver.licensePlate})</p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Call ({formatTime(callDuration)})
              </div>
            </div>

            {/* Audio Call Control Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition ${
                  isMuted ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
                {isMuted ? 'Muted' : 'Mute'}
              </button>

              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition ${
                  isSpeaker ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Volume2 className={`w-5 h-5 ${isSpeaker ? 'text-blue-400' : ''}`} />
                Speaker
              </button>

              <a
                href={`tel:${shipment.driver.phone}`}
                className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl border border-emerald-500/40 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition"
              >
                <Phone className="w-5 h-5" />
                Cellular
              </a>
            </div>

            {/* Red End Call Button */}
            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
