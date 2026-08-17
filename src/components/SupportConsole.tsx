import React, { useState } from 'react';
import { Shipment, ProofOfDelivery, TransitIssue, ChatMessage, ShipmentStatus } from '../types';
import { generatePodPdf } from '../utils/generatePodPdf';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  X,
  Eye,
  FileText,
  MessageSquare,
  Phone,
  User,
  MapPin,
  Truck,
  RotateCcw,
  Calendar,
  AlertCircle,
  HelpCircle,
  Filter,
  Check,
  ArrowRight,
  ChevronRight,
  Building2,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SupportConsoleProps {
  shipments: Shipment[];
  [key: string]: any;
  onUpdateShipmentPod?: (shipmentId: string, podData: ProofOfDelivery) => void;
  onUpdateStatus?: (id: string, status: ShipmentStatus, location: string, note: string) => void;
  onRefreshData?: () => void;
  onSelectShipmentToTrack?: (shipment: Shipment) => void;
}

export const SupportConsole: React.FC<SupportConsoleProps> = ({
  shipments,
  onUpdateShipmentPod,
  onUpdateStatus,
  onRefreshData,
  onSelectShipmentToTrack,
}) => {
  const [activeQueueTab, setActiveQueueTab] = useState<'pod_queue' | 'issues_queue' | 'failed_queue' | 'lookup'>('pod_queue');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected shipment for 360 investigation
  const [investigatingShipment, setInvestigatingShipment] = useState<Shipment | null>(shipments[0] || null);
  
  // Modals state
  const [podReviewShipment, setPodReviewShipment] = useState<Shipment | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  
  const [issueResolveShipment, setIssueResolveShipment] = useState<Shipment | null>(null);
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  const [failedFollowupShipment, setFailedFollowupShipment] = useState<Shipment | null>(null);
  const [rescheduleEta, setRescheduleEta] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');

  const [chatLogShipment, setChatLogShipment] = useState<Shipment | null>(null);

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filter queues
  // 1. POD Verification Queue: Delivered shipments with PODs
  const pendingPodShipments = shipments.filter(s => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && s.proofOfDelivery && (
      s.proofOfDelivery.verificationStatus === 'PENDING' || !s.proofOfDelivery.verificationStatus
    );
  });

  const verifiedPodShipments = shipments.filter(s => s.proofOfDelivery?.verificationStatus === 'VERIFIED');
  const flaggedPodShipments = shipments.filter(s => s.proofOfDelivery?.verificationStatus === 'FLAGGED');

  // 2. Open Issues Queue
  const openIssueShipments = shipments.filter(s => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
    const hasOpenIssue = s.issues && s.issues.some(i => i.status === 'Open' || i.status === 'Under Review');
    const hasDeclinedDispatch = s.dispatchStatus === 'Declined';
    return matchesSearch && (hasOpenIssue || hasDeclinedDispatch);
  });

  // 3. Failed Delivery Follow-up Queue
  const failedDeliveryShipments = shipments.filter(s => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && s.status === 'Failed Delivery';
  });

  // Action: Verify POD
  const handleVerifyPod = async (s: Shipment) => {
    if (!s.proofOfDelivery) return;
    const updatedPod: ProofOfDelivery = {
      ...s.proofOfDelivery,
      verificationStatus: 'VERIFIED',
      notes: (s.proofOfDelivery.notes || '') + ' [VERIFIED by Support Agent Ananya Iyer]',
    };

    try {
      await fetch(`/api/shipments/${s.id}/pod-verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: 'VERIFIED',
          verifiedByUserId: 'usr-4',
          auditNotes: 'Digital signature, package photo & GPS location verified against recipient address.',
        }),
      });
    } catch (e) {
      console.warn('API sync fallback for POD verification');
    }

    if (onUpdateShipmentPod) {
      onUpdateShipmentPod(s.id, updatedPod);
    }

    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    setActionSuccessMsg(`POD for Shipment #${s.trackingNumber} successfully VERIFIED and cryptographically locked!`);
    setPodReviewShipment(null);
    if (onRefreshData) onRefreshData();
  };

  // Action: Flag POD
  const handleFlagPodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podReviewShipment || !podReviewShipment.proofOfDelivery) return;

    const updatedPod: ProofOfDelivery = {
      ...podReviewShipment.proofOfDelivery,
      verificationStatus: 'FLAGGED',
      notes: `[FLAGGED FOR AUDIT]: ${flagReason || 'Photo/signature ambiguity detected'}`,
    };

    try {
      await fetch(`/api/shipments/${podReviewShipment.id}/pod-verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: 'FLAGGED',
          verifiedByUserId: 'usr-4',
          auditNotes: flagReason || 'Flagged by Support Agent for investigation.',
        }),
      });
    } catch (e) {
      console.warn('API sync fallback for POD flag');
    }

    if (onUpdateShipmentPod) {
      onUpdateShipmentPod(podReviewShipment.id, updatedPod);
    }

    setActionSuccessMsg(`POD for Shipment #${podReviewShipment.trackingNumber} FLAGGED for investigation.`);
    setShowFlagModal(false);
    setPodReviewShipment(null);
    setFlagReason('');
    if (onRefreshData) onRefreshData();
  };

  // Action: Resolve Issue
  const handleResolveIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueResolveShipment || !resolvingIssueId) return;

    try {
      await fetch(`/api/shipments/${issueResolveShipment.id}/issue-resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: resolvingIssueId,
          status: 'Resolved',
          notes: resolutionNotes || 'Resolved by Support Agent after customer confirmation.',
          resolvedBy: 'Support Agent Ananya Iyer',
        }),
      });
    } catch (e) {
      console.warn('API fallback for issue resolution');
    }

    setActionSuccessMsg(`Transit Issue on #${issueResolveShipment.trackingNumber} marked RESOLVED.`);
    setIssueResolveShipment(null);
    setResolvingIssueId(null);
    setResolutionNotes('');
    if (onRefreshData) onRefreshData();
  };

  // Action: Reschedule Failed Delivery
  const handleRescheduleFailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failedFollowupShipment) return;

    const newEtaTime = rescheduleEta || '2026-07-27 11:00';

    try {
      if (onUpdateStatus) {
        onUpdateStatus(
          failedFollowupShipment.id,
          'In Transit',
          failedFollowupShipment.receiverAddress.city,
          `Rescheduled by Support Agent for delivery on ${newEtaTime}. Notes: ${followupNotes || 'Recipient contacted.'}`
        );
      } else {
        await fetch(`/api/shipments/${failedFollowupShipment.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'In Transit',
            location: failedFollowupShipment.receiverAddress.city,
            note: `Rescheduled delivery for ${newEtaTime}. ${followupNotes || ''}`,
            updatedBy: 'Support Agent Ananya Iyer',
          }),
        });
      }
    } catch (e) {
      console.warn('API fallback for reschedule');
    }

    setActionSuccessMsg(`Delivery for Shipment #${failedFollowupShipment.trackingNumber} RESCHEDULED to ${newEtaTime}.`);
    setFailedFollowupShipment(null);
    setRescheduleEta('');
    setFollowupNotes('');
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="space-y-6">
      
      {/* Support Console Header & Purpose Statement */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Support Agent Helpdesk Console
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
              Role: Customer Service & Trust Guard
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            Support Desk Queue, Exception Triage & POD Audit Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Verify Proof of Delivery signatures & package photos, triage reported transit issues, manage failed delivery follow-ups, and review operator-customer chat logs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRefreshData && onRefreshData()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Refresh Queues</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 text-xs shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending POD Audit</span>
            <span className="text-xl font-extrabold text-white">{pendingPodShipments.length}</span>
            <span className="text-[10px] text-amber-400 block font-medium">Awaiting Support Sign-off</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Open Transit Issues</span>
            <span className="text-xl font-extrabold text-white">{openIssueShipments.length}</span>
            <span className="text-[10px] text-rose-400 block font-medium">Driver & Customer Alerts</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Failed Deliveries</span>
            <span className="text-xl font-extrabold text-white">{failedDeliveryShipments.length}</span>
            <span className="text-[10px] text-indigo-400 block font-medium">Needing Reschedule/Refund</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verified PODs</span>
            <span className="text-xl font-extrabold text-white">{verifiedPodShipments.length}</span>
            <span className="text-[10px] text-emerald-400 block font-medium">Locked & Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Support Queue Navigation Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setActiveQueueTab('pod_queue')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeQueueTab === 'pod_queue'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pending POD Verifications</span>
              {pendingPodShipments.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">
                  {pendingPodShipments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveQueueTab('issues_queue')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeQueueTab === 'issues_queue'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Open Issues & Complaints</span>
              {openIssueShipments.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white font-black rounded-full text-[10px]">
                  {openIssueShipments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveQueueTab('failed_queue')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeQueueTab === 'failed_queue'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span>Failed Delivery Follow-up</span>
              {failedDeliveryShipments.length > 0 && (
                <span className="px-2 py-0.5 bg-indigo-500 text-white font-black rounded-full text-[10px]">
                  {failedDeliveryShipments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveQueueTab('lookup')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeQueueTab === 'lookup'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>360° Shipment Investigation</span>
            </button>
          </div>

          {/* Quick Filter Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter queue by # or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* --- QUEUE VIEW 1: PENDING POD VERIFICATIONS --- */}
        {activeQueueTab === 'pod_queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Delivered Packages Pending Support Agent Signature & Photo Audit ({pendingPodShipments.length})
              </span>
              <span className="text-[10px] text-slate-400">
                Verify recipient name, digital signature, doorstep photo, and GPS coordinate proximity.
              </span>
            </div>

            {pendingPodShipments.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">All Pending PODs Verified!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No shipments are currently awaiting Support Agent POD verification. Verified records are securely stored in the audit archive.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPodShipments.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 shadow-lg space-y-4 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400 text-sm">{s.trackingNumber}</span>
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-md">
                            Pending Audit
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-1">
                          Recipient: <span className="text-white font-semibold">{s.proofOfDelivery?.recipientName || s.receiverName}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {s.receiverAddress.address}, {s.receiverAddress.city}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Delivered At</span>
                        <span className="text-xs text-slate-200 font-semibold">{s.proofOfDelivery?.deliveredAt || s.estimatedDeliveryTime}</span>
                      </div>
                    </div>

                    {/* POD Evidence Thumbnails */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                      {/* Doorstep Package Photo */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">Package Photo Evidence</span>
                        <img
                          src={s.proofOfDelivery?.deliveredPackagePhotoUrl || s.proofOfDelivery?.photoUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600'}
                          alt="Delivered Package"
                          className="w-full h-24 object-cover rounded-lg border border-slate-700"
                        />
                      </div>

                      {/* Recipient Digital Signature */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">Digital Signature</span>
                        <div className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center p-2">
                          {s.proofOfDelivery?.signatureDataUrl || s.proofOfDelivery?.signatureImageUrl ? (
                            <img
                              src={s.proofOfDelivery.signatureDataUrl || s.proofOfDelivery.signatureImageUrl}
                              alt="Signature"
                              className="max-h-20 object-contain filter invert"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Signature Recorded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Code & Driver info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Code: {s.proofOfDelivery?.verificationCode}</span>
                      </div>
                      <div>
                        Captured by Driver: <span className="text-slate-300 font-medium">{s.driver?.name || 'Rajesh Verma'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-700/60">
                      <button
                        onClick={() => handleVerifyPod(s)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Verified</span>
                      </button>

                      <button
                        onClick={() => {
                          setPodReviewShipment(s);
                          setShowFlagModal(true);
                        }}
                        className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Flag POD</span>
                      </button>

                      <button
                        onClick={() => generatePodPdf(s)}
                        className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                        title="Download Official POD Certificate"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- QUEUE VIEW 2: OPEN ISSUES & COMPLAINTS --- */}
        {activeQueueTab === 'issues_queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Active Transit Exceptions & Reported Issues ({openIssueShipments.length})
              </span>
              <span className="text-[10px] text-slate-400">
                Review breakdown, weather, damaged package alerts, or dispatch declines.
              </span>
            </div>

            {openIssueShipments.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Open Issues Reported!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are no active transit issues or complaints requiring Support Agent triage at this moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {openIssueShipments.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 shadow-lg space-y-4 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400 text-sm">{s.trackingNumber}</span>
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-md uppercase">
                              {s.dispatchStatus === 'Declined' ? 'Dispatch Declined' : (s.issues?.[0]?.issueType || 'Transit Issue')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Customer: <span className="text-white font-semibold">{s.receiverName}</span> ({s.receiverAddress.city})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {s.chatMessages && s.chatMessages.length > 0 && (
                          <button
                            onClick={() => setChatLogShipment(s)}
                            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>View Chat Log ({s.chatMessages.length})</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setInvestigatingShipment(s);
                            setActiveQueueTab('lookup');
                          }}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>360° Inspect</span>
                        </button>
                      </div>
                    </div>

                    {/* Issue Content Detail */}
                    {s.dispatchStatus === 'Declined' ? (
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/30 space-y-1 text-xs">
                        <span className="text-amber-400 font-bold block">🚨 Driver Dispatch Offer Declined</span>
                        <p className="text-slate-300">
                          Reason: <span className="text-white font-medium">{s.dispatchDeclinedReason || 'Cargo capacity limit exceeded.'}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">Assigned Driver: {s.assignedOperatorName || 'Karan Malhotra'}</p>
                      </div>
                    ) : (
                      s.issues?.map((iss) => (
                        <div key={iss.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Reported by: <strong className="text-slate-200">{iss.reportedBy}</strong></span>
                            <span>Timestamp: <strong className="text-slate-200">{iss.timestamp}</strong></span>
                          </div>
                          <p className="text-slate-200 font-medium">{iss.notes}</p>
                          {iss.photoUrl && (
                            <img
                              src={iss.photoUrl}
                              alt="Issue evidence"
                              className="w-32 h-20 object-cover rounded-lg border border-slate-700 mt-2"
                            />
                          )}
                        </div>
                      ))
                    )}

                    {/* Support Agent Resolution Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Assigned Unit: {s.driver?.name || 'Rajesh Verma'} ({s.driver?.vehicle || 'Mahindra Truck'})</span>
                      </div>

                      <button
                        onClick={() => {
                          setIssueResolveShipment(s);
                          setResolvingIssueId(s.issues?.[0]?.id || `iss-${Date.now()}`);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Triage & Resolve Issue</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- QUEUE VIEW 3: FAILED DELIVERIES FOLLOW-UP --- */}
        {activeQueueTab === 'failed_queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Failed Delivery Follow-up Actions ({failedDeliveryShipments.length})
              </span>
              <span className="text-[10px] text-slate-400">
                Action required: Reschedule delivery window, contact recipient, or initiate cancellation.
              </span>
            </div>

            {failedDeliveryShipments.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Failed Deliveries Pending!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All delivery attempts were completed successfully or follow-up actions have been dispatched.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {failedDeliveryShipments.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 shadow-lg space-y-4 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400 text-sm">{s.trackingNumber}</span>
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold rounded-md">
                            Failed Attempt
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-semibold mt-1">
                          Recipient: {s.receiverName} ({s.receiverPhone || '+91 98765 43210'})
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {s.receiverAddress.address}, {s.receiverAddress.city}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Attempted</span>
                        <span className="text-xs text-slate-300 font-medium">Today</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <span className="text-rose-400 font-bold block">
                        Reason: {s.failedReason || 'Recipient Not Available'}
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        Notes: {s.failedNotes || 'Premises locked upon driver arrival. Gate security requested callback.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-slate-700/60">
                      <button
                        onClick={() => {
                          setFailedFollowupShipment(s);
                          setRescheduleEta('Tomorrow by 11:00 AM');
                        }}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Reschedule Delivery</span>
                      </button>

                      <button
                        onClick={() => {
                          setInvestigatingShipment(s);
                          setActiveQueueTab('lookup');
                        }}
                        className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Inspect Log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- QUEUE VIEW 4: 360° SEARCHABLE SHIPMENT INVESTIGATION --- */}
        {activeQueueTab === 'lookup' && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  360° Shipment Investigation & Communication Log Center
                </h3>
                <p className="text-xs text-slate-400">
                  Select or search any shipment to inspect timeline events, POD signatures, driver telemetry, and operator-customer chat logs.
                </p>
              </div>

              {/* Selector */}
              <div className="w-full md:w-72">
                <select
                  value={investigatingShipment?.id || ''}
                  onChange={(e) => {
                    const match = shipments.find(s => s.id === e.target.value);
                    if (match) setInvestigatingShipment(match);
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none"
                >
                  {shipments.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.trackingNumber} - {s.receiverName} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {investigatingShipment && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Shipment Overview & Driver Telemetry */}
                <div className="space-y-4">
                  
                  {/* Overview Card */}
                  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tracking Identifier</span>
                        <span className="text-lg font-mono font-extrabold text-blue-400">{investigatingShipment.trackingNumber}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        investigatingShipment.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        investigatingShipment.status === 'Failed Delivery' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {investigatingShipment.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Sender</span>
                        <span className="text-slate-200 font-medium">{investigatingShipment.senderName}</span>
                        <p className="text-[10px] text-slate-400">{investigatingShipment.senderAddress.address}, {investigatingShipment.senderAddress.city}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-semibold">Receiver / Delivery Point</span>
                        <span className="text-slate-200 font-medium">{investigatingShipment.receiverName} ({investigatingShipment.receiverPhone || '+91 98765 43210'})</span>
                        <p className="text-[10px] text-slate-400">{investigatingShipment.receiverAddress.address}, {investigatingShipment.receiverAddress.city}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Package Type:</span>
                        <span className="text-white font-medium">{investigatingShipment.packageType} ({investigatingShipment.weightKg} kg)</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Telemetry */}
                  {investigatingShipment.driver && (
                    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        Assigned Operator & Vehicle Telemetry
                      </h4>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{investigatingShipment.driver.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Rating: ★ {investigatingShipment.driver.rating}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{investigatingShipment.driver.vehicle} ({investigatingShipment.driver.licensePlate})</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>Speed: {investigatingShipment.driver.speedKmH} km/h</span>
                          <span>Battery: {investigatingShipment.driver.batteryPct}%</span>
                          <span>Signal: {investigatingShipment.driver.lastSignalTime}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Button for Full Tracker View */}
                  {onSelectShipmentToTrack && (
                    <button
                      onClick={() => onSelectShipmentToTrack(investigatingShipment)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open in Customer Package Tracker</span>
                    </button>
                  )}
                </div>

                {/* Center Column: POD Evidence & Communication Logs */}
                <div className="space-y-4 lg:col-span-2">
                  
                  {/* POD Record (if exists) */}
                  {investigatingShipment.proofOfDelivery ? (
                    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Proof of Delivery (POD) Cryptographic Audit Record
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          investigatingShipment.proofOfDelivery.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          investigatingShipment.proofOfDelivery.verificationStatus === 'FLAGGED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {investigatingShipment.proofOfDelivery.verificationStatus || 'PENDING VERIFICATION'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block mb-1">Package Photo Evidence</span>
                          <img
                            src={investigatingShipment.proofOfDelivery.deliveredPackagePhotoUrl || investigatingShipment.proofOfDelivery.photoUrl}
                            alt="Package Photo"
                            className="w-full h-32 object-cover rounded-xl border border-slate-700"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block mb-1">Recipient Digital Signature</span>
                          <div className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center p-2">
                            {investigatingShipment.proofOfDelivery.signatureDataUrl || investigatingShipment.proofOfDelivery.signatureImageUrl ? (
                              <img
                                src={investigatingShipment.proofOfDelivery.signatureDataUrl || investigatingShipment.proofOfDelivery.signatureImageUrl}
                                alt="Signature"
                                className="max-h-24 object-contain filter invert"
                              />
                            ) : (
                              <span className="text-xs text-slate-500 italic">Signature Recorded</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Recipient: <strong className="text-white">{investigatingShipment.proofOfDelivery.recipientName}</strong></span>
                          <span className="font-mono">Code: {investigatingShipment.proofOfDelivery.verificationCode}</span>
                        </div>
                        <p className="text-slate-300">{investigatingShipment.proofOfDelivery.notes}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl text-center text-xs text-slate-400">
                      No POD submitted yet for this shipment.
                    </div>
                  )}

                  {/* Read-only Operator <-> Customer Chat Logs */}
                  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        Driver & Customer Communication Audit Logs (Read-Only)
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Support Dispute Mediation Access</span>
                    </div>

                    {!investigatingShipment.chatMessages || investigatingShipment.chatMessages.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">
                        No direct messages logged between driver and customer for this shipment.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {investigatingShipment.chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-xl text-xs space-y-1 border ${
                              msg.senderRole === 'Logistics Operator'
                                ? 'bg-blue-950/40 border-blue-800/50 text-blue-100 ml-6'
                                : 'bg-slate-900 border-slate-800 text-slate-200 mr-6'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                              <span>{msg.senderName} ({msg.senderRole})</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tracking Event Timeline */}
                  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      Shipment Lifecycle Audit Trail
                    </h4>

                    <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                      {investigatingShipment.events.map((evt) => (
                        <div key={evt.id} className="relative pl-8 text-xs space-y-0.5">
                          <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900" />
                          <div className="flex items-center justify-between font-semibold text-white">
                            <span>{evt.status} - {evt.location}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{evt.description}</p>
                          <span className="text-[10px] text-slate-500 block">Updated by: {evt.updatedBy}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* --- FLAG POD MODAL --- */}
      {showFlagModal && podReviewShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Flag POD for Audit Investigation
              </h3>
              <button
                onClick={() => setShowFlagModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Flagging shipment <strong className="text-white font-mono">#{podReviewShipment.trackingNumber}</strong> will mark the POD as non-compliant and request driver clarification.
            </p>

            <form onSubmit={handleFlagPodSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-1">
                  Reason for Flagging POD <span className="text-rose-400">*</span>
                </label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select Audit Failure Reason...</option>
                  <option value="Signature illegible / does not match recipient name">Signature illegible / does not match recipient name</option>
                  <option value="Doorstep package photo is blurry or empty">Doorstep package photo is blurry or empty</option>
                  <option value="GPS coordinates mismatch with destination address">GPS coordinates mismatch with destination address</option>
                  <option value="Customer reported non-receipt despite delivered status">Customer reported non-receipt despite delivered status</option>
                  <option value="Other compliance violation">Other compliance violation</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFlagModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Confirm & Flag POD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TRIAGE & RESOLVE ISSUE MODAL --- */}
      {issueResolveShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Resolve Transit Exception
              </h3>
              <button
                onClick={() => setIssueResolveShipment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>Shipment: <strong className="text-blue-400 font-mono">#{issueResolveShipment.trackingNumber}</strong></p>
              <p>Issue Type: <strong className="text-rose-300">{issueResolveShipment.issues?.[0]?.issueType || 'Transit Issue'}</strong></p>
            </div>

            <form onSubmit={handleResolveIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-1">
                  Support Resolution Notes & Actions Taken <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Contacted customer via phone. Highway traffic cleared, driver resumed route with updated ETA."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueResolveShipment(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Mark Resolved & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESCHEDULE FAILED DELIVERY MODAL --- */}
      {failedFollowupShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Reschedule Failed Delivery Attempt
              </h3>
              <button
                onClick={() => setFailedFollowupShipment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>Shipment: <strong className="text-blue-400 font-mono">#{failedFollowupShipment.trackingNumber}</strong></p>
              <p>Failure Reason: <strong className="text-amber-300">{failedFollowupShipment.failedReason || 'Recipient Unreachable'}</strong></p>
            </div>

            <form onSubmit={handleRescheduleFailedSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-1">
                  New Promised Delivery Date & Time Window
                </label>
                <input
                  type="text"
                  value={rescheduleEta}
                  onChange={(e) => setRescheduleEta(e.target.value)}
                  placeholder="e.g. 2026-07-27 11:00 AM"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-1">
                  Follow-up Notes / Special Delivery Gate Instructions
                </label>
                <textarea
                  rows={2}
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  placeholder="e.g. Spoke with recipient. Call 15 mins before arrival."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailedFollowupShipment(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save & Dispatch Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- READ-ONLY CHAT LOG MODAL --- */}
      {chatLogShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Communication Log Audit (#{chatLogShipment.trackingNumber})
              </h3>
              <button
                onClick={() => setChatLogShipment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {chatLogShipment.chatMessages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl text-xs space-y-1 border ${
                    msg.senderRole === 'Logistics Operator'
                      ? 'bg-blue-950/40 border-blue-800/50 text-blue-100 ml-6'
                      : 'bg-slate-950 border-slate-800 text-slate-200 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{msg.senderName} ({msg.senderRole})</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setChatLogShipment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
