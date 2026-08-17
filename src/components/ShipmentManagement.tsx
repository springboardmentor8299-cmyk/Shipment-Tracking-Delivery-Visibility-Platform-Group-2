import React, { useState } from 'react';
import { Shipment, ShipmentStatus, PriorityLevel, UserRole } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit3, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck, 
  ChevronRight,
  ShieldAlert,
  Ban,
  History,
  User,
  MapPin,
  Box,
  FileText,
  Phone,
  Mail,
  Scale,
  DollarSign,
  AlertCircle,
  Check,
  Calendar,
  Building,
  Tag,
  Maximize2,
  Locate,
  Zap,
  Send
} from 'lucide-react';
import { formatLatitude, formatLongitude } from '../hooks/useLiveLocation';

interface ShipmentManagementProps {
  shipments: Shipment[];
  userRole: UserRole;
  onSelectShipment: (shipment: Shipment) => void;
  onCreateShipment: (data: any) => void;
  onUpdateStatus: (id: string, status: ShipmentStatus, location: string, note: string) => void;
  onUpdateShipment?: (id: string, data: any) => void;
  onCancelShipment?: (id: string, reason: string) => void;
  onAssignOperator?: (id: string, operatorData: any) => void;
}

export const ShipmentManagement: React.FC<ShipmentManagementProps> = ({
  shipments,
  userRole,
  onSelectShipment,
  onCreateShipment,
  onUpdateStatus,
  onUpdateShipment,
  onCancelShipment,
  onAssignOperator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStatusShipment, setEditingStatusShipment] = useState<Shipment | null>(null);
  const [editingDetailsShipment, setEditingDetailsShipment] = useState<Shipment | null>(null);
  const [cancellingShipment, setCancellingShipment] = useState<Shipment | null>(null);
  const [viewingPackageShipment, setViewingPackageShipment] = useState<Shipment | null>(null);
  const [viewingHistoryShipment, setViewingHistoryShipment] = useState<Shipment | null>(null);
  const [assigningShipment, setAssigningShipment] = useState<Shipment | null>(null);

  // Assign Operator Form State
  const [selectedOperatorId, setSelectedOperatorId] = useState('usr-3');
  const [selectedOperatorName, setSelectedOperatorName] = useState('Rajesh Verma');
  const [assignPickupWindow, setAssignPickupWindow] = useState('Today by 2:00 PM');
  const [assignToast, setAssignToast] = useState<string | null>(null);

  const availableOperators = [
    { id: 'usr-3', name: 'Rajesh Verma', phone: '+91 98765 43210', vehicle: 'Mahindra Furio Truck (#402)' },
    { id: 'drv-02', name: 'Ramesh Kumar', phone: '+91 98765 11223', vehicle: 'Tata Ace Gold EV (#108)' },
    { id: 'drv-04', name: 'Karan Malhotra', phone: '+91 91234 88776', vehicle: 'Eicher Pro Heavy Rig (#205)' },
    { id: 'drv-05', name: 'Suresh Kumar', phone: '+91 97654 33221', vehicle: 'Ashok Leyland Dost (#301)' },
  ];

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningShipment) return;

    try {
      if (onAssignOperator) {
        await onAssignOperator(assigningShipment.id, {
          operatorId: selectedOperatorId,
          operatorName: selectedOperatorName,
          pickupWindow: assignPickupWindow,
          assignedBy: 'Admin Dispatcher',
        });
      } else {
        await fetch(`/api/shipments/${assigningShipment.id}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operatorId: selectedOperatorId,
            operatorName: selectedOperatorName,
            pickupWindow: assignPickupWindow,
            assignedBy: 'Admin Dispatcher',
          }),
        });
      }
      setAssignToast(`Dispatch alert sent to ${selectedOperatorName} for #${assigningShipment.trackingNumber}`);
      setTimeout(() => setAssignToast(null), 4000);
      setAssigningShipment(null);
    } catch (err) {
      console.error('Assign error:', err);
    }
  };

  const handleAutoAssign = () => {
    const driver = availableOperators[Math.floor(Math.random() * availableOperators.length)];
    setSelectedOperatorId(driver.id);
    setSelectedOperatorName(driver.name);
  };

  // New Shipment Form State
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('+91 98765 43210');
  const [senderEmail, setSenderEmail] = useState('dispatch@mumbai-logistics.in');
  const [senderStreet, setSenderStreet] = useState('Central Logistics Park, MIDC Andheri East');
  const [senderCity, setSenderCity] = useState('Mumbai');
  const [senderState, setSenderState] = useState('MH');
  const [senderZip, setSenderZip] = useState('400093');
  const [senderCountry, setSenderCountry] = useState('India');
  const [senderLat, setSenderLat] = useState<number>(19.076045);
  const [senderLng, setSenderLng] = useState<number>(72.877712);

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('+91 91234 56789');
  const [receiverEmail, setReceiverEmail] = useState('depot@delhi-freight.in');
  const [receiverStreet, setReceiverStreet] = useState('Connaught Place Cargo Hub, Block B');
  const [receiverCity, setReceiverCity] = useState('New Delhi');
  const [receiverState, setReceiverState] = useState('DL');
  const [receiverZip, setReceiverZip] = useState('110001');
  const [receiverCountry, setReceiverCountry] = useState('India');
  const [receiverLat, setReceiverLat] = useState<number>(28.613939);
  const [receiverLng, setReceiverLng] = useState<number>(77.209021);

  const [geoLoadingSender, setGeoLoadingSender] = useState(false);
  const [geoLoadingReceiver, setGeoLoadingReceiver] = useState(false);

  const handleFetchSenderGeo = () => {
    if (navigator.geolocation) {
      setGeoLoadingSender(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSenderLat(pos.coords.latitude);
          setSenderLng(pos.coords.longitude);
          setGeoLoadingSender(false);
        },
        () => setGeoLoadingSender(false)
      );
    }
  };

  const handleFetchReceiverGeo = () => {
    if (navigator.geolocation) {
      setGeoLoadingReceiver(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setReceiverLat(pos.coords.latitude);
          setReceiverLng(pos.coords.longitude);
          setGeoLoadingReceiver(false);
        },
        () => setGeoLoadingReceiver(false)
      );
    }
  };

  const [priority, setPriority] = useState<PriorityLevel>('Standard');
  const [packageType, setPackageType] = useState('Standard Rigid Box');
  const [weightKg, setWeightKg] = useState('3.5');
  const [dimensionsCm, setDimensionsCm] = useState('30x20x15');
  const [declaredValue, setDeclaredValue] = useState('350');
  const [contentsDescription, setContentsDescription] = useState('Commercial electronics & hardware components');
  const [isFragile, setIsFragile] = useState(false);
  const [isHazardous, setIsHazardous] = useState(false);
  const [specialHandlingNotes, setSpecialHandlingNotes] = useState('Keep dry and store in climate-controlled bay.');

  // Checkpoint Status Update State
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('In Transit');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Details Edit Form State
  const [editForm, setEditForm] = useState<Partial<Shipment>>({});

  // Cancellation State
  const [cancelReason, setCancelReason] = useState('Customer requested order cancellation prior to dispatch.');
  const [creationSuccessMsg, setCreationSuccessMsg] = useState<string | null>(null);

  // Filter Shipments
  const filteredShipments = shipments.filter(s => {
    const matchesSearch = 
      s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverAddress.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.receiverAddress.address && s.receiverAddress.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || statusFilter === 'All' || s.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'ALL' || priorityFilter === 'All' || s.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handle Create Shipment Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateShipment({
      senderName,
      senderPhone,
      senderEmail,
      senderAddress: { 
        address: senderStreet, 
        city: senderCity || 'Mumbai', 
        state: senderState || 'MH', 
        zipCode: senderZip, 
        country: senderCountry || 'India', 
        lat: Number(senderLat) || 19.076045, 
        lng: Number(senderLng) || 72.877712 
      },
      receiverName,
      receiverPhone,
      receiverEmail,
      receiverAddress: { 
        address: receiverStreet, 
        city: receiverCity || 'New Delhi', 
        state: receiverState || 'DL', 
        zipCode: receiverZip, 
        country: receiverCountry || 'India', 
        lat: Number(receiverLat) || 28.613939, 
        lng: Number(receiverLng) || 77.209021 
      },
      priority,
      packageType,
      weightKg: Number(weightKg),
      dimensionsCm,
      declaredValueUsd: Number(declaredValue),
      contentsDescription,
      isFragile,
      isHazardous,
      specialHandlingNotes,
      createdByUser: userRole,
    });
    setCreationSuccessMsg(`Shipment Request Created Successfully! Confirmation Email & PDF Tracking Voucher dispatched to ${senderEmail || 'aarav.sharma@gmail.com'} and ${receiverEmail || 'priya.patel@mumbai-tech.in'}.`);
    setShowCreateModal(false);
    // Reset form
    setSenderName('');
    setReceiverName('');
  };

  // Handle Status Transition Submit
  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStatusShipment) {
      onUpdateStatus(editingStatusShipment.id, newStatus, statusLocation, statusNote);
      setEditingStatusShipment(null);
    }
  };

  // Handle Full Details Edit Submit
  const handleEditDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDetailsShipment && onUpdateShipment) {
      onUpdateShipment(editingDetailsShipment.id, editForm);
      setEditingDetailsShipment(null);
    }
  };

  // Handle Cancellation Submit
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cancellingShipment && onCancelShipment) {
      onCancelShipment(cancellingShipment.id, cancelReason);
      setCancellingShipment(null);
    }
  };

  // Open Edit Details Modal
  const openEditDetails = (s: Shipment) => {
    setEditingDetailsShipment(s);
    setEditForm({
      senderName: s.senderName,
      senderPhone: s.senderPhone || '+1 (555) 019-2834',
      senderEmail: s.senderEmail || 'dispatch@sender.com',
      senderAddress: { ...s.senderAddress },
      receiverName: s.receiverName,
      receiverPhone: s.receiverPhone || '+1 (555) 987-6543',
      receiverEmail: s.receiverEmail || 'recipient@receiver.com',
      receiverAddress: { ...s.receiverAddress },
      priority: s.priority,
      packageType: s.packageType,
      weightKg: s.weightKg,
      dimensionsCm: s.dimensionsCm,
      declaredValueUsd: s.declaredValueUsd,
      contentsDescription: s.contentsDescription || 'Commercial goods',
      isFragile: s.isFragile || false,
      isHazardous: s.isHazardous || false,
      specialHandlingNotes: s.specialHandlingNotes || 'Handle with care',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Shipment Management Hub
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Manifest Creation, Package Specifications & Lifecycle Control
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Book new shipments, update manifest details, manage package parameters, view complete history audit logs, and handle cancellations.
          </p>
        </div>

        {/* Create Shipment CTA Button (Restricted for Support Agent) */}
        {userRole !== 'Support Agent' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Shipment
          </button>
        )}
      </div>

      {/* Confirmation Email Dispatched Alert Banner */}
      {creationSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 text-xs shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{creationSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setCreationSuccessMsg(null)}
            className="text-slate-400 hover:text-white font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Multi-Filter Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Tracking #, Sender, Receiver, Address, City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Created">Created</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed Delivery">Failed Delivery</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-medium focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="Standard">Standard</option>
              <option value="Express">Express</option>
              <option value="Overnight">Overnight</option>
              <option value="Critical Freight">Critical Freight</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Shipment Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4 text-blue-400" />
            Shipment Manifest Records ({filteredShipments.length})
          </span>
          <span className="text-slate-400">
            Click <span className="text-blue-400 font-semibold">Track</span> for live GPS map or <span className="text-slate-300 font-semibold">Package Specs</span> for item details
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3.5">Tracking Number</th>
                <th className="p-3.5">Sender Details</th>
                <th className="p-3.5">Receiver & Delivery Address</th>
                <th className="p-3.5">Package Info</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Dispatch / Driver</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No shipments match the selected search criteria or filters.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/60 transition">
                    
                    {/* Tracking Number */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-blue-400 flex items-center gap-1.5">
                        <span>{s.trackingNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Created: {s.createdAt}</div>
                    </td>

                    {/* Sender Details */}
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{s.senderName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {s.senderAddress.city}, {s.senderAddress.state || s.senderAddress.country}
                      </div>
                    </td>

                    {/* Receiver Details */}
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{s.receiverName}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">
                        {s.receiverAddress.address || `${s.receiverAddress.city}, ${s.receiverAddress.country}`}
                      </div>
                    </td>

                    {/* Package Info */}
                    <td className="p-3.5">
                      <button
                        onClick={() => setViewingPackageShipment(s)}
                        className="text-left group hover:opacity-80 transition"
                      >
                        <div className="font-medium text-slate-200 group-hover:text-blue-400 transition">
                          {s.packageType}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{s.weightKg} kg</span>
                          <span>•</span>
                          <span>{s.dimensionsCm} cm</span>
                          {s.isFragile && <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[9px]">Fragile</span>}
                        </div>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                        s.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        s.status === 'Out for Delivery' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        s.status === 'Failed Delivery' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        s.status === 'Cancelled' ? 'bg-slate-700/50 text-slate-400 border-slate-600' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Dispatch / Driver Status Column */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="font-medium text-white text-[11px] flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.assignedOperatorName || s.driver?.name || 'Unassigned'}</span>
                        </div>
                        
                        {/* Dispatch Status Badge */}
                        <div className="flex items-center gap-1">
                          {s.dispatchStatus === 'Accepted' ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                              Accepted
                            </span>
                          ) : s.dispatchStatus === 'Pending Acceptance' ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider animate-pulse">
                              Pending Offer
                            </span>
                          ) : s.dispatchStatus === 'Declined' ? (
                            <span
                              className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider cursor-help"
                              title={`Declined: ${s.dispatchDeclinedReason || 'By operator'}`}
                            >
                              Declined ⚠️
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.priority === 'Critical Freight' ? 'bg-purple-950 text-purple-300 border border-purple-700' :
                        s.priority === 'Overnight' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' :
                        s.priority === 'Express' ? 'bg-blue-950 text-blue-300 border border-blue-700' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {s.priority}
                      </span>
                    </td>

                    {/* Actions Dropdown / Buttons */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        
                        {/* Live GPS Track */}
                        <button
                          onClick={() => onSelectShipment(s)}
                          className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[10px] transition font-semibold inline-flex items-center gap-1 border border-blue-500/30"
                          title="View Live GPS Map"
                        >
                          <Eye className="w-3 h-3" />
                          Track
                        </button>

                        {/* Package Info View */}
                        <button
                          onClick={() => setViewingPackageShipment(s)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] transition inline-flex items-center gap-1"
                          title="View Package Information Specs"
                        >
                          <Box className="w-3 h-3 text-cyan-400" />
                          Specs
                        </button>

                        {/* History Audit Log */}
                        <button
                          onClick={() => setViewingHistoryShipment(s)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] transition inline-flex items-center gap-1"
                          title="Shipment History Audit Events"
                        >
                          <History className="w-3 h-3 text-purple-400" />
                          Audit
                        </button>

                        {/* Assign / Reassign Driver Dispatch Alert */}
                        {s.status !== 'Cancelled' && s.status !== 'Delivered' && (
                          <button
                            onClick={() => {
                              setAssigningShipment(s);
                              if (s.assignedOperatorId) setSelectedOperatorId(s.assignedOperatorId);
                              if (s.assignedOperatorName) setSelectedOperatorName(s.assignedOperatorName);
                            }}
                            className={`px-2 py-1 rounded text-[10px] transition inline-flex items-center gap-1 border font-bold ${
                              s.dispatchStatus === 'Declined'
                                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border-rose-500/40 animate-bounce'
                                : s.dispatchStatus === 'Pending Acceptance'
                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-600 hover:text-white border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/40'
                            }`}
                            title={s.dispatchStatus === 'Declined' ? 'Reassign Driver (Previous offer was declined)' : 'Assign Logistics Operator and Send Dispatch Alert'}
                          >
                            <Truck className="w-3 h-3" />
                            {s.dispatchStatus === 'Declined' ? 'Reassign' : s.dispatchStatus === 'Pending Acceptance' ? 'Dispatching' : 'Assign'}
                          </button>
                        )}

                        {/* Checkpoint Status Transition */}
                        {s.status !== 'Cancelled' && s.status !== 'Delivered' && (
                          <button
                            onClick={() => {
                              setEditingStatusShipment(s);
                              setNewStatus(s.status);
                            }}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded text-[10px] transition inline-flex items-center gap-1 border border-amber-500/30"
                            title="Update Checkpoint Status"
                          >
                            <Truck className="w-3 h-3" />
                            Status
                          </button>
                        )}

                        {/* Edit Manifest Details */}
                        {s.status !== 'Cancelled' && (
                          <button
                            onClick={() => openEditDetails(s)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] transition inline-flex items-center gap-1"
                            title="Update Sender, Receiver, or Address details"
                          >
                            <Edit3 className="w-3 h-3 text-emerald-400" />
                            Edit
                          </button>
                        )}

                        {/* Cancel Shipment */}
                        {s.status !== 'Cancelled' && s.status !== 'Delivered' && (
                          <button
                            onClick={() => setCancellingShipment(s)}
                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded text-[10px] transition inline-flex items-center gap-1 border border-rose-500/30"
                            title="Cancel Shipment"
                          >
                            <Ban className="w-3 h-3" />
                            Cancel
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* (i) CREATE SHIPMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-5 shrink-0 bg-slate-900">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-400" />
                  Create New Shipment Manifest
                </h3>
                <p className="text-xs text-slate-400">Fill in sender, receiver, package specs, and delivery address details.</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)} 
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
                
                {/* SECTION A: SENDER DETAILS */}
              <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-750">
                <h4 className="font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <User className="w-4 h-4" />
                  Sender Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Sender Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Apex Hub SF"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={senderStreet}
                      onChange={(e) => setSenderStreet(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={senderCity}
                      onChange={(e) => setSenderCity(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">State & ZIP</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="MH"
                        value={senderState}
                        onChange={(e) => setSenderState(e.target.value)}
                        className="w-12 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center"
                      />
                      <input
                        type="text"
                        placeholder="400093"
                        value={senderZip}
                        onChange={(e) => setSenderZip(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Sender Lat / Lng GPS Coordinates */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Locate className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-white text-[11px]">Sender Coordinates (Latitude / Longitude):</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Lat:</span>
                      <input
                        type="number"
                        step="any"
                        value={senderLat}
                        onChange={(e) => setSenderLat(parseFloat(e.target.value) || 0)}
                        className="w-24 p-1 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[11px]"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Lng:</span>
                      <input
                        type="number"
                        step="any"
                        value={senderLng}
                        onChange={(e) => setSenderLng(parseFloat(e.target.value) || 0)}
                        className="w-24 p-1 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[11px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleFetchSenderGeo}
                      disabled={geoLoadingSender}
                      className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Locate className={`w-3 h-3 ${geoLoadingSender ? 'animate-spin' : ''}`} />
                      <span>{geoLoadingSender ? 'Locating...' : 'Use My GPS'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION B: RECEIVER & DELIVERY ADDRESS DETAILS */}
              <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-750">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-4 h-4" />
                  Receiver Details & Delivery Address
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Receiver Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Reliance Freight Hub"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={receiverEmail}
                      onChange={(e) => setReceiverEmail(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-1">Delivery Street Address *</label>
                    <input
                      required
                      type="text"
                      value={receiverStreet}
                      onChange={(e) => setReceiverStreet(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">City *</label>
                    <input
                      required
                      type="text"
                      value={receiverCity}
                      onChange={(e) => setReceiverCity(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">State & ZIP</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="DL"
                        value={receiverState}
                        onChange={(e) => setReceiverState(e.target.value)}
                        className="w-12 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center"
                      />
                      <input
                        type="text"
                        placeholder="110001"
                        value={receiverZip}
                        onChange={(e) => setReceiverZip(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Receiver Lat / Lng GPS Coordinates */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Locate className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white text-[11px]">Receiver Destination Coordinates (Lat / Lng):</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Lat:</span>
                      <input
                        type="number"
                        step="any"
                        value={receiverLat}
                        onChange={(e) => setReceiverLat(parseFloat(e.target.value) || 0)}
                        className="w-24 p-1 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[11px]"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Lng:</span>
                      <input
                        type="number"
                        step="any"
                        value={receiverLng}
                        onChange={(e) => setReceiverLng(parseFloat(e.target.value) || 0)}
                        className="w-24 p-1 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[11px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleFetchReceiverGeo}
                      disabled={geoLoadingReceiver}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Locate className={`w-3 h-3 ${geoLoadingReceiver ? 'animate-spin' : ''}`} />
                      <span>{geoLoadingReceiver ? 'Locating...' : 'Use My GPS'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION C: PACKAGE INFORMATION MANAGEMENT */}
              <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-750">
                <h4 className="font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <Box className="w-4 h-4" />
                  Package Specifications & Handling Requirements
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Priority Tier</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Express">Express</option>
                      <option value="Overnight">Overnight</option>
                      <option value="Critical Freight">Critical Freight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Package Type</label>
                    <input
                      type="text"
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Declared Value ($)</label>
                    <input
                      type="number"
                      value={declaredValue}
                      onChange={(e) => setDeclaredValue(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Dimensions (L x W x H in cm)</label>
                    <input
                      type="text"
                      value={dimensionsCm}
                      onChange={(e) => setDimensionsCm(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Contents Description</label>
                    <input
                      type="text"
                      value={contentsDescription}
                      onChange={(e) => setContentsDescription(e.target.value)}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isFragile}
                      onChange={(e) => setIsFragile(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="font-semibold text-amber-400">Fragile Contents</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isHazardous}
                      onChange={(e) => setIsHazardous(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span className="font-semibold text-rose-400">Hazardous Goods (HAZMAT)</span>
                  </label>
                </div>
              </div>

              </div>

              <div className="p-4 flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Issue Tracking Number & Book Manifest
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* (ii) UPDATE SHIPMENT DETAILS MODAL */}
      {editingDetailsShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-5 shrink-0 bg-slate-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                Update Shipment Details #{editingDetailsShipment.trackingNumber}
              </h3>
              <button 
                type="button"
                onClick={() => setEditingDetailsShipment(null)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditDetailsSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={editForm.senderName || ''}
                    onChange={(e) => setEditForm({ ...editForm, senderName: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Receiver Name</label>
                  <input
                    type="text"
                    value={editForm.receiverName || ''}
                    onChange={(e) => setEditForm({ ...editForm, receiverName: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Delivery Street Address</label>
                <input
                  type="text"
                  value={editForm.receiverAddress?.address || ''}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    receiverAddress: { ...editForm.receiverAddress!, address: e.target.value }
                  })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Package Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.weightKg || ''}
                    onChange={(e) => setEditForm({ ...editForm, weightKg: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Dimensions (cm)</label>
                  <input
                    type="text"
                    value={editForm.dimensionsCm || ''}
                    onChange={(e) => setEditForm({ ...editForm, dimensionsCm: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Declared Value ($)</label>
                  <input
                    type="number"
                    value={editForm.declaredValueUsd || ''}
                    onChange={(e) => setEditForm({ ...editForm, declaredValueUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              </div>

              <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-800 bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingDetailsShipment(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow transition cursor-pointer"
                >
                  Save Manifest Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* (iii) SHIPMENT LIFECYCLE MANAGEMENT MODAL */}
      {editingStatusShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0 bg-slate-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                Lifecycle Transition #{editingStatusShipment.trackingNumber}
              </h3>
              <button onClick={() => setEditingStatusShipment(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
                <div>
                  <label className="block text-slate-400 mb-1">Transition To New Status Stage</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="Created">1. Created</option>
                    <option value="Picked Up">2. Picked Up</option>
                    <option value="In Transit">3. In Transit</option>
                    <option value="Out for Delivery">4. Out for Delivery</option>
                    <option value="Delivered">5. Delivered</option>
                    <option value="Failed Delivery">Failed Delivery (Attempted)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Scan Checkpoint Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Seattle Sorting Hub - Bay 4"
                    value={statusLocation}
                    onChange={(e) => setStatusLocation(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Operator Notes / Telemetry Log</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Package scanned into courier van #204..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="p-4 flex justify-end gap-2 border-t border-slate-800 bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingStatusShipment(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow transition cursor-pointer"
                >
                  Record Checkpoint Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* (iv) SHIPMENT HISTORY AUDIT TRAIL MODAL */}
      {viewingHistoryShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0 bg-slate-900">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Shipment History Audit Trail
                </h3>
                <p className="text-xs text-slate-400 font-mono">#{viewingHistoryShipment.trackingNumber}</p>
              </div>
              <button onClick={() => setViewingHistoryShipment(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1 text-xs">
              {viewingHistoryShipment.events.map((evt, idx) => (
                <div key={evt.id || idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{evt.status}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <div className="text-slate-300">{evt.description}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-750">
                    <span>Location: {evt.location}</span>
                    <span>Logged By: {evt.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* (v) PACKAGE INFORMATION MANAGEMENT MODAL */}
      {viewingPackageShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0 bg-slate-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-cyan-400" />
                Package Information Specs
              </h3>
              <button onClick={() => setViewingPackageShipment(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400">Tracking Number</span>
                <span className="font-mono font-bold text-blue-400">{viewingPackageShipment.trackingNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 text-[10px]">Package Type</span>
                  <div className="font-bold text-white">{viewingPackageShipment.packageType}</div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 text-[10px]">Actual Weight</span>
                  <div className="font-bold text-white">{viewingPackageShipment.weightKg} kg</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 text-[10px]">Dimensions (LxWxH)</span>
                  <div className="font-bold text-white font-mono">{viewingPackageShipment.dimensionsCm} cm</div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 text-[10px]">Declared Value</span>
                  <div className="font-bold text-emerald-400">${viewingPackageShipment.declaredValueUsd} USD</div>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px]">Contents Description</span>
                <div className="text-white">{viewingPackageShipment.contentsDescription || 'General commercial cargo'}</div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {viewingPackageShipment.isFragile && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold">
                    ⚠️ Fragile Package
                  </span>
                )}
                {viewingPackageShipment.isHazardous && (
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-bold">
                    ☣️ HAZMAT Restricted
                  </span>
                )}
                {!viewingPackageShipment.isFragile && !viewingPackageShipment.isHazardous && (
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full">
                    Standard Handling
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* (vi) SHIPMENT CANCELLATION MODAL */}
      {cancellingShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-900/50 rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 shrink-0 bg-slate-900">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Cancel Shipment #{cancellingShipment.trackingNumber}
              </h3>
              <button onClick={() => setCancellingShipment(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
                <p className="text-slate-300">
                  Are you sure you want to cancel this shipment? This will update the status to <strong className="text-rose-400">Cancelled</strong> and notify logistics dispatch.
                </p>

                <div>
                  <label className="block text-slate-400 mb-1">Reason for Cancellation *</label>
                  <textarea
                    required
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="Provide reason for voiding or cancelling manifest..."
                  />
                </div>
              </div>

              <div className="p-4 flex justify-end gap-2 border-t border-slate-800 bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setCancellingShipment(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition cursor-pointer"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow transition cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* (vii) ASSIGN LOGISTICS OPERATOR DISPATCH MODAL */}
      {assigningShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl space-y-4 p-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Assign Operator & Send Dispatch Alert (#{assigningShipment.trackingNumber})</span>
              </h3>
              <button onClick={() => setAssigningShipment(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {/* Previous decline alert if present */}
            {assigningShipment.dispatchStatus === 'Declined' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Previous Offer Declined
                </span>
                <p className="text-slate-300">
                  Driver <strong className="text-white">{assigningShipment.assignedOperatorName || 'Previous Driver'}</strong> declined this shipment.
                </p>
                <p className="text-[11px] text-rose-300 italic">
                  Reason: "{assigningShipment.dispatchDeclinedReason || 'Capacity limit'}"
                </p>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* Shipment Route Brief */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pickup Origin</span>
                  <p className="font-bold text-white truncate">{assigningShipment.senderName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{assigningShipment.senderAddress.city}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Drop-off Destination</span>
                  <p className="font-bold text-white truncate">{assigningShipment.receiverName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{assigningShipment.receiverAddress.city}</p>
                </div>
              </div>

              {/* Driver Dropdown & Auto-Assign */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Select Logistics Operator / Driver *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoAssign}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    Auto-Assign (Round Robin)
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {availableOperators.map((op) => (
                    <label
                      key={op.id}
                      onClick={() => {
                        setSelectedOperatorId(op.id);
                        setSelectedOperatorName(op.name);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                        selectedOperatorId === op.id
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white font-bold'
                          : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="operatorSelect"
                          checked={selectedOperatorId === op.id}
                          onChange={() => {
                            setSelectedOperatorId(op.id);
                            setSelectedOperatorName(op.name);
                          }}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{op.name}</p>
                          <p className="text-[10px] text-slate-400">{op.vehicle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">Available</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pickup Window */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[10px] uppercase tracking-wider">
                  Target Pickup Time Window *
                </label>
                <input
                  type="text"
                  required
                  value={assignPickupWindow}
                  onChange={(e) => setAssignPickupWindow(e.target.value)}
                  placeholder="e.g. Today by 2:00 PM"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningShipment(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-extrabold shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Dispatch Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
