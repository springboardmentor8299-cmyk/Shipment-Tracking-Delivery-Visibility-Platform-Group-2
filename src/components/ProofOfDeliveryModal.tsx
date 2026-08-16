import React, { useRef, useState } from 'react';
import { Shipment, UserRole } from '../types';
import { Award, X, CheckCircle2, RotateCcw, Camera, Upload, Download, ShieldCheck, Clock, AlertTriangle, Package, Truck, Lock, FileText, MapPin, User, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePodPdf } from '../utils/generatePodPdf';

interface ProofOfDeliveryModalProps {
  shipment: Shipment | null;
  userRole?: UserRole;
  onClose: () => void;
  onSubmitPod: (shipmentId: string, podData: any) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  shipment,
  userRole = 'Customer',
  onClose,
  onSubmitPod,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [recipientName, setRecipientName] = useState(shipment?.proofOfDelivery?.recipientName || shipment?.receiverName || '');
  const [notes, setNotes] = useState(shipment?.proofOfDelivery?.notes || '');
  const [photoUrl, setPhotoUrl] = useState<string>(
    shipment?.proofOfDelivery?.deliveryPhotoUrl || shipment?.proofOfDelivery?.photoUrl || 
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600'
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!shipment) return null;

  const existingPod = shipment.proofOfDelivery;
  const isDelivered = shipment.status === 'Delivered';
  const isBusinessClient = userRole === 'Business Client';
  const isCustomer = userRole === 'Customer';
  const isClientRole = isBusinessClient || isCustomer;

  // Signature can ONLY be captured if package IS delivered AND user is NOT a Business Client or Customer
  const canCaptureSignature = isDelivered && !isClientRole && !existingPod;

  const handleDownloadPodPdf = async () => {
    await generatePodPdf(shipment);
  };

