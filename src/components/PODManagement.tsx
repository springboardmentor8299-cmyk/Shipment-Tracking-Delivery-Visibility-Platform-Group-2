import React, { useState, useRef } from 'react';
import { Shipment, ProofOfDelivery } from '../types';
import { generatePodPdf } from '../utils/generatePodPdf';
import { 
  Award, 
  CheckCircle2, 
  Camera, 
  Upload, 
  Download, 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  RotateCcw, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  UserCheck, 
  Layers, 
  Sparkles,
  Lock,
  HardDrive
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PODManagementProps {
  shipments: Shipment[];
  onUpdateShipmentPod?: (shipmentId: string, podData: ProofOfDelivery) => void;
}

export const PODManagement: React.FC<PODManagementProps> = ({ shipments, onUpdateShipmentPod }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'All' | 'Verified' | 'Pending Audit' | 'Disputed'>('All');
  const [selectedPodShipment, setSelectedPodShipment] = useState<Shipment | null>(null);
  
  // Signature Canvas state for new POD capture in view
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  
  // Capture Form State
  const [captureShipmentId, setCaptureShipmentId] = useState<string>(shipments[0]?.id || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelation, setRecipientRelation] = useState('Direct Recipient');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  // Filter shipments that have POD or are delivered
  const deliveredShipments = shipments.filter(s => s.status === 'Delivered' || s.proofOfDelivery);

  const filteredPods = deliveredShipments.filter(s => {
    const matchesSearch = 
      s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.proofOfDelivery?.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.proofOfDelivery?.verificationCode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (verificationFilter === 'Verified') return matchesSearch && s.proofOfDelivery;
    if (verificationFilter === 'Pending Audit') return matchesSearch && s.status === 'Delivered' && !s.proofOfDelivery;
    return matchesSearch;
  });

  // Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Submit new POD Evidence
  const handleCreatePod = (e: React.FormEvent) => {
    e.preventDefault();
    let sigData = '';
    if (canvasRef.current && hasSigned) {
      sigData = canvasRef.current.toDataURL('image/png');
    } else {
      sigData = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" fill="white" font-family="cursive" font-size="24">' + (recipientName || 'Signed') + '</text></svg>';
    }

    const podRecord: ProofOfDelivery = {
      recipientName: `${recipientName} (${recipientRelation})`,
      signatureDataUrl: sigData,
      photoUrl,
      notes: deliveryNotes || 'Standard door dropoff verified via driver terminal.',
      deliveredAt: new Date().toLocaleString(),
      verificationCode: `POD-CRYPT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    if (onUpdateShipmentPod) {
      onUpdateShipmentPod(captureShipmentId, podRecord);
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setShowCaptureModal(false);
    setRecipientName('');
    setDeliveryNotes('');
  };

  // Download official POD PDF Certificate
  const handleDownloadCertificate = async (s: Shipment) => {
    await generatePodPdf(s);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Delivery Receipts
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Proof of Delivery & Receipts
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            View, inspect, and verify proof of delivery records, digital signatures, and delivery evidence.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Verified Delivery Receipts</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {shipments.filter(s => s.proofOfDelivery?.verificationStatus === 'VERIFIED' || (s.proofOfDelivery && !s.proofOfDelivery.verificationStatus)).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Formal Verification Complete</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pending Review Receipts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {shipments.filter(s => s.proofOfDelivery?.verificationStatus === 'PENDING').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Admin / Support Audit</div>
        </div>
      </div>

      {/* POD Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracking #, recipient, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-slate-400 font-semibold whitespace-nowrap">Filter Status:</span>
          {(['All', 'Verified', 'Pending Audit'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setVerificationFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                verificationFilter === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* POD Evidence Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3.5">Tracking Number</th>
                <th className="p-3.5">Recipient & Location</th>
                <th className="p-3.5">Delivered At</th>
                <th className="p-3.5">Verification Code</th>
                <th className="p-3.5">Digital Signature</th>
                <th className="p-3.5">Photo Evidence</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredPods.map((s) => {
                const pod = s.proofOfDelivery;
                return (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold font-mono text-blue-400">{s.trackingNumber}</td>
                    
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{pod?.recipientName || s.receiverName}</div>
                      <div className="text-[10px] text-slate-400">{s.receiverAddress.city}, {s.receiverAddress.state || s.receiverAddress.country}</div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-300">
                      {pod?.deliveredAt || s.estimatedDeliveryTime}
                    </td>

                    <td className="p-3.5 font-mono">
                      {pod?.verificationCode ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold text-[10px]">
                          {pod.verificationCode}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold text-[10px]">
                          Pending Audit
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {pod?.signatureDataUrl ? (
                        <div className="h-8 w-20 bg-slate-950 p-1 rounded border border-slate-800 flex items-center justify-center">
                          <img src={pod.signatureDataUrl} alt="Signature" className="h-full object-contain filter invert" />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No Signature</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {pod?.photoUrl ? (
                        <div className="h-8 w-12 rounded overflow-hidden border border-slate-700 bg-slate-950">
                          <img src={pod.photoUrl} alt="Photo Proof" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No Photo</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPodShipment(s)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium border border-slate-700 transition"
                      >
                        Inspect
                      </button>

                      {pod && (
                        <button
                          onClick={() => handleDownloadCertificate(s)}
                          className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 rounded font-medium transition"
                          title="Download Audit Certificate"
                        >
                          Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT POD MODAL */}
      {selectedPodShipment && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedPodShipment(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed at Top */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  POD Evidence Inspection Record
                </h3>
                <p className="text-xs text-slate-400 font-mono">Tracking #{selectedPodShipment.trackingNumber}</p>
              </div>
              <button
                onClick={() => setSelectedPodShipment(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {selectedPodShipment.proofOfDelivery ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">Cryptographically Verified Proof of Delivery</span>
                      <span className="text-[10px] font-mono">Code: {selectedPodShipment.proofOfDelivery.verificationCode}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Signed Recipient</span>
                      <strong className="text-white text-xs">{selectedPodShipment.proofOfDelivery.recipientName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Delivered Timestamp</span>
                      <strong className="text-white text-xs">{selectedPodShipment.proofOfDelivery.deliveredAt}</strong>
                    </div>
                  </div>

                  {/* Signature View */}
                  {selectedPodShipment.proofOfDelivery.signatureDataUrl && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-1">Digital Signature Record:</span>
                      <img
                        src={selectedPodShipment.proofOfDelivery.signatureDataUrl}
                        alt="Signature"
                        className="h-16 mx-auto object-contain filter invert"
                      />
                    </div>
                  )}

                  {/* Photo View */}
                  {selectedPodShipment.proofOfDelivery.photoUrl && (
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-1">Geotagged Photo Proof:</span>
                      <img
                        src={selectedPodShipment.proofOfDelivery.photoUrl}
                        alt="Delivery Photo"
                        className="w-full h-44 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Delivery Notes */}
                  {selectedPodShipment.proofOfDelivery.notes && (
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-semibold">Driver Delivery Notes:</span>
                      <p className="text-slate-200 mt-0.5">{selectedPodShipment.proofOfDelivery.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDownloadCertificate(selectedPodShipment)}
                      className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setSelectedPodShipment(null)}
                      className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-white font-bold">No Digital POD Uploaded Yet</p>
                  <p className="text-xs text-slate-400">
                    This shipment is delivered but awaiting driver terminal sync for signature and photo evidence.
                  </p>
                  <button
                    onClick={() => setSelectedPodShipment(null)}
                    className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
