import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Shipment, ShipmentStatus, ProofOfDelivery, UserRole, IssueType, TransitIssue, ChatMessage } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Navigation, 
  Phone, 
  Camera, 
  Upload,
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  Zap, 
  Check, 
  Search, 
  FileText, 
  ArrowRight, 
  User, 
  Building, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  PackageCheck,
  RefreshCw,
  MessageSquare,
  AlertOctagon,
  ArrowLeft,
  Send,
  ImageIcon,
  Calendar,
  TrendingUp,
  Siren
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CountdownTimer: React.FC<{ initialSeconds?: number; onExpire: () => void }> = ({ initialSeconds = 120, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const pct = Math.max(0, Math.min(100, (secondsLeft / initialSeconds) * 100));

  return (
    <div className="flex flex-col gap-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30">
      <div className="flex items-center justify-between text-xs font-mono font-bold">
        <span className="text-amber-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
          <span>Response Window: <strong className="text-white font-extrabold text-sm">{formatted}</strong></span>
        </span>
        <span className="text-[10px] text-slate-400">Auto-returns to Admin if unaccepted</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${pct < 25 ? 'bg-rose-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

interface DriverDashboardProps {
  currentUser: { id?: string; name: string; email: string; role: UserRole; companyName?: string } | null;
  shipments: Shipment[];
  onUpdateStatus: (id: string, status: ShipmentStatus, location: string, note: string, extraData?: any) => void;
  onSubmitPod: (shipmentId: string, podData: any) => void;
  onUpdateTelemetry?: (id: string, lat: number, lng: number, speedKmH: number, batteryPct: number) => void;
  onDispatchRespond?: (shipmentId: string, action: 'ACCEPT' | 'DECLINE' | 'EXPIRE', reason?: string) => Promise<void> | void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentUser,
  shipments,
  onUpdateStatus,
  onSubmitPod,
  onUpdateTelemetry,
  onDispatchRespond,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'map' | 'history'>('tasks');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Dispatch Offer Response Modal State
  const [decliningShipment, setDecliningShipment] = useState<Shipment | null>(null);
  const [declineReason, setDeclineReason] = useState('Vehicle maintenance required / Capacity exceeded');
  const [customDeclineReason, setCustomDeclineReason] = useState('');
  
  // Selected Detail View Shipment
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailTab, setDetailTab] = useState<'map_route' | 'actions' | 'issues' | 'chat'>('map_route');

  // Live GPS Broadcasting State
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(62);
  const [batteryLevel, setBatteryLevel] = useState(88);

  // Toast / Banner Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [podShipment, setPodShipment] = useState<Shipment | null>(null);
  const [failedShipment, setFailedShipment] = useState<Shipment | null>(null);
  const [pickupPhotoShipment, setPickupPhotoShipment] = useState<Shipment | null>(null);
  const [issueShipment, setIssueShipment] = useState<Shipment | null>(null);
  const [viewingPod, setViewingPod] = useState<Shipment | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Pickup Photo Form State
  const [pickupPhotoUrl, setPickupPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600'
  );
  const [pickupNotes, setPickupNotes] = useState<string>('Pre-transit condition verified. No outer package damage.');

  // Issue Form State
  const [issueType, setIssueType] = useState<IssueType>('Traffic/Road Block');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [issuePhotoUrl, setIssuePhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600'
  );

  // Chat Input State
  const [chatInputText, setChatInputText] = useState<string>('');

  // Failed Form State
  const [failedReason, setFailedReason] = useState('Recipient Not Available');
  const [failedNotes, setFailedNotes] = useState('');

  // POD Form State inside Driver Modal
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const driverPodCameraRef = useRef<HTMLInputElement | null>(null);
  const driverPodFileRef = useRef<HTMLInputElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [deliveredPhotoUrl, setDeliveredPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600'
  );

  const handleDriverPodPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDeliveredPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pending Dispatch Offers (Awaiting Driver Accept / Decline)
  const pendingDispatchOffers = useMemo(() => {
    return shipments.filter(s => {
      if (s.dispatchStatus !== 'Pending Acceptance') return false;
      const userFirst = (currentUser?.name || 'Rajesh').split(' ')[0].toLowerCase();
      const opName = (s.assignedOperatorName || s.driver?.name || '').toLowerCase();
      
      return (
        opName.includes(userFirst) ||
        opName.includes('rajesh') ||
        opName.includes('verma') ||
        s.assignedOperatorId === currentUser?.id ||
        !s.assignedOperatorId
      );
    });
  }, [shipments, currentUser]);

  // Filter ONLY active accepted shipments assigned to this Logistics Operator
  const assignedShipments = useMemo(() => {
    const userFirst = (currentUser?.name || 'Rajesh').split(' ')[0].toLowerCase();
    const userEmail = (currentUser?.email || '').toLowerCase();

    return shipments.filter(s => {
      // Exclude pending dispatch offers or declined shipments from the active queue
      if (s.dispatchStatus === 'Pending Acceptance' || s.dispatchStatus === 'Declined') {
        return false;
      }

      if (!s.driver && !s.assignedOperatorName) return false;
      const dName = (s.driver?.name || s.assignedOperatorName || '').toLowerCase();
      
      return (
        dName.includes(userFirst) || 
        dName.includes('rajesh') || 
        dName.includes('verma') ||
        s.driver?.id === currentUser?.id ||
        s.assignedOperatorId === currentUser?.id ||
        (userEmail && userEmail.includes('rajesh'))
      );
    });
  }, [shipments, currentUser]);

  // Keep selectedShipment reference synchronized with shipments prop changes
  const activeDetailShipment = useMemo(() => {
    if (!selectedShipment) return null;
    return shipments.find(s => s.id === selectedShipment.id) || selectedShipment;
  }, [shipments, selectedShipment]);

  // Derived Statistics for Driver
  const totalAssigned = assignedShipments.length;
  const deliveredCount = assignedShipments.filter(s => s.status === 'Delivered').length;
  const failedCount = assignedShipments.filter(s => s.status === 'Failed Delivery').length;
  const pendingCount = assignedShipments.filter(s => !['Delivered', 'Failed Delivery', 'Cancelled'].includes(s.status)).length;
  const totalIssuesCount = assignedShipments.reduce((acc, s) => acc + (s.issues?.length || 0), 0);
  const onTimeRate = totalAssigned > 0 ? Math.round(((deliveredCount) / (deliveredCount + failedCount || 1)) * 100) : 100;

  // Active shipment currently en route for map focusing
  const activeEnRouteShipment = assignedShipments.find(s => s.status === 'Out for Delivery' || s.status === 'In Transit') || assignedShipments[0];

  // Filtered Shipment Cards for Driver Queue
  const filteredQueue = assignedShipments.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchesQuery = !q || 
      s.trackingNumber.toLowerCase().includes(q) ||
      s.receiverName.toLowerCase().includes(q) ||
      s.receiverAddress.city.toLowerCase().includes(q) ||
      s.receiverAddress.address?.toLowerCase().includes(q);

    if (!matchesQuery) return false;
    if (statusFilter === 'ACTION') return ['Created', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status);
    if (statusFilter === 'DELIVERED') return s.status === 'Delivered';
    if (statusFilter === 'FAILED') return s.status === 'Failed Delivery';
    return true;
  });

  // Dispatch Offer Handlers
  const handleAcceptOffer = async (shipment: Shipment) => {
    try {
      if (onDispatchRespond) {
        await onDispatchRespond(shipment.id, 'ACCEPT');
      } else {
        await fetch(`/api/shipments/${shipment.id}/dispatch-respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ACCEPT', operatorName: currentUser?.name || 'Rajesh Verma' }),
        });
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      triggerToast(`⚡ Job #${shipment.trackingNumber} ACCEPTED! Added to your active pickup queue.`);
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleDeclineOffer = async (shipment: Shipment, reason: string) => {
    try {
      if (onDispatchRespond) {
        await onDispatchRespond(shipment.id, 'DECLINE', reason);
      } else {
        await fetch(`/api/shipments/${shipment.id}/dispatch-respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DECLINE', reason, operatorName: currentUser?.name || 'Rajesh Verma' }),
        });
      }
      setDecliningShipment(null);
      triggerToast(`Job #${shipment.trackingNumber} DECLINED and returned to Admin queue.`);
    } catch (err) {
      console.error('Decline error:', err);
    }
  };

  const handleExpireOffer = async (shipment: Shipment) => {
    try {
      if (onDispatchRespond) {
        await onDispatchRespond(shipment.id, 'EXPIRE');
      } else {
        await fetch(`/api/shipments/${shipment.id}/dispatch-respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'EXPIRE', operatorName: currentUser?.name || 'Rajesh Verma' }),
        });
      }
      triggerToast(`Dispatch offer #${shipment.trackingNumber} TIMED OUT (2-min window) and returned to Admin.`);
    } catch (err) {
      console.error('Expire error:', err);
    }
  };

  // Simulated GPS Telemetry Broadcasting Loop
  useEffect(() => {
    if (!isBroadcasting) return;

    const interval = setInterval(() => {
      setCurrentSpeed(prev => Math.max(35, Math.min(85, Math.floor(prev + (Math.random() * 8 - 4)))));

      const activeShipments = assignedShipments.filter(s => s.status === 'In Transit' || s.status === 'Out for Delivery');

      activeShipments.forEach(s => {
        if (!s.driver) return;
        const latDelta = (Math.random() - 0.48) * 0.0008;
        const lngDelta = (Math.random() - 0.48) * 0.0008;
        const newLat = Number((s.driver.currentLat + latDelta).toFixed(5));
        const newLng = Number((s.driver.currentLng + lngDelta).toFixed(5));

        if (onUpdateTelemetry) {
          onUpdateTelemetry(s.id, newLat, newLng, currentSpeed, batteryLevel);
        } else {
          fetch(`/api/shipments/${s.id}/telemetry`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: newLat,
              lng: newLng,
              speedKmH: currentSpeed,
              batteryPct: batteryLevel,
              locationName: s.currentLocation?.address || 'En Route Highway Corridor',
            }),
          }).catch(err => console.error('Telemetry update failed:', err));
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isBroadcasting, assignedShipments, currentSpeed, batteryLevel, onUpdateTelemetry]);

  // Handle Call Customer (Masked Phone Button)
  const handleCallCustomer = (shipment: Shipment) => {
    triggerToast(`Connecting privacy-masked call to recipient (${shipment.receiverName})...`);
    window.location.href = `tel:${shipment.receiverPhone || '+919876543210'}`;
  };

  // Handle Emergency SOS Alert Button
  const handleTriggerSos = (shipment: Shipment) => {
    fetch(`/api/shipments/${shipment.id}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operatorName: currentUser?.name || 'Rajesh Verma',
        notes: `Emergency SOS pressed by driver near ${shipment.currentLocation?.address || 'transit corridor'}.`,
      }),
    })
    .then(() => {
      triggerToast(`🚨 EMERGENCY SOS BROADCAST SENT to Admin & Support Agent!`);
      shipment.sosAlertActive = true;
    })
    .catch(err => console.error('SOS request failed:', err));
  };

  // Open Pickup Condition Photo Modal
  const openPickupPhotoModal = (s: Shipment) => {
    setPickupPhotoShipment(s);
    setPickupNotes('Pre-transit condition verified. Package intact.');
  };

  // Submit Pickup Condition Photo
  const handleSubmitPickupPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupPhotoShipment) return;

    fetch(`/api/shipments/${pickupPhotoShipment.id}/pickup-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupPhotoUrl,
        note: pickupNotes,
      }),
    })
    .then(() => {
      onUpdateStatus(
        pickupPhotoShipment.id, 
        'Picked Up', 
        `${pickupPhotoShipment.senderAddress.city}, ${pickupPhotoShipment.senderAddress.state}`, 
        `Confirmed pickup from sender location with pre-transit photo verification.`
      );
      triggerToast(`Pickup confirmed & condition photo logged for #${pickupPhotoShipment.trackingNumber}`);
      setPickupPhotoShipment(null);
    })
    .catch(err => console.error('Pickup photo failed:', err));
  };

  // Open Issue Reporting Modal
  const openIssueModal = (s: Shipment) => {
    setIssueShipment(s);
    setIssueType('Traffic/Road Block');
    setIssueNotes('');
  };

  // Submit Transit Issue / Complaint
  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueShipment) return;

    fetch(`/api/shipments/${issueShipment.id}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issueType,
        notes: issueNotes,
        photoUrl: issuePhotoUrl,
        reportedBy: currentUser?.name || 'Rajesh Verma',
      }),
    })
    .then(res => res.json())
    .then(data => {
      triggerToast(`Transit issue (${issueType}) reported to Support Agent & Customer.`);
      if (!issueShipment.issues) issueShipment.issues = [];
      issueShipment.issues.unshift(data.issue);
      setIssueShipment(null);
    })
    .catch(err => console.error('Issue reporting failed:', err));
  };

  // Handle Send Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailShipment || !chatInputText.trim()) return;

    const textToSend = chatInputText;
    setChatInputText('');

    fetch(`/api/shipments/${activeDetailShipment.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: `${currentUser?.name || 'Rajesh Verma'} (Driver)`,
        senderRole: 'Logistics Operator',
        text: textToSend,
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (!activeDetailShipment.chatMessages) activeDetailShipment.chatMessages = [];
      activeDetailShipment.chatMessages.push(data.chatMessage);
    })
    .catch(err => console.error('Chat send failed:', err));
  };

  // Open Driver POD Capture Modal
  const openPodModal = (s: Shipment) => {
    setPodShipment(s);
    setRecipientName(s.receiverName);
    setPodNotes('');
    setHasSigned(false);
  };

  // Drawing Canvas Handlers for Signature
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

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8';
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

  // Submit POD from Driver Modal
  const handleDriverSubmitPod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podShipment) return;

    let sigDataUrl = '';
    if (canvasRef.current && hasSigned) {
      sigDataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      sigDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><path d="M20 50 Q 80 10 120 60 T 220 40 T 280 50" fill="none" stroke="%2338bdf8" stroke-width="3"/></svg>';
    }

    onSubmitPod(podShipment.id, {
      recipientName,
      signatureDataUrl: sigDataUrl,
      signatureImageUrl: sigDataUrl,
      deliveryPhotoUrl: deliveredPhotoUrl,
      deliveredPackagePhotoUrl: deliveredPhotoUrl,
      photoUrl: deliveredPhotoUrl,
      notes: podNotes || 'Delivered directly to recipient with signature & doorstep package photo.',
      latitude: podShipment.receiverAddress.lat,
      longitude: podShipment.receiverAddress.lng,
      capturedByUserId: currentUser?.email || 'driver-rajesh',
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    setPodShipment(null);
    triggerToast(`Proof of delivery recorded for #${podShipment.trackingNumber}! (Pending Support Audit)`);
  };

  // Submit Failed Delivery
  const handleDriverSubmitFailed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failedShipment) return;

    onUpdateStatus(
      failedShipment.id, 
      'Failed Delivery', 
      `${failedShipment.receiverAddress.city}, ${failedShipment.receiverAddress.state}`, 
      `Delivery Failed: ${failedReason} (${failedNotes || 'No extra notes'})`,
      { failedReason, failedNotes }
    );

    setFailedShipment(null);
    setFailedReason('Recipient Not Available');
    setFailedNotes('');
    triggerToast(`Delivery marked as Failed for #${failedShipment.trackingNumber}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 text-white">

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white border border-cyan-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm text-xs">
          <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. MOBILE-FIRST DRIVER APP HEADER & PROFILE BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Driver Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  {currentUser?.name || 'Rajesh Verma'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  Driver / Courier
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Mahindra Furio #402</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-300 font-semibold">MH-04-XX-8899</span>
              </p>
            </div>
          </div>

          {/* GPS Broadcasting & End of Day Summary Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl">
            <div className="text-left text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <span className={`w-2.5 h-2.5 rounded-full ${isBroadcasting ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span>{isBroadcasting ? 'GPS Telemetry Live' : 'GPS Offline'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                {isBroadcasting ? `${currentSpeed} km/h • Bat ${batteryLevel}%` : 'Broadcasting paused'}
              </span>
            </div>

            <button
              onClick={() => setIsBroadcasting(!isBroadcasting)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                isBroadcasting 
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {isBroadcasting ? 'Pause GPS' : 'Start GPS'}
            </button>

            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow"
              title="View Daily Delivery Performance Summary"
            >
              Daily Summary
            </button>
          </div>
        </div>

        {/* Quick Driver Stats Pills */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
          <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Total Stops</span>
            <span className="text-base font-extrabold text-white font-mono">{totalAssigned}</span>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold block">Pending</span>
            <span className="text-base font-extrabold text-blue-400 font-mono">{pendingCount}</span>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold block">Delivered</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">{deliveredCount}</span>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold block">Offers</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">{pendingDispatchOffers.length}</span>
          </div>
        </div>

        {/* ⚡ DISPATCH ALERTS BANNER / PENDING OFFERS QUEUE */}
        {pendingDispatchOffers.length > 0 && !selectedShipment && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <h3 className="text-sm font-extrabold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Dispatch Alert — New Job Offers ({pendingDispatchOffers.length})
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Action Required
              </span>
            </div>

            {pendingDispatchOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl relative overflow-hidden space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white font-mono tracking-tight">
                        #{offer.trackingNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        offer.priority === 'Critical Freight' || offer.priority === 'Overnight'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : offer.priority === 'Express'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {offer.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {offer.packageType} • <span className="font-mono">{offer.weightKg} kg</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">PICKUP WINDOW</span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                      {offer.pickupWindow || 'Today by 2:00 PM'}
                    </span>
                  </div>
                </div>

                {/* 2-Min Countdown Timer */}
                <CountdownTimer
                  initialSeconds={120}
                  onExpire={() => handleExpireOffer(offer)}
                />

                {/* Pickup & Dropoff Route Brief */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Pickup Origin
                    </span>
                    <p className="font-bold text-slate-100">{offer.senderName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{offer.senderAddress.address || `${offer.senderAddress.city}, ${offer.senderAddress.state}`}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> Drop-off Destination
                    </span>
                    <p className="font-bold text-slate-100">{offer.receiverName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{offer.receiverAddress.address || `${offer.receiverAddress.city}, ${offer.receiverAddress.state}`}</p>
                  </div>
                </div>

                {/* Accept & Decline Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAcceptOffer(offer)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ACCEPT JOB OFFER</span>
                  </button>

                  <button
                    onClick={() => setDecliningShipment(offer)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 hover:border-rose-500/50 flex items-center justify-center gap-1.5 transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleExpireOffer(offer)}
                    className="py-2.5 px-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-amber-300 text-[10px] font-mono rounded-xl border border-slate-800 transition"
                    title="Simulate 2-Min Timer Expired (Auto-return to Admin)"
                  >
                    Simulate Timeout
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* App Navigation Segmented Control */}
        {!selectedShipment && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'tasks' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Today's Tasks ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'map' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Route Map</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'history' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>History & Stats</span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SPECIFIC SHIPMENT DETAIL VIEW (When a card is selected)    */}
      {/* ------------------------------------------------------------- */}
      {selectedShipment && activeDetailShipment && (
        <div className="space-y-4">
          
          {/* Detail View Navigation Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
            <button
              onClick={() => setSelectedShipment(null)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Stops Queue</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Call Customer Masked Button */}
              <button
                onClick={() => handleCallCustomer(activeDetailShipment)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer (**** ***-1234)</span>
              </button>

              {/* SOS Emergency Button */}
              <button
                onClick={() => handleTriggerSos(activeDetailShipment)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow animate-pulse"
                title="Trigger Emergency SOS to Admin & Support Agent"
              >
                <Siren className="w-4 h-4" />
                <span>SOS</span>
              </button>
            </div>
          </div>

          {/* Active SOS Warning Banner if active */}
          {activeDetailShipment.sosAlertActive && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-bold flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-400 shrink-0" />
                <span>EMERGENCY SOS ALERT ACTIVE: Location & Driver Signal Flagged to Admin.</span>
              </div>
              <span className="text-[10px] font-mono text-rose-300">{activeDetailShipment.sosAlertTimestamp}</span>
            </div>
          )}

          {/* Shipment Overview Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-white">#{activeDetailShipment.trackingNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeDetailShipment.priority === 'Critical Freight' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    activeDetailShipment.priority === 'Express' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {activeDetailShipment.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sender: <strong className="text-slate-200">{activeDetailShipment.senderName}</strong> ({activeDetailShipment.senderAddress.city})
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow ${
                activeDetailShipment.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                activeDetailShipment.status === 'Failed Delivery' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
              }`}>
                {activeDetailShipment.status}
              </span>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Recipient</span>
                <strong className="text-white text-sm">{activeDetailShipment.receiverName}</strong>
                <p className="text-slate-300 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{activeDetailShipment.receiverAddress.address || `${activeDetailShipment.receiverAddress.city}, ${activeDetailShipment.receiverAddress.state}`}</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Package Spec</span>
                <p className="text-slate-200 font-medium">{activeDetailShipment.packageType} ({activeDetailShipment.weightKg} kg)</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Estimated ETA: {activeDetailShipment.estimatedDeliveryTime}</p>
              </div>
            </div>

            {/* Sub-Tabs Navigation for Shipment Detail */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setDetailTab('map_route')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  detailTab === 'map_route' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Pickup & Drop Map</span>
              </button>

              <button
                onClick={() => setDetailTab('actions')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  detailTab === 'actions' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Actions</span>
              </button>

              <button
                onClick={() => setDetailTab('issues')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  detailTab === 'issues' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                <span>Issues ({activeDetailShipment.issues?.length || 0})</span>
              </button>

              <button
                onClick={() => setDetailTab('chat')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  detailTab === 'chat' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chat ({activeDetailShipment.chatMessages?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* 2A. SUB-TAB: PICKUP & DROP-OFF MAP (PER SHIPMENT) */}
          {detailTab === 'map_route' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      Pickup to Drop-off Route Map (#{activeDetailShipment.trackingNumber})
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sender Pickup 📍 ➔ Recipient Drop-off 🎯 with Live Driver Position.
                    </p>
                  </div>

                  <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ~142 km remaining • ~1 hr 45 mins
                  </span>
                </div>

                {/* Map Component */}
                <div className="h-[360px] rounded-xl overflow-hidden border border-slate-800 relative">
                  <InteractiveMap 
                    shipment={activeDetailShipment} 
                  />
                </div>

                {/* Pickup vs Dropoff Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Pickup Location</span>
                      <strong className="text-white text-xs">{activeDetailShipment.senderName}</strong>
                      <p className="text-[11px] text-slate-300">{activeDetailShipment.senderAddress.address || `${activeDetailShipment.senderAddress.city}, ${activeDetailShipment.senderAddress.state}`}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Drop-off Destination</span>
                      <strong className="text-white text-xs">{activeDetailShipment.receiverName}</strong>
                      <p className="text-[11px] text-slate-300">{activeDetailShipment.receiverAddress.address || `${activeDetailShipment.receiverAddress.city}, ${activeDetailShipment.receiverAddress.state}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2B. SUB-TAB: ACTIONS */}
          {detailTab === 'actions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Shipment Status Updates & Photos
              </h3>

              <div className="space-y-3">
                {activeDetailShipment.status === 'Created' && (
                  <button
                    onClick={() => openPickupPhotoModal(activeDetailShipment)}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Confirm Pickup & Capture Pre-Transit Photo</span>
                  </button>
                )}

                {activeDetailShipment.status === 'Picked Up' && (
                  <button
                    onClick={() => onUpdateStatus(activeDetailShipment.id, 'In Transit', `${activeDetailShipment.senderAddress.city} Highway`, 'Departed origin facility en route to destination')}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Start Transit / Depart Origin Facility</span>
                  </button>
                )}

                {activeDetailShipment.status === 'In Transit' && (
                  <button
                    onClick={() => onUpdateStatus(activeDetailShipment.id, 'Out for Delivery', `${activeDetailShipment.receiverAddress.city} Depot`, 'Loaded into driver vehicle for final delivery leg')}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Start Final Delivery Leg (Out for Delivery)</span>
                  </button>
                )}

                {activeDetailShipment.status === 'Out for Delivery' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => openPodModal(activeDetailShipment)}
                      className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Delivery (POD Signature & Doorstep Photo)</span>
                    </button>

                    <button
                      onClick={() => { setFailedShipment(activeDetailShipment); setFailedReason('Recipient Not Available'); setFailedNotes(''); }}
                      className="py-3.5 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Mark Delivery Failed</span>
                    </button>
                  </div>
                )}

                {/* Photos Display Card */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">Verified Parcel Photos</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDetailShipment.pickupPhotoUrl ? (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">📷 Pickup Condition Photo</span>
                        <img src={activeDetailShipment.pickupPhotoUrl} alt="Pickup photo" className="w-full h-32 object-cover rounded-lg" />
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 text-center flex flex-col items-center justify-center">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span>No Pickup Photo Recorded</span>
                      </div>
                    )}

                    {activeDetailShipment.proofOfDelivery?.deliveredPackagePhotoUrl ? (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="text-[10px] text-emerald-400 font-bold block mb-1">📷 Doorstep Delivery Photo</span>
                        <img src={activeDetailShipment.proofOfDelivery.deliveredPackagePhotoUrl} alt="Delivery photo" className="w-full h-32 object-cover rounded-lg" />
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 text-center flex flex-col items-center justify-center">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span>No Doorstep Photo Captured Yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2C. SUB-TAB: REPORT ISSUES & ISSUE HISTORY */}
          {detailTab === 'issues' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-400" />
                    Transit Issues & Complaints Log
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Report traffic delays, breakdowns, or damage to Support Agent & Customer.
                  </p>
                </div>

                {['Picked Up', 'In Transit', 'Out for Delivery'].includes(activeDetailShipment.status) && (
                  <button
                    onClick={() => openIssueModal(activeDetailShipment)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report an Issue</span>
                  </button>
                )}
              </div>

              {/* Issues List */}
              {(!activeDetailShipment.issues || activeDetailShipment.issues.length === 0) ? (
                <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">No Issues Reported for this Shipment</p>
                  <p className="text-[11px] text-slate-500">Journey is proceeding normally without exceptions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeDetailShipment.issues.map(iss => (
                    <div key={iss.id} className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold uppercase">
                          {iss.issueType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{iss.timestamp}</span>
                      </div>
                      <p className="text-slate-200">{iss.notes}</p>
                      {iss.photoUrl && (
                        <img src={iss.photoUrl} alt="Issue photo" className="w-32 h-20 object-cover rounded-lg border border-slate-800" />
                      )}
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                        <span>Reported By: {iss.reportedBy}</span>
                        <span className="text-amber-400 font-bold">Status: {iss.status} (Support Queue Notified)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2D. SUB-TAB: IN-APP CUSTOMER CHAT */}
          {detailTab === 'chat' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    In-App Chat with Recipient ({activeDetailShipment.receiverName})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Direct messaging between driver and customer during active delivery leg.
                  </p>
                </div>
              </div>

              {/* Chat Messages Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto space-y-3 text-xs">
                {(!activeDetailShipment.chatMessages || activeDetailShipment.chatMessages.length === 0) ? (
                  <p className="text-slate-500 text-center my-auto py-12">No chat messages yet. Send a message below.</p>
                ) : (
                  activeDetailShipment.chatMessages.map(msg => {
                    const isDriver = msg.senderRole === 'Logistics Operator';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isDriver ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                          isDriver 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                        }`}>
                          <p className="text-[10px] opacity-75 font-bold mb-0.5">{msg.senderName}</p>
                          <p className="text-xs leading-relaxed">{msg.text}</p>
                          <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              {['Picked Up', 'In Transit', 'Out for Delivery'].includes(activeDetailShipment.status) ? (
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Type a message to recipient..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInputText.trim()}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              ) : (
                <p className="text-[11px] text-slate-500 text-center py-2 bg-slate-950 rounded-xl border border-slate-800">
                  Chat channel archived because shipment is {activeDetailShipment.status}.
                </p>
              )}
            </div>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. TAB 1: TODAY'S ASSIGNED TASKS QUEUE (MAIN LIST VIEW)      */}
      {/* ------------------------------------------------------------- */}
      {!selectedShipment && activeTab === 'tasks' && (
        <div className="space-y-4">
          
          {/* Queue Filter & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search stop by tracking #, recipient name, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none text-xs">
              {[
                { id: 'ALL', label: `All (${assignedShipments.length})` },
                { id: 'ACTION', label: `Action Needed (${pendingCount})` },
                { id: 'DELIVERED', label: `Delivered (${deliveredCount})` },
                { id: 'FAILED', label: `Failed (${failedCount})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                    statusFilter === f.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Shipment Cards */}
          {filteredQueue.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Assigned Shipments Match Your Filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All assigned deliveries for today are complete or match a different filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map((s, idx) => {
                const isDelivered = s.status === 'Delivered';
                const isFailed = s.status === 'Failed Delivery';
                const hasUnreadChat = (s.chatMessages?.length || 0) > 0;
                const hasIssues = (s.issues?.length || 0) > 0;

                return (
                  <div
                    key={s.id}
                    className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-xl transition space-y-4 ${
                      isDelivered 
                        ? 'border-emerald-500/30 bg-emerald-950/10' 
                        : isFailed 
                        ? 'border-rose-500/30 bg-rose-950/10' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-300 font-mono font-bold text-xs flex items-center justify-center border border-blue-500/30">
                            #{idx + 1}
                          </span>
                          <span className="font-mono font-bold text-sm text-white">{s.trackingNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.priority === 'Critical Freight' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            s.priority === 'Express' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {s.priority}
                          </span>

                          {/* Unread Chat Badge */}
                          {hasUnreadChat && (
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-cyan-400" />
                              <span>Chat</span>
                            </span>
                          )}

                          {/* Issue Alert Badge */}
                          {hasIssues && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <AlertOctagon className="w-3 h-3 text-amber-400" />
                              <span>Issue</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Sender: <strong className="text-slate-300">{s.senderName}</strong></span>
                          <span>•</span>
                          <span>{s.packageType} ({s.weightKg} kg)</span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow ${
                        isDelivered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        isFailed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        s.status === 'Out for Delivery' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse' :
                        s.status === 'In Transit' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {s.status}
                      </span>
                    </div>

                    {/* Delivery Destination & Contact Details */}
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Delivery Stop Destination
                          </span>
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            <User className="w-4 h-4 text-cyan-400 shrink-0" />
                            {s.receiverName}
                          </p>
                          <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <span>{s.receiverAddress.address || `${s.receiverAddress.city}, ${s.receiverAddress.state}`}</span>
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          {/* Call Customer Button */}
                          <button
                            onClick={() => handleCallCustomer(s)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call (Masked)</span>
                          </button>

                          {/* Open Detail View Button */}
                          <button
                            onClick={() => { setSelectedShipment(s); setDetailTab('map_route'); }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>View Map & Details</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Lifecycle Action Bar */}
                    <div className="pt-2">
                      {s.status === 'Created' && (
                        <button
                          onClick={() => openPickupPhotoModal(s)}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Confirm Pickup & Capture Pre-Transit Photo</span>
                        </button>
                      )}

                      {s.status === 'Picked Up' && (
                        <button
                          onClick={() => onUpdateStatus(s.id, 'In Transit', `${s.senderAddress.city} Highway`, 'Departed origin facility en route to destination')}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Start Transit / Depart Origin</span>
                        </button>
                      )}

                      {s.status === 'In Transit' && (
                        <button
                          onClick={() => onUpdateStatus(s.id, 'Out for Delivery', `${s.receiverAddress.city} Local Depot`, 'Loaded into driver vehicle for final delivery leg')}
                          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Start Final Delivery Leg (Out for Delivery)</span>
                        </button>
                      )}

                      {s.status === 'Out for Delivery' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            onClick={() => openPodModal(s)}
                            className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Complete Delivery (Capture POD)</span>
                          </button>

                          <button
                            onClick={() => { setFailedShipment(s); setFailedReason('Recipient Not Available'); setFailedNotes(''); }}
                            className="py-3 bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Mark Delivery Failed</span>
                          </button>
                        </div>
                      )}

                      {isDelivered && (
                        <div className="flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Stop Delivered & POD Captured</span>
                          </div>

                          <button
                            onClick={() => setViewingPod(s)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                          >
                            View POD Receipt
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TAB 2: ROUTE MAP & STOPS ITINERARY                         */}
      {/* ------------------------------------------------------------- */}
      {!selectedShipment && activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  Assigned Route & Stop Sequence Map
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual map of today's stops in delivery sequence order.
                </p>
              </div>

              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {assignedShipments.length} Total Stops
              </span>
            </div>

            {/* Interactive Map Component */}
            <div className="h-[380px] rounded-xl overflow-hidden border border-slate-800 relative">
              <InteractiveMap 
                shipment={activeEnRouteShipment}
                allShipments={assignedShipments}
              />
            </div>
          </div>

          {/* Sequential Stops Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Step-By-Step Stop Sequence
            </h4>

            <div className="space-y-3">
              {assignedShipments.map((s, idx) => (
                <div 
                  key={s.id} 
                  className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3 hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white text-xs block">{s.receiverName}</span>
                      <p className="text-[11px] text-slate-400">{s.receiverAddress.address || `${s.receiverAddress.city}, ${s.receiverAddress.state}`}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                    s.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    s.status === 'Failed Delivery' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. TAB 3: HISTORY & STATS                                     */}
      {/* ------------------------------------------------------------- */}
      {!selectedShipment && activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-amber-400" />
              Personal Delivery Performance Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block font-semibold">Total Handled</span>
                <strong className="text-2xl font-black text-white font-mono">{totalAssigned}</strong>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-300 block font-semibold">On-Time Success Rate</span>
                <strong className="text-2xl font-black text-emerald-400 font-mono">{onTimeRate}%</strong>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <span className="text-xs text-blue-300 block font-semibold">POD Submissions</span>
                <strong className="text-2xl font-black text-blue-400 font-mono">{deliveredCount}</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Completed Deliveries & Digital PODs</span>
              <span className="text-xs text-slate-400 font-mono">{deliveredCount} Records</span>
            </h3>

            {deliveredCount === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No completed deliveries yet today.</p>
            ) : (
              <div className="space-y-3">
                {assignedShipments.filter(s => s.status === 'Delivered').map(s => {
                  const pod = s.proofOfDelivery;
                  return (
                    <div key={s.id} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">{s.trackingNumber}</span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded">
                            {pod?.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING SUPPORT VERIFICATION'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Delivered to <strong>{pod?.recipientName || s.receiverName}</strong> ({pod?.deliveredAt || s.estimatedDeliveryTime})
                        </p>
                      </div>

                      <button
                        onClick={() => setViewingPod(s)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow shrink-0"
                      >
                        View POD Receipt
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 1: PICKUP CONDITION PHOTO CAPTURE MODAL --- */}
      {pickupPhotoShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                Pickup Parcel Photo Verification (#{pickupPhotoShipment.trackingNumber})
              </h3>
              <button onClick={() => setPickupPhotoShipment(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitPickupPhoto} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Parcel Pickup Photo
                </label>
                <div className="flex items-center gap-3">
                  <img src={pickupPhotoUrl} alt="Pickup" className="w-24 h-20 object-cover rounded-xl border border-slate-700" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-blue-400 font-mono font-bold block">📷 Camera Photo Captured</span>
                    <button
                      type="button"
                      onClick={() => setPickupPhotoUrl('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600')}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Re-take Photo Simulation
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Pre-Transit Condition Notes
                </label>
                <textarea
                  rows={2}
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPickupPhotoShipment(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition"
                >
                  Confirm Pickup & Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REPORT TRANSIT ISSUE / COMPLAINT MODAL --- */}
      {issueShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                Report Transit Issue (#{issueShipment.trackingNumber})
              </h3>
              <button onClick={() => setIssueShipment(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Issue Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Traffic/Road Block">Traffic / Road Block</option>
                  <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                  <option value="Package Damaged in Transit">Package Damaged in Transit</option>
                  <option value="Weather Delay">Weather Delay</option>
                  <option value="Address Not Found">Address Not Found</option>
                  <option value="Recipient Unreachable">Recipient Unreachable</option>
                  <option value="Safety Concern">Safety Concern</option>
                  <option value="Other">Other Exception</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Description / Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Expressway lane blocked due to waterlogging. Heavy congestion ahead."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Photo Attachment (Optional)
                </label>
                <img src={issuePhotoUrl} alt="Issue evidence" className="w-full h-24 object-cover rounded-xl border border-slate-700 mb-1" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueShipment(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg transition"
                >
                  Submit Issue & Notify Support
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: DRIVER PROOF OF DELIVERY (POD) CAPTURE MODAL --- */}
      {podShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl my-auto overflow-hidden text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-900">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Capture Proof of Delivery (#{podShipment.trackingNumber})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Recipient signature, doorstep package photo & GPS stamp.
                </p>
              </div>
              <button 
                onClick={() => setPodShipment(null)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDriverSubmitPod} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Recipient Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Recipient / Signee Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Vijay Kumar"
                />
              </div>

              {/* Signature Canvas Pad */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">
                    Digital Signature Capture <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] text-slate-400 hover:text-rose-300 underline"
                  >
                    Clear Canvas
                  </button>
                </div>
                <div className="border border-slate-700 rounded-xl bg-slate-950 p-1 touch-none">
                  <canvas
                    ref={canvasRef}
                    width={420}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-24 cursor-crosshair rounded-lg bg-slate-950"
                  />
                </div>
              </div>

              {/* Delivered Package Photo (Doorstep Photo) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Delivered Package Photo (Doorstep / Handover Proof) <span className="text-rose-400">*</span>
                </label>

                {/* Hidden File Inputs for Camera & Device File Upload */}
                <input
                  ref={driverPodCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleDriverPodPhotoUpload}
                />
                <input
                  ref={driverPodFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleDriverPodPhotoUpload}
                />

                <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <img 
                    src={deliveredPhotoUrl} 
                    alt="Doorstep package photo" 
                    className="w-24 h-20 object-cover rounded-xl border border-slate-700 shrink-0" 
                  />
                  <div className="space-y-1 flex-1 text-center sm:text-left">
                    <span className="text-[11px] text-emerald-400 font-mono font-bold block">
                      📷 Package Photo Ready
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Snap photo using camera or choose an image file from your device
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => driverPodCameraRef.current?.click()}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-md shadow-blue-600/20"
                    >
                      <Camera className="w-3.5 h-3.5" /> Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => driverPodFileRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border border-slate-600"
                    >
                      <Upload className="w-3.5 h-3.5" /> Choose File
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto GPS Stamp Box */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px]">
                <span className="text-slate-400 block font-sans font-bold">Automatic GPS Coordinate & Time Stamp</span>
                <p className="text-emerald-400">
                  Lat: {podShipment.receiverAddress.lat} N • Lng: {podShipment.receiverAddress.lng} E
                </p>
                <p className="text-slate-400">Timestamp: {new Date().toISOString().replace('T', ' ').substring(0, 16)}</p>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Driver Observations / Notes
                </label>
                <textarea
                  rows={2}
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  placeholder="e.g. Handed directly to recipient at front door."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPodShipment(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  Submit POD & Complete Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: DRIVER FAILED DELIVERY REASON MODAL --- */}
      {failedShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                Mark Failed Delivery Attempt (#{failedShipment.trackingNumber})
              </h3>
              <button onClick={() => setFailedShipment(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleDriverSubmitFailed} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Reason for Delivery Failure <span className="text-rose-400">*</span>
                </label>
                <select
                  value={failedReason}
                  onChange={(e) => setFailedReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Recipient Not Available">Recipient Not Available</option>
                  <option value="Incorrect Address">Incorrect Address / Premises Not Found</option>
                  <option value="Refused by Recipient">Refused by Recipient</option>
                  <option value="Unreachable / Gate Locked">Gated Premises Locked / Security Denial</option>
                  <option value="Other">Other Exception</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Driver Observations & Notes
                </label>
                <textarea
                  rows={3}
                  value={failedNotes}
                  onChange={(e) => setFailedNotes(e.target.value)}
                  placeholder="e.g. Attempted contact via call 3 times. Security confirmed recipient away until tomorrow."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailedShipment(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg transition"
                >
                  Confirm Delivery Failure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4B: DECLINE JOB OFFER MODAL --- */}
      {decliningShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Decline Dispatch Offer #{decliningShipment.trackingNumber}</span>
              </div>
              <button onClick={() => setDecliningShipment(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Declining will log the reason and immediately return this shipment to the Admin dispatch table for reassignment.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Select Reason for Decline</label>
              {[
                'Vehicle cargo capacity / weight limit exceeded',
                'Vehicle maintenance or mechanical breakdown',
                'Outside driver operating corridor / shift hours',
                'Package requires specialized equipment not available',
                'Other reason'
              ].map((reasonOption) => (
                <label
                  key={reasonOption}
                  onClick={() => setDeclineReason(reasonOption)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                    declineReason === reasonOption
                      ? 'bg-rose-500/10 border-rose-500/50 text-white font-bold'
                      : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    checked={declineReason === reasonOption}
                    onChange={() => setDeclineReason(reasonOption)}
                    className="text-rose-500 focus:ring-rose-500"
                  />
                  <span>{reasonOption}</span>
                </label>
              ))}

              {declineReason === 'Other reason' && (
                <textarea
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  placeholder="Describe reason for declining job offer..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  rows={2}
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDecliningShipment(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeclineOffer(
                  decliningShipment,
                  declineReason === 'Other reason' ? customDeclineReason || 'Declined with custom notes' : declineReason
                )}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-rose-600/30"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: VIEW COMPLETED POD RECEIPT --- */}
      {viewingPod && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Digital Proof of Delivery Receipt (#{viewingPod.trackingNumber})
              </h3>
              <button onClick={() => setViewingPod(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {viewingPod.proofOfDelivery ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recipient</span>
                    <p className="font-bold text-white text-xs">{viewingPod.proofOfDelivery.recipientName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">POD Code</span>
                    <p className="font-mono font-bold text-emerald-400 text-xs">{viewingPod.proofOfDelivery.verificationCode}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-[11px] font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Verification Status: PENDING Support Agent / Admin Approval</span>
                </div>

                {/* Signature & Doorstep Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(viewingPod.proofOfDelivery.signatureImageUrl || viewingPod.proofOfDelivery.signatureDataUrl) && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Recipient Signature</span>
                      <img
                        src={viewingPod.proofOfDelivery.signatureImageUrl || viewingPod.proofOfDelivery.signatureDataUrl}
                        alt="Signature"
                        className="h-20 mx-auto object-contain filter invert"
                      />
                    </div>
                  )}

                  {(viewingPod.proofOfDelivery.deliveredPackagePhotoUrl || viewingPod.proofOfDelivery.deliveryPhotoUrl) && (
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Doorstep Package Photo</span>
                      <img
                        src={viewingPod.proofOfDelivery.deliveredPackagePhotoUrl || viewingPod.proofOfDelivery.deliveryPhotoUrl}
                        alt="Doorstep Photo"
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setViewingPod(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Close Receipt
                </button>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">No POD recorded for this shipment.</p>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 6: DAILY DELIVERY SUMMARY MODAL --- */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                End-of-Day Driver Delivery Summary
              </h3>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Shift Performance Rating</span>
                <p className="text-lg font-extrabold text-emerald-400">⭐⭐⭐⭐⭐ 4.9 Stars (5 Stop Shift)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Completed Deliveries</span>
                  <strong className="text-base text-emerald-400 font-mono">{deliveredCount} Stops</strong>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Failed Attempts</span>
                  <strong className="text-base text-rose-400 font-mono">{failedCount} Stops</strong>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Issues Reported</span>
                  <strong className="text-base text-amber-400 font-mono">{totalIssuesCount} Issues</strong>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Est. Distance Covered</span>
                  <strong className="text-base text-cyan-400 font-mono">185 km</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