  // Signature drawing canvas handlers
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSavePod = (e: React.FormEvent) => {
    e.preventDefault();
    let signatureDataUrl = existingPod?.signatureImageUrl || existingPod?.signatureDataUrl || '';

    if (canvasRef.current && hasSigned) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    onSubmitPod(shipment.id, {
      recipientName,
      signatureImageUrl: signatureDataUrl,
      signatureDataUrl,
      deliveryPhotoUrl: photoUrl,
      photoUrl,
      notes,
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  const sigUrl = existingPod?.signatureImageUrl || existingPod?.signatureDataUrl;
  const imgPhotoUrl = existingPod?.deliveryPhotoUrl || existingPod?.photoUrl;
  const status = existingPod?.verificationStatus || 'VERIFIED';

  return (
    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl my-auto max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0 bg-slate-900">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                {existingPod ? 'Proof of Delivery Receipt' : canCaptureSignature ? 'Record Proof of Delivery' : 'Package & Delivery Details'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Shipment #{shipment.trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">

        {/* 1. Existing POD Receipt View */}
        {existingPod ? (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-slate-200">
              <div className="flex items-center gap-2.5">
                {status === 'VERIFIED' && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Verified ✅
                  </span>
                )}
                {status === 'PENDING' && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-xs flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Pending Audit
                  </span>
                )}
                {status === 'FLAGGED' && (
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-bold text-xs flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Flagged ⚠️
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Code: {existingPod.verificationCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Recipient Name</span>
                <strong className="text-white text-xs">{existingPod.recipientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Delivery Timestamp</span>
                <strong className="text-white text-xs">{existingPod.deliveredAt || existingPod.timestamp}</strong>
              </div>
            </div>

            {/* Signature & Doorstep Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sigUrl && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Recipient Signature</span>
                  <img
                    src={sigUrl}
                    alt="Digital Signature"
                    className="h-20 mx-auto object-contain filter invert"
                  />
                </div>
              )}

              {imgPhotoUrl && (
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Delivered Doorstep Photo</span>
                  <img
                    src={existingPod.deliveredPackagePhotoUrl || imgPhotoUrl}
                    alt="Doorstep Delivery Proof"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {existingPod.notes && (
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Handover Notes:</span>
                <p className="text-slate-200 mt-0.5">{existingPod.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadPodPdf}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Delivery Voucher
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : canCaptureSignature ? (
          /* 2. Signature & Photo Capture Form ONLY for Operators/Admins on DELIVERED packages */
          <form onSubmit={handleSavePod} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Recipient Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Robert Martinez (Concierge Manager)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* Canvas Signature Pad */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Sign Below (Touch or Mouse)</label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Signature
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl border-2 border-dashed border-slate-700 overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 cursor-crosshair touch-none"
                />
                {!hasSigned && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-[11px]">
                    Draw signature here...
                  </span>
                )}
              </div>
            </div>

            {/* Photo Proof Upload */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                Delivery Package Photo Evidence
              </label>

              {/* Hidden File Inputs for Camera and File Picker */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center gap-3">
                <img
                  src={photoUrl}
                  alt="Delivery Photo Preview"
                  className="w-20 h-16 object-cover rounded-lg border border-slate-600 shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[11px] font-semibold text-white block">Package On Doorstep / Handover Photo</span>
                  <span className="text-[10px] text-slate-400">Upload package photo via camera or device storage</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-md shadow-blue-600/20"
                  >
                    <Camera className="w-3.5 h-3.5" /> Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border border-slate-600"
                  >
                    <Upload className="w-3.5 h-3.5" /> Choose File
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Handover Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Handed directly to front desk with ID verified."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Confirm & Save POD
              </button>
            </div>
          </form>
        ) : (
          /* 3. Package Details View - NO SIGNATURE PAD for In-Transit Packages or Business Client / Customer Roles */
          <div className="space-y-4 text-xs">
            {/* Status Warning Banner */}
            {!isDelivered ? (
              <div className="p-3.5 bg-amber-950/70 border border-amber-500/40 rounded-xl flex items-start gap-3 text-amber-200">
                <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs block flex items-center gap-2">
                    Package In Transit ({shipment.status})
                  </span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    This package has not been delivered yet. Proof of delivery signature and photo verification are captured exclusively upon physical delivery handover by the courier driver.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-indigo-950/70 border border-indigo-500/40 rounded-xl flex items-start gap-3 text-indigo-200">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs block">
                    Proof of Delivery Verification
                  </span>
                  <p className="text-[11px] text-indigo-200/90 leading-relaxed">
                    As a <strong>{userRole}</strong>, signature collection is handled by assigned logistics drivers and operations staff upon delivery completion. Below are the complete specifications for this shipment.
                  </p>
                </div>
              </div>
            )}

            {/* Full Package Specifications Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">Package Specifications</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  shipment.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  shipment.status === 'Out for Delivery' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {shipment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block">Sender / Shipper</span>
                  <strong className="text-white text-xs">{shipment.senderName}</strong>
                  <span className="text-[10px] text-slate-400 block">{shipment.senderAddress.city}, {shipment.senderAddress.country}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Recipient</span>
                  <strong className="text-white text-xs">{shipment.receiverName}</strong>
                  <span className="text-[10px] text-slate-400 block">{shipment.receiverAddress.city}, {shipment.receiverAddress.country}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Cargo Description</span>
                  <strong className="text-white text-xs">{shipment.contentsDescription || 'Commercial Freight'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Priority & Type</span>
                  <strong className="text-white text-xs">{shipment.priority} ({shipment.packageType})</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Weight & Dimensions</span>
                  <strong className="text-white text-xs">{shipment.weightKg} kg | {shipment.dimensionsCm} cm</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Estimated Delivery</span>
                  <strong className="text-white text-xs">{shipment.estimatedDeliveryTime}</strong>
                </div>
              </div>

              {shipment.driver && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-400" /> Courier: <strong className="text-white">{shipment.driver.name}</strong>
                  </span>
                  <span className="text-slate-500 font-mono">Vehicle: {shipment.driver.vehicle}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadPodPdf}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Package Document (PDF)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

