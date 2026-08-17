import React, { useState } from 'react';
import { UserRole, Shipment } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  Award,
  Users,
  Zap,
  Navigation,
  Activity,
  History,
  Calendar,
  Layers,
  RefreshCw,
  MapPin,
  Compass,
  User,
  Building2,
  ShieldAlert,
  Bell,
  Search,
  Download,
  FileText,
  Server,
  Database,
  Cpu,
  Truck,
  ArrowUpRight,
  Filter,
  Eye,
  Check,
  X
} from 'lucide-react';

interface AnalyticsDashboardProps {
  userRole: UserRole;
  shipments: Shipment[];
  currentUser?: { name: string; email: string; role: UserRole; companyName?: string } | null;
  onSelectShipment?: (shipment: Shipment) => void;
  onNavigateTab?: (tab: string) => void;
  onCreateShipment?: (data: any) => Promise<void> | void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  userRole, 
  shipments, 
  currentUser,
  onSelectShipment,
  onNavigateTab,
  onCreateShipment
}) => {
  // Map passed userRole to default perspective mode
  const initialMode = 
    userRole === 'Customer' ? 'customer' :
    userRole === 'Business Client' ? 'business' : 'admin';

  const [activeDashboardMode, setActiveDashboardMode] = useState<'customer' | 'business' | 'admin'>(initialMode);

  // Keep mode strictly matched to userRole when userRole changes
  React.useEffect(() => {
    if (userRole === 'Customer') {
      setActiveDashboardMode('customer');
    } else if (userRole === 'Business Client') {
      setActiveDashboardMode('business');
    } else if (userRole === 'Administrator') {
      if (activeDashboardMode !== 'admin' && activeDashboardMode !== 'business' && activeDashboardMode !== 'customer') {
        setActiveDashboardMode('admin');
      }
    }
  }, [userRole]);

  // Customer Profile details from localStorage or default
  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('shiptrack_customer_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: currentUser?.name || 'Aarav Sharma',
      email: currentUser?.email || 'aarav.sharma@gmail.com',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Meadows, Bandra West, Mumbai, MH - 400050',
      deliveryNotes: 'Leave packages with gate security guard if not at home.',
      timezone: 'IST (UTC+05:30) Mumbai',
    };
  });

  // Re-sync customer profile when currentUser or component mounts
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('shiptrack_customer_profile');
      if (saved) {
        setCustomerProfile(JSON.parse(saved));
      }
    } catch (e) {}
  }, [currentUser]);

  // Sub-tabs for each perspective (Tracking Insights for Customer)
  const [customerSubTab, setCustomerSubTab] = useState<'active' | 'history' | 'overview' | 'notifications' | 'insights'>('active');
  const [businessSubTab, setBusinessSubTab] = useState<'analytics' | 'performance' | 'delays' | 'logistics' | 'customers'>('analytics');
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'monitoring' | 'analytics' | 'routes' | 'system' | 'reports'>('monitoring');

  // Interactive filters & states
  const [searchTerm, setSearchTerm] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Customer Create Package Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);
  const [isSubmittingPkg, setIsSubmittingPkg] = useState(false);

  // Bulk Freight Creation State
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);
  const [bulkRows, setBulkRows] = useState([
    { receiverName: 'Tata Motors Assembly Hub', receiverCity: 'Pune', country: 'India', weightKg: '180', priority: 'Express', packageType: 'Pallet Heavy Freight', contentsDescription: 'Automotive Powertrain Units' },
    { receiverName: 'Infosys Tech Park Depot', receiverCity: 'Bengaluru', country: 'India', weightKg: '42', priority: 'Overnight', packageType: 'Electronics Box', contentsDescription: 'Server Rack Switches & Blades' },
    { receiverName: 'Reliance Retail Center', receiverCity: 'Ahmedabad', country: 'India', weightKg: '95', priority: 'Standard', packageType: 'Commercial Freight', contentsDescription: 'Consumer Goods Batch' },
  ]);

  const handleAddBulkRow = () => {
    setBulkRows(prev => [
      ...prev,
      { receiverName: '', receiverCity: 'Mumbai', country: 'India', weightKg: '25', priority: 'Standard', packageType: 'Standard Parcel', contentsDescription: 'Commercial Freight' }
    ]);
  };

  const handleRemoveBulkRow = (index: number) => {
    setBulkRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBulkRow = (index: number, field: string, value: string) => {
    setBulkRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateShipment) return;
    setIsSubmittingBulk(true);
    setBulkSuccessMsg(null);

    try {
      for (const row of bulkRows) {
        if (!row.receiverName.trim()) continue;
        const payload = {
          senderName: currentUser?.companyName || currentUser?.name || 'Enterprise Freight Shipper',
          senderPhone: '+91 22 6789 0000',
          senderEmail: currentUser?.email || 'dispatch@enterprise.com',
          senderAddress: { city: 'Mumbai', state: 'MH', country: 'India', lat: 19.076, lng: 72.8777, address: 'BKC Supply Chain Hub' },
          receiverName: row.receiverName,
          receiverPhone: '+91 98765 00000',
          receiverEmail: 'receiving@destination.com',
          receiverAddress: { city: row.receiverCity, country: row.country || 'India', lat: 18.5204, lng: 73.8567, address: `${row.receiverCity} Commercial Logistics Hub` },
          priority: row.priority || 'Express',
          weightKg: Number(row.weightKg) || 25,
          packageType: row.packageType || 'Heavy Freight',
          dimensionsCm: '80x60x50',
          declaredValueUsd: 1250,
          contentsDescription: row.contentsDescription || 'Enterprise Freight Batch',
          isFragile: false,
          isHazardous: false,
          createdByUser: 'Business Client'
        };
        await onCreateShipment(payload);
      }
      setBulkSuccessMsg(`Successfully created ${bulkRows.length} bulk shipments! They are now live in your freight table.`);
      setTimeout(() => {
        setBulkSuccessMsg(null);
        setShowBulkCreateModal(false);
      }, 2000);
    } catch (err) {
      console.error('Failed bulk shipment dispatch:', err);
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Business Scoped Shipments & Metrics
  const companyKey = currentUser?.companyName?.toLowerCase() || '';
  const businessShipments = shipments.filter(s => {
    if (companyKey) {
      return s.senderName.toLowerCase().includes(companyKey) || 
             s.receiverName.toLowerCase().includes(companyKey) ||
             s.contentsDescription?.toLowerCase().includes(companyKey) ||
             s.createdByUser === 'Business Client';
    }
    return true; // Show all if no company filter
  });

  const activeBusinessShipments = businessShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled');
  const deliveredBusinessShipments = businessShipments.filter(s => s.status === 'Delivered');
  const delayedBusinessShipments = businessShipments.filter(s => s.aiPredictedDelayRisk === 'High' || s.status === 'Failed Delivery');
  
  const bizTotal = businessShipments.length || 1;
  const bizOnTimePct = Math.round(((bizTotal - delayedBusinessShipments.length) / bizTotal) * 100);
  const bizSlaCompliance = Math.min(100, Math.round(((deliveredBusinessShipments.length + activeBusinessShipments.length - delayedBusinessShipments.length) / bizTotal) * 100));
  const bizTotalSpend = businessShipments.reduce((sum, s) => sum + (s.declaredValueUsd ? Math.round(s.declaredValueUsd * 0.12) : 180), 0);

  const handleExportBusinessReportCSV = () => {
    const headers = "Tracking Number,Sender,Receiver,Destination City,Priority,Weight (kg),Status,Estimated Delivery,Declared Value (USD)\n";
    const rows = businessShipments.map(s => 
      `"${s.trackingNumber}","${s.senderName}","${s.receiverName}","${s.receiverAddress.city}","${s.priority}",${s.weightKg},"${s.status}","${s.estimatedDeliveryTime}",${s.declaredValueUsd}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Enterprise_Freight_Report_${(currentUser?.companyName || 'Business').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [newPkgDescription, setNewPkgDescription] = useState('');
  const [newPkgType, setNewPkgType] = useState('Standard Parcel');
  const [newPkgWeight, setNewPkgWeight] = useState('2.5');
  const [newPkgPriority, setNewPkgPriority] = useState('Standard');
  const [newPkgSenderName, setNewPkgSenderName] = useState('Tata Logistics Hub');
  const [newPkgSenderCity, setNewPkgSenderCity] = useState('Mumbai');
  const [newPkgReceiverName, setNewPkgReceiverName] = useState(customerProfile.name);
  const [newPkgReceiverCity, setNewPkgReceiverCity] = useState('Bandra, Mumbai');
  const [newPkgReceiverAddress, setNewPkgReceiverAddress] = useState(customerProfile.address);

  const handleCustomerCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPkg(true);
    try {
      const pkgData = {
        senderName: newPkgSenderName || 'Tata Logistics Hub',
        senderPhone: '+91 98765 43210',
        senderEmail: 'dispatch@tata-logistics.in',
        senderAddress: { city: newPkgSenderCity || 'Mumbai', state: 'MH', country: 'India', lat: 19.076, lng: 72.877, address: `${newPkgSenderCity} Logistics Depot` },
        receiverName: newPkgReceiverName || customerProfile.name,
        receiverPhone: customerProfile.phone || '+91 98765 43210',
        receiverEmail: customerProfile.email || 'aarav.sharma@gmail.com',
        receiverAddress: { city: newPkgReceiverCity || 'Mumbai', state: 'MH', country: 'India', lat: 19.076, lng: 72.877, address: newPkgReceiverAddress || customerProfile.address },
        priority: newPkgPriority,
        packageType: newPkgType,
        weightKg: Number(newPkgWeight) || 2.5,
        dimensionsCm: '25x20x15',
        declaredValueUsd: 150,
        contentsDescription: newPkgDescription || 'Customer Parcel',
        isFragile: false,
        isHazardous: false,
        createdByUser: 'Customer',
      };

      if (onCreateShipment) {
        await onCreateShipment(pkgData);
      }
      setCreateSuccessMsg('New package created successfully! It is now visible in your Active Incoming Packages list.');
      setShowCreateModal(false);
      setNewPkgDescription('');
      setTimeout(() => setCreateSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Failed to create package from dashboard:', err);
    } finally {
      setIsSubmittingPkg(false);
    }
  };

  // Compute general metrics
  const totalShipments = shipments.length;
  const activeShipments = shipments.filter(s => s.status === 'Created' || s.status === 'In Transit' || s.status === 'Out for Delivery' || s.status === 'Picked Up');
  const historyShipments = shipments.filter(s => s.status === 'Delivered' || s.status === 'Failed Delivery' || s.status === 'Cancelled');
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const delayedCount = shipments.filter(s => s.aiPredictedDelayRisk === 'High' || s.status === 'Failed Delivery').length;
  const onTimePct = totalShipments > 0 ? Math.round(((deliveredCount + activeShipments.length - delayedCount) / totalShipments) * 100) : 96;

  // Chart Data: Service Tier Breakdown
  const volumeData = [
    { day: 'Mon', Standard: 120, Express: 85, Overnight: 40 },
    { day: 'Tue', Standard: 145, Express: 92, Overnight: 55 },
    { day: 'Wed', Standard: 160, Express: 110, Overnight: 62 },
    { day: 'Thu', Standard: 180, Express: 125, Overnight: 70 },
    { day: 'Fri', Standard: 210, Express: 140, Overnight: 85 },
    { day: 'Sat', Standard: 95, Express: 60, Overnight: 30 },
    { day: 'Sun', Standard: 70, Express: 45, Overnight: 20 },
  ];

  // Chart Data: Status Overview Distribution
  const statusDistributionData = [
    { name: 'Delivered', value: deliveredCount || 4, color: '#10b981' },
    { name: 'In Transit', value: shipments.filter(s => s.status === 'In Transit').length || 3, color: '#3b82f6' },
    { name: 'Out for Delivery', value: shipments.filter(s => s.status === 'Out for Delivery').length || 2, color: '#06b6d4' },
    { name: 'Delayed Risk', value: delayedCount || 1, color: '#f59e0b' },
  ];

  // Chart Data: Carrier SLA
  const carrierSlaData = [
    { carrier: 'Tata Express Logistics', SLA: 98.2, Volume: '1,420 pkgs', OnTime: '98.5%' },
    { carrier: 'Mahindra Freight Lines', SLA: 96.4, Volume: '980 pkgs', OnTime: '96.2%' },
    { carrier: 'Reliance Supply Chain', SLA: 94.1, Volume: '620 pkgs', OnTime: '94.8%' },
    { carrier: 'Delhivery Speed Network', SLA: 92.8, Volume: '450 pkgs', OnTime: '93.1%' },
  ];

  // Chart Data: Delay Reasons
  const delayCausesData = [
    { name: 'Heavy Monsoon Rainfall / Flooding', value: 38, color: '#f59e0b' },
    { name: 'NH Highway Toll Plaza Congestion', value: 27, color: '#3b82f6' },
    { name: 'Interstate Border Checkpoint Delay', value: 20, color: '#ef4444' },
    { name: 'Recipient Pin Code Verification', value: 15, color: '#8b5cf6' },
  ];

  // Mock User Accounts Data for Admin
  const adminUsersList = [
    { id: 'usr-1', name: 'Aarav Sharma', email: 'aarav.sharma@tata.com', role: 'Customer', status: 'Active', shipments: 12, joined: '2026-01-15' },
    { id: 'usr-2', name: 'Priya Patel', email: 'priya.p@reliance.com', role: 'Business Client', status: 'Active', shipments: 48, joined: '2025-11-20' },
    { id: 'usr-3', name: 'Rajesh Verma', email: 'rajesh.v@mahindra.com', role: 'Logistics Operator', status: 'Active', shipments: 150, joined: '2025-08-10' },
    { id: 'usr-4', name: 'Ananya Iyer', email: 'ananya.i@shiptrack.in', role: 'Support Agent', status: 'Active', shipments: 0, joined: '2026-03-01' },
    { id: 'usr-5', name: 'Rajesh Admin', email: 'admin@shiptrack.in', role: 'Administrator', status: 'Active', shipments: 0, joined: '2025-01-01' },
  ];

  // Mock Business Customer Accounts
  const businessAccounts = [
    { accountName: 'Tata Electronics Hub', packageVolume: '2,450', spending: '₹18,40,000', slaRating: '99.1%', primaryRegion: 'Western Zone (Mumbai / MH)' },
    { accountName: 'Reliance Supply Chain', packageVolume: '1,820', spending: '₹14,20,000', slaRating: '97.8%', primaryRegion: 'Northern Zone (Delhi NCR)' },
    { accountName: 'Infosys Tech Depot', packageVolume: '940', spending: '₹8,90,000', slaRating: '98.4%', primaryRegion: 'Southern Zone (Bengaluru)' },
    { accountName: 'Sun Pharma Vaults', packageVolume: '1,200', spending: '₹11,50,000', slaRating: '96.5%', primaryRegion: 'Gujarat & Western Corridor' },
  ];

  const handleTriggerReportDownload = (reportName: string) => {
    setExportNotice(`Generating ${reportName}... Download will start automatically.`);
    setTimeout(() => {
      const blob = new Blob([`GLOBAL LOGISTICS REPORT: ${reportName}\nGenerated: ${new Date().toISOString()}\nStatus: Verified\nSystem Version: v2.4.0`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setExportNotice(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Mode Perspective Selector */}
      {userRole === 'Customer' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Welcome, {customerProfile.name || 'Valued Customer'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage active shipments, delivery destination details, and real-time package updates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Create New Package</span>
            </button>
            <button
              onClick={() => onNavigateTab?.('profile')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>My Profile & Settings</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                Analytics Dashboard Module
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                {userRole === 'Business Client' ? 'Business Enterprise Logistics & Freight Hub' : 'Master System Administration & Analytics'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Operational analytics, carrier SLAs, delay risk intelligence, and fleet telemetry monitoring.
            </p>
          </div>

          {userRole === 'Administrator' && (
            <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1">
              <button
                onClick={() => setActiveDashboardMode('customer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeDashboardMode === 'customer' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                onClick={() => setActiveDashboardMode('business')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeDashboardMode === 'business' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Business</span>
              </button>

              <button
                onClick={() => setActiveDashboardMode('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeDashboardMode === 'admin' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. CUSTOMER DASHBOARD PERSPECTIVE */}
      {/* ==================================================================== */}
      {activeDashboardMode === 'customer' && (
        <div className="space-y-6">
          
          {/* Customer Sub-Nav */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
            {[
              { id: 'active', label: 'Active In-bound Deliveries', icon: Package },
              { id: 'history', label: 'Completed Delivery History', icon: History },
              { id: 'overview', label: 'Delivery Status Summary', icon: PieChartIcon },
              { id: 'notifications', label: 'Alerts & SMS Stream', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCustomerSubTab(tab.id as any)}
                  className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    customerSubTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* (i) Active Deliveries Sub-Tab */}
          {customerSubTab === 'active' && (
            <div className="space-y-6">

              {createSuccessMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{createSuccessMsg}</span>
                  </div>
                  <button onClick={() => setCreateSuccessMsg(null)} className="text-slate-400 hover:text-white text-xs font-bold">Dismiss</button>
                </div>
              )}

              {/* CUSTOMER DESTINATION AREA CARD */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-xl shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">Delivery Destination Address</h3>
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                          Primary Verified Address
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Destination address registered for all active incoming packages.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onNavigateTab?.('profile')}
                    className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Edit Destination Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recipient & Contact</span>
                    <div className="font-bold text-white text-sm">{customerProfile.name}</div>
                    <div className="text-slate-300 font-mono text-[11px]">{customerProfile.phone}</div>
                    <div className="text-slate-400 text-[10px] truncate">{customerProfile.email}</div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block flex items-center justify-between">
                      <span>Delivery Address & Gate Security Instructions</span>
                      <span className="text-emerald-400 font-mono text-[10px]">Active Destination</span>
                    </span>
                    <div className="font-bold text-slate-100 flex items-start gap-1.5 text-xs">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{customerProfile.address}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] bg-slate-900 p-2 rounded border border-slate-800 mt-1 italic">
                      " {customerProfile.deliveryNotes} "
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIVE PACKAGES LIST WITH LIVE TRACKING LOCATIONS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-400" />
                      Active Incoming Packages ({activeShipments.length})
                    </h3>
                    <p className="text-xs text-slate-400">Real-time GPS tracking location and arrival status for each package heading to your destination.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {activeShipments.map((s) => {
                    // Determine precise live location string
                    const liveLocationStr = s.currentLocation?.address 
                      ? `${s.currentLocation.address}, ${s.currentLocation.city}`
                      : s.status === 'Out for Delivery'
                      ? `Out for Delivery near ${s.receiverAddress.city} Local Depot`
                      : s.status === 'In Transit'
                      ? `In Transit via Highway Corridor near ${s.currentLocation?.city || s.senderAddress.city}`
                      : `Picked up at ${s.senderAddress.city} Logistics Depot`;

                    const progressPct = 
                      s.status === 'Created' ? 15 :
                      s.status === 'Picked Up' ? 35 :
                      s.status === 'In Transit' ? 65 :
                      s.status === 'Out for Delivery' ? 88 : 100;

                    return (
                      <div key={s.id} className="p-5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-4 shadow-md hover:border-slate-600 transition">
                        
                        {/* Top Row: Tracking ID, Item Description, Status Badge */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/30">
                              #{s.trackingNumber}
                            </span>
                            <div>
                              <span className="font-bold text-white text-sm block">{s.contentsDescription || s.packageType || 'General Cargo'}</span>
                              <span className="text-[11px] text-slate-400">Weight: {s.weightKg} kg • Carrier: {s.senderName.includes('Tata') ? 'Tata Logistics Speed' : 'Shiptrack Express'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 ${
                              s.status === 'Out for Delivery' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                              s.status === 'In Transit' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}>
                              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                              {s.status}
                            </span>
                          </div>
                        </div>

                        {/* HIGH-VISIBILITY LIVE TRACKING LOCATION BANNER */}
                        <div className="p-3.5 bg-blue-950/50 border border-blue-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0 border border-blue-500/30">
                              <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Live Package GPS Location</span>
                              <div className="text-xs font-bold text-white flex items-center gap-1">
                                <span>{liveLocationStr}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onSelectShipment?.(s)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg shadow-blue-600/30"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Track Live on Map</span>
                          </button>
                        </div>

                        {/* Package Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80">
                            <span className="text-[10px] text-slate-400 block font-semibold">Origin Location</span>
                            <strong className="text-slate-200 text-xs block mt-0.5 truncate">{s.senderAddress.city}, {s.senderAddress.state || 'India'}</strong>
                          </div>

                          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80">
                            <span className="text-[10px] text-slate-400 block font-semibold">Estimated Arrival</span>
                            <strong className="text-emerald-400 font-mono text-xs block mt-0.5">{s.estimatedDeliveryTime}</strong>
                          </div>

                          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80">
                            <span className="text-[10px] text-slate-400 block font-semibold">Couriers / Driver</span>
                            <strong className="text-slate-200 text-xs block mt-0.5 truncate">{s.driver?.name || 'Ramesh Kumar'} ({s.driver?.phone || '+91 98765 43210'})</strong>
                          </div>

                          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80">
                            <span className="text-[10px] text-slate-400 block font-semibold">Destination City</span>
                            <strong className="text-white text-xs block mt-0.5 truncate">{s.receiverAddress.city}, {s.receiverAddress.state || 'MH'}</strong>
                          </div>
                        </div>

                        {/* Visual Step Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                            <span className={s.status === 'Created' ? 'text-blue-400 font-bold' : ''}>Created</span>
                            <span className={s.status === 'Picked Up' ? 'text-blue-400 font-bold' : ''}>Picked Up</span>
                            <span className={s.status === 'In Transit' ? 'text-blue-400 font-bold' : ''}>In Transit</span>
                            <span className={s.status === 'Out for Delivery' ? 'text-cyan-400 font-bold' : ''}>Out for Delivery</span>
                            <span>Delivered</span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* (ii) Shipment History Sub-Tab */}
          {customerSubTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Customer Completed Shipment History
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Tracking #</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Destination</th>
                      <th className="p-3">Delivered Timestamp</th>
                      <th className="p-3 text-right">POD Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {historyShipments.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-mono font-bold text-blue-400">{s.trackingNumber}</td>
                        <td className="p-3 font-semibold text-white">{s.receiverName}</td>
                        <td className="p-3">{s.receiverAddress.city}, {s.receiverAddress.country}</td>
                        <td className="p-3 font-mono text-slate-400">{s.proofOfDelivery?.deliveredAt || s.estimatedDeliveryTime}</td>
                        <td className="p-3 text-right">
                          {s.proofOfDelivery ? (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                              Verified POD
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Standard Delivery</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* (iii) Delivery Status Overview Sub-Tab */}
          {customerSubTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-400" />
                  Personal Delivery Status Distribution
                </h3>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Status Metrics Summary</h3>
                <div className="space-y-2 text-xs">
                  {statusDistributionData.map((d) => (
                    <div key={d.name} className="p-3 bg-slate-800 rounded-xl flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-200 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </span>
                      <strong className="text-white font-mono text-sm">{d.value} packages</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* (iv) Notification Center Sub-Tab */}
          {customerSubTab === 'notifications' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                Customer Notification Stream
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start gap-3">
                  <Bell className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white">Out for Delivery Alert</h4>
                    <p className="text-slate-300 mt-0.5">Package #STP-9482-US is on courier vehicle with driver Carlos Mendez.</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">Today, 08:15 AM</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white">Delivery Confirmed with Digital POD</h4>
                    <p className="text-slate-300 mt-0.5">Shipment #STP-8829-US signed by Robert Martinez at Las Vegas Resort.</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">Today, 09:42 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* (v) Tracking Insights Sub-Tab */}
          {customerSubTab === 'insights' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <span className="text-slate-400 text-xs block font-semibold">Average Transit Speed</span>
                <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">28.4 Hours</div>
                <span className="text-[10px] text-emerald-400 mt-1 block">15% faster than carrier average</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <span className="text-slate-400 text-xs block font-semibold">On-Time Success Rate</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">98.5%</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Based on past 50 deliveries</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <span className="text-slate-400 text-xs block font-semibold">Top Destination Hub</span>
                <div className="text-xl font-bold text-white mt-1">San Francisco, CA</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Primary destination hub</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. BUSINESS DASHBOARD PERSPECTIVE */}
      {/* ==================================================================== */}
      {activeDashboardMode === 'business' && (
        <div className="space-y-6">
          
          {/* Business Header & Company Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {currentUser?.companyName || 'Enterprise Supply Chain Portal'}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-bold">
                    Enterprise Tier SLA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Account Contact: <strong className="text-slate-200">{currentUser?.name || 'Priya Patel'}</strong> ({currentUser?.email || 'priya.p@reliance.com'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowBulkCreateModal(true)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                Book Bulk Freight
              </button>
              <button
                onClick={handleExportBusinessReportCSV}
                className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Export Ledger (CSV)
              </button>
            </div>
          </div>

          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <span className="text-slate-400 text-xs font-semibold block">Active Freight Orders</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{activeBusinessShipments.length}</div>
              <span className="text-[10px] text-blue-400 mt-0.5 block">Out of {businessShipments.length} total orders</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <span className="text-slate-400 text-xs font-semibold block">On-Time Delivery Index</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{bizOnTimePct}%</div>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">Exceeds standard target</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <span className="text-slate-400 text-xs font-semibold block">SLA Compliance Rating</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{bizSlaCompliance}%</div>
              <span className="text-[10px] text-indigo-300 mt-0.5 block">Target: 98.0% | Status: Compliant</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <span className="text-slate-400 text-xs font-semibold block">Estimated Freight Spend</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">${bizTotalSpend.toLocaleString()}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Across active corridors</span>
            </div>
          </div>

          {/* Business Sub-Nav */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
            {[
              { id: 'analytics', label: '(i) Freight Orders Table', icon: Layers },
              { id: 'performance', label: '(ii) SLA & Performance', icon: Award },
              { id: 'delays', label: '(iii) Delay Analytics', icon: AlertTriangle },
              { id: 'customers', label: '(iv) Enterprise Accounts', icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setBusinessSubTab(tab.id as any)}
                  className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    businessSubTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* (i) Scoped Freight Orders Table Sub-Tab */}
          {businessSubTab === 'analytics' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Scoped Business Freight Shipments ({businessShipments.length} Total)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Company: {currentUser?.companyName || 'All Enterprise'}
                </span>
              </div>

              {businessShipments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Package className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-white">No freight shipments registered for this business yet.</p>
                  <p className="text-xs">Click "Book Bulk Freight" above to create enterprise shipments.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Tracking #</th>
                        <th className="p-3">Recipient Name</th>
                        <th className="p-3">Destination City</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Weight</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                      {businessShipments.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-blue-400">{s.trackingNumber}</td>
                          <td className="p-3 font-semibold text-white font-sans">{s.receiverName}</td>
                          <td className="p-3 font-sans">{s.receiverAddress.city}, {s.receiverAddress.country}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded text-[10px]">
                              {s.priority}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{s.weightKg} kg</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                              s.status === 'Out for Delivery' ? 'bg-cyan-500/20 text-cyan-300' :
                              'bg-amber-500/20 text-amber-300'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onSelectShipment && onSelectShipment(s)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-semibold transition cursor-pointer"
                            >
                              Track Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* (ii) SLA & Performance Sub-Tab */}
          {businessSubTab === 'performance' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Carrier SLA & Delivery Performance Ratings
              </h3>

              <div className="space-y-3">
                {carrierSlaData.map((c) => (
                  <div key={c.carrier} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.carrier}</h4>
                      <span className="text-slate-400 text-[11px]">Monthly Volume: {c.Volume}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-400 font-mono">{c.SLA}% SLA</div>
                      <span className="text-[10px] text-slate-400">On-Time Index: {c.OnTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* (iii) Delay Analysis Sub-Tab */}
          {businessSubTab === 'delays' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Delay Reason Decomposition
                </h3>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={delayCausesData} innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                        {delayCausesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Delay Risk Overview</h3>
                <div className="space-y-2 text-xs">
                  {businessShipments.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-3 bg-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-blue-400">{s.trackingNumber}</span>
                        <p className="text-slate-400 text-[11px]">{s.aiDelayReason || 'Weather bottleneck'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.aiPredictedDelayRisk === 'High' ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        Risk: {s.aiPredictedDelayRisk || 'Low'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* (iv) Customer Activity Sub-Tab */}
          {businessSubTab === 'customers' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Enterprise Business Customer Accounts & Activity
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Enterprise Account</th>
                      <th className="p-3">Monthly Volume</th>
                      <th className="p-3">Logistics Spend</th>
                      <th className="p-3">SLA Compliance</th>
                      <th className="p-3 text-right">Primary Corridor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {businessAccounts.map((b) => (
                      <tr key={b.accountName} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-white">{b.accountName}</td>
                        <td className="p-3 font-mono text-cyan-400">{b.packageVolume} pkgs</td>
                        <td className="p-3 font-mono text-emerald-400">{b.spending}</td>
                        <td className="p-3 font-mono font-bold text-indigo-300">{b.slaRating}</td>
                        <td className="p-3 text-right text-slate-400 font-mono">{b.primaryRegion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. ADMIN DASHBOARD PERSPECTIVE */}
      {/* ==================================================================== */}
      {activeDashboardMode === 'admin' && (
        <div className="space-y-6">
          
          {/* Admin Sub-Nav */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
            {[
              { id: 'users', label: '(i) User Management', icon: Users },
              { id: 'monitoring', label: '(ii) Shipment Monitoring', icon: Activity },
              { id: 'analytics', label: '(iii) Delivery Analytics', icon: BarChart3 },
              { id: 'routes', label: '(iv) Route Performance', icon: Compass },
              { id: 'system', label: '(v) System Monitoring', icon: Server },
              { id: 'reports', label: '(vi) Reports Management', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminSubTab(tab.id as any)}
                  className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    adminSubTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Export Notice Banner */}
          {exportNotice && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-2 text-purple-300 text-xs font-semibold animate-fadeIn">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-purple-400" />
              {exportNotice}
            </div>
          )}

          {/* (i) User Management Sub-Tab */}
          {adminSubTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Admin System User Accounts Management ({adminUsersList.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">System Role</th>
                      <th className="p-3">Active Packages</th>
                      <th className="p-3">Joined Date</th>
                      <th className="p-3 text-right">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {adminUsersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-white">{u.name}</td>
                        <td className="p-3 font-mono text-slate-400">{u.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-purple-300 rounded font-semibold text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-cyan-400">{u.shipments}</td>
                        <td className="p-3 font-mono text-slate-400">{u.joined}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold text-[10px]">
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* (ii) Shipment Monitoring Sub-Tab */}
          {adminSubTab === 'monitoring' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Live System-Wide Shipment Telemetry Monitoring
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Tracking #</th>
                      <th className="p-3">Recipient & Destination</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Estimated ETA</th>
                      <th className="p-3">AI Delay Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {shipments.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-mono font-bold text-blue-400">{s.trackingNumber}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{s.receiverName}</div>
                          <div className="text-[10px] text-slate-400">{s.receiverAddress.city}, {s.receiverAddress.country}</div>
                        </td>
                        <td className="p-3 font-semibold text-cyan-300">{s.status}</td>
                        <td className="p-3 font-mono">{s.estimatedDeliveryTime}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.aiPredictedDelayRisk === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {s.aiPredictedDelayRisk || 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* (iii) Delivery Analytics Sub-Tab */}
          {adminSubTab === 'analytics' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                System Delivery Performance Analytics
              </h3>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="Standard" stroke="#a855f7" fill="#8b5cf6" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="Express" stroke="#38bdf8" fill="#0284c7" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* (iv) Route Performance Sub-Tab */}
          {adminSubTab === 'routes' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                Global Route Corridor Telemetry & Congestion Logs
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>San Francisco -&gt; New York (I-80 Corridor)</span>
                    <span className="text-emerald-400 font-mono">98.4% SLA</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Distance: 4,120 km | Avg Speed: 78 km/h</p>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">Status: Optimal Flow</span>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Los Angeles -&gt; Chicago (I-40 East)</span>
                    <span className="text-amber-400 font-mono">96.2% SLA</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Distance: 3,240 km | Avg Speed: 72 km/h</p>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">Status: Moderate Construction Delay</span>
                </div>
              </div>
            </div>
          )}

          {/* (v) System Monitoring Sub-Tab */}
          {adminSubTab === 'system' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Server Infrastructure</span>
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">99.98% Uptime</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Cloud Run container cluster</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>API Gateway Latency</span>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-bold text-cyan-400 mt-2 font-mono">24 ms</div>
                <span className="text-[10px] text-slate-400 mt-1 block">p99 response latency</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Database Query Rate</span>
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-purple-400 mt-2 font-mono">1,420 qps</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Firestore indexed reads</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Notification Queue</span>
                  <Bell className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-indigo-400 mt-2 font-mono">0 Pending</div>
                <span className="text-[10px] text-emerald-400 mt-1 block">100% processed</span>
              </div>
            </div>
          )}

          {/* (vi) Reports Management Sub-Tab */}
          {adminSubTab === 'reports' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Admin Executive Reports & Audit Log Export Center
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Generate verified compliance ledgers, SLA reports, and delay audit logs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Monthly SLA Compliance Report</h4>
                    <p className="text-slate-400 text-[11px]">Carrier performance against 98% contractual SLA.</p>
                  </div>
                  <button
                    onClick={() => handleTriggerReportDownload('Monthly SLA Compliance Report')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">System Delay & Risk Audit Log</h4>
                    <p className="text-slate-400 text-[11px]">Detailed weather, traffic, and customs incident log.</p>
                  </div>
                  <button
                    onClick={() => handleTriggerReportDownload('System Delay & Risk Audit Log')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">User Accounts & Access Audit</h4>
                    <p className="text-slate-400 text-[11px]">Comprehensive active user role permission mapping.</p>
                  </div>
                  <button
                    onClick={() => handleTriggerReportDownload('User Accounts & Access Audit')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Financial & Freight Billing Ledger</h4>
                    <p className="text-slate-400 text-[11px]">Gross shipping revenue & operational fuel costs.</p>
                  </div>
                  <button
                    onClick={() => handleTriggerReportDownload('Financial & Freight Billing Ledger')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Customer Package Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Register New Package Request</h3>
                  <p className="text-xs text-slate-400">Book package for incoming delivery directly to your Customer Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerCreatePackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Package Contents / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Laptop, Headphones, Clothing, Documents"
                    value={newPkgDescription}
                    onChange={(e) => setNewPkgDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Package Category</label>
                  <select
                    value={newPkgType}
                    onChange={(e) => setNewPkgType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard Parcel">Standard Parcel</option>
                    <option value="Electronics Cargo">Electronics Cargo</option>
                    <option value="Documents Express">Documents Express</option>
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Medical Goods">Medical Goods</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Priority Tier</label>
                  <select
                    value={newPkgPriority}
                    onChange={(e) => setNewPkgPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard">Standard Delivery</option>
                    <option value="Express">Express Priority</option>
                    <option value="Critical Freight">Critical Freight</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPkgWeight}
                    onChange={(e) => setNewPkgWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Dispatch Sender / Origin</label>
                  <input
                    type="text"
                    value={newPkgSenderName}
                    onChange={(e) => setNewPkgSenderName(e.target.value)}
                    placeholder="e.g. Tata Fulfillment Center"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Origin City</label>
                  <input
                    type="text"
                    value={newPkgSenderCity}
                    onChange={(e) => setNewPkgSenderCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <label className="text-slate-300 font-semibold block flex items-center justify-between">
                  <span>Destination Address (Pre-filled from Profile)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Your Verified Address</span>
                </label>
                <input
                  type="text"
                  value={newPkgReceiverAddress}
                  onChange={(e) => setNewPkgReceiverAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPkg}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  {isSubmittingPkg ? 'Creating Package...' : 'Confirm & Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Freight Creation Modal */}
      {showBulkCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Bulk Freight Shipment Booking</h3>
                  <p className="text-xs text-slate-400">
                    Dispatch multiple commercial orders in one batch for <strong className="text-white">{currentUser?.companyName || 'Enterprise Client'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {bulkSuccessMsg}
              </div>
            )}

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-300 uppercase font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Recipient Name / Facility *</th>
                      <th className="p-2.5">Destination City</th>
                      <th className="p-2.5">Weight (kg)</th>
                      <th className="p-2.5">Priority</th>
                      <th className="p-2.5">Cargo Description</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950 text-slate-200">
                    {bulkRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={row.receiverName}
                            onChange={(e) => handleUpdateBulkRow(idx, 'receiverName', e.target.value)}
                            placeholder="Recipient Facility Name"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={row.receiverCity}
                            onChange={(e) => handleUpdateBulkRow(idx, 'receiverCity', e.target.value)}
                            placeholder="City"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="p-2 w-24">
                          <input
                            type="number"
                            value={row.weightKg}
                            onChange={(e) => handleUpdateBulkRow(idx, 'weightKg', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="p-2 w-32">
                          <select
                            value={row.priority}
                            onChange={(e) => handleUpdateBulkRow(idx, 'priority', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Standard">Standard</option>
                            <option value="Express">Express</option>
                            <option value="Overnight">Overnight</option>
                            <option value="Critical Freight">Critical</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.contentsDescription}
                            onChange={(e) => handleUpdateBulkRow(idx, 'contentsDescription', e.target.value)}
                            placeholder="Cargo Description"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {bulkRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBulkRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                              title="Remove Row"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAddBulkRow}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  + Add Shipment Row
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBulk}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                  >
                    {isSubmittingBulk ? 'Dispatching Batch...' : `Dispatch All (${bulkRows.length}) Bulk Shipments`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
