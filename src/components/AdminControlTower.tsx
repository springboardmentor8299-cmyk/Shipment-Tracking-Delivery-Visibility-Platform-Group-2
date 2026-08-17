import React, { useState, useEffect } from 'react';
import { 
  Shipment, 
  UserProfile, 
  UserRole, 
  AppNotification, 
  UserActivityLog, 
  DriverInfo, 
  DispatchStatus 
} from '../types';
import { InteractiveMap } from './InteractiveMap';
import { 
  ShieldCheck, 
  Users, 
  Truck, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  RefreshCw, 
  Settings, 
  Activity, 
  MapPin, 
  Radio, 
  Plus, 
  Eye, 
  Edit3, 
  UserCheck, 
  UserX, 
  Ban, 
  Trash2, 
  Key, 
  MessageSquare, 
  DollarSign, 
  PieChart, 
  BarChart2, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  ShieldAlert, 
  FileSpreadsheet, 
  Bell, 
  Building, 
  Map as MapIcon, 
  Zap, 
  Sliders, 
  Globe, 
  Database, 
  Server, 
  Lock,
  Headphones,
  Award,
  Calendar,
  Briefcase,
  Star,
  FileCheck,
  Compass,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface AdminControlTowerProps {
  shipments: Shipment[];
  [key: string]: any;
  currentUser?: any;
  onUpdateShipmentStatus?: any;
  onRefreshData?:any;
  onSelectShipmentToTrack?:any;
  onRoleChange?: any;
}

export const AdminControlTower: React.FC<AdminControlTowerProps> = ({
  shipments,
  currentUser,
  onUpdateShipmentStatus,
  onRefreshData,
  onSelectShipmentToTrack,
  onRoleChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'dashboard'
    | 'shipments'
    | 'customers'
    | 'business_clients'
    | 'operators'
    | 'agents'
    | 'business_approvals'
    | 'escalations'
    | 'analytics'
    | 'reports'
    | 'map'
    | 'system'
    | 'audit'
    | 'notifications'
    | 'settings'
  >('dashboard');

  // --- COMPREHENSIVE USER DIRECTORY STATE BY ROLE ---
  const [userList, setUserList] = useState<any[]>([
    // CUSTOMERS
    { 
      id: 'usr-1', 
      name: 'Aarav Sharma', 
      email: 'aarav.sharma@tata.com', 
      phone: '+91 98765 11223', 
      role: 'Customer', 
      status: 'Active', 
      regDate: '2026-06-12', 
      lastActive: '10 mins ago', 
      address: '12 Palm Beach Rd, Bandra West, Mumbai 400050',
      loyaltyTier: 'Gold Elite',
      totalSpent: '$12,450',
      totalShipments: 14, 
      activeOrders: 2
    },
    { 
      id: 'usr-10', 
      name: 'Sunita Reddy', 
      email: 'sunita.reddy@gmail.com', 
      phone: '+91 99887 66554', 
      role: 'Customer', 
      status: 'Active', 
      regDate: '2026-07-02', 
      lastActive: '1 hour ago', 
      address: '45 Jubilee Hills, Hyderabad 500033',
      loyaltyTier: 'Silver',
      totalSpent: '$3,800',
      totalShipments: 6, 
      activeOrders: 1
    },
    { 
      id: 'usr-11', 
      name: 'Rohan Kapoor', 
      email: 'rohan.kapoor@outlook.com', 
      phone: '+91 98112 33445', 
      role: 'Customer', 
      status: 'Active', 
      regDate: '2026-06-20', 
      lastActive: '2 days ago', 
      address: '88 Connaught Place, New Delhi 110001',
      loyaltyTier: 'Bronze',
      totalSpent: '$1,200',
      totalShipments: 3, 
      activeOrders: 0
    },
    { 
      id: 'usr-12', 
      name: 'Meera Joshi', 
      email: 'meera.j@yahoo.com', 
      phone: '+91 97654 32109', 
      role: 'Customer', 
      status: 'Suspended', 
      regDate: '2026-05-10', 
      lastActive: '5 days ago', 
      address: '102 Park Street, Kolkata 700016',
      loyaltyTier: 'Silver',
      totalSpent: '$5,600',
      totalShipments: 8, 
      activeOrders: 0
    },

    // BUSINESS CLIENTS
    { 
      id: 'usr-2', 
      name: 'Priya Patel', 
      email: 'priya.p@reliance.com', 
      phone: '+91 98220 44556', 
      role: 'Business Client', 
      companyName: 'Reliance Supply Chain Solutions', 
      taxId: '27AAACR1234F1ZV',
      taxIdType: 'GSTIN / EIN',
      tier: 'Enterprise VIP Tier',
      industry: 'Retail & FMCG Logistics',
      status: 'Active', 
      regDate: '2026-05-18', 
      lastActive: '2 mins ago', 
      address: 'Reliance Corporate Park, Navi Mumbai 400701',
      accountManager: 'Vikram Malhotra',
      totalShipments: 128,
      monthlyFreightVol: '450 Tons'
    },
    { 
      id: 'usr-6', 
      name: 'Karan Adani', 
      email: 'karan.a@adani-logistics.com', 
      phone: '+91 98220 11223', 
      role: 'Business Client', 
      companyName: 'Adani Logistics Services Ltd', 
      taxId: '27AAAAA0000A1Z5',
      taxIdType: 'GSTIN / EIN',
      tier: 'Enterprise Tier',
      industry: 'Heavy Freight & Cold Chain',
      status: 'Pending Approval', 
      regDate: '2026-07-25', 
      lastActive: '1 day ago', 
      address: 'Mundra Port Logistics Hub, Kutch, Gujarat',
      accountManager: 'Deepak Roy',
      totalShipments: 0,
      monthlyFreightVol: '1,200 Tons'
    },
    { 
      id: 'usr-13', 
      name: 'Sanjay Swamy', 
      email: 'sanjay.s@flipkart.in', 
      phone: '+91 99001 88776', 
      role: 'Business Client', 
      companyName: 'Flipkart Internet Pvt Ltd', 
      taxId: '29ABCDE1234F1Z9',
      taxIdType: 'GSTIN / EIN',
      tier: 'Enterprise VIP Tier',
      industry: 'E-Commerce Marketplace',
      status: 'Active', 
      regDate: '2026-07-24', 
      lastActive: 'Just now', 
      address: 'Outer Ring Road, Devarabeesanahalli, Bengaluru',
      accountManager: 'Anita Rao',
      totalShipments: 520,
      monthlyFreightVol: '2,800 Tons'
    },

    // LOGISTICS OPERATORS
    { 
      id: 'usr-3', 
      name: 'Rajesh Verma', 
      email: 'rajesh.v@mahindra.com', 
      phone: '+91 98765 43210', 
      role: 'Logistics Operator', 
      status: 'Active', 
      regDate: '2026-04-01', 
      lastActive: 'Just now', 
      totalShipments: 342, 
      rating: 4.9, 
      vehicle: 'Mahindra Blazo X Heavy Freight #402',
      licenseNo: 'DL-1420210082910',
      dutyStatus: 'On Duty / In-Transit',
      homeHub: 'Mumbai Central Freight Terminal',
      assignedRoute: 'Mumbai (BOM) -> New Delhi (DEL)',
      onTimeSlaPct: '99.2%'
    },
    { 
      id: 'usr-7', 
      name: 'Vikram Singh', 
      email: 'vikram.s@express.in', 
      phone: '+91 97110 33445', 
      role: 'Logistics Operator', 
      status: 'Active', 
      regDate: '2026-02-15', 
      lastActive: '15 mins ago', 
      totalShipments: 210, 
      rating: 4.8, 
      vehicle: 'Tata Prima Container #208',
      licenseNo: 'MH-0220198837122',
      dutyStatus: 'On Duty / Cross-Dock Loading',
      homeHub: 'Pune Logistics Terminal',
      assignedRoute: 'Pune (PNQ) -> Bengaluru (BLR)',
      onTimeSlaPct: '98.5%'
    },
    { 
      id: 'usr-14', 
      name: 'Amit Singh', 
      email: 'amit.s@apollo.com', 
      phone: '+91 98334 11223', 
      role: 'Logistics Operator', 
      status: 'Active', 
      regDate: '2026-03-22', 
      lastActive: '1 hour ago', 
      totalShipments: 185, 
      rating: 4.7, 
      vehicle: 'Ashok Leyland Cold Sprinter #105',
      licenseNo: 'KA-0120229910283',
      dutyStatus: 'Off Duty',
      homeHub: 'Bengaluru Electronic City Hub',
      assignedRoute: 'Bengaluru (BLR) -> Chennai (MAA)',
      onTimeSlaPct: '97.8%'
    },

    // SUPPORT AGENTS
    { 
      id: 'usr-4', 
      name: 'Ananya Iyer', 
      email: 'ananya.i@shiptrack.in', 
      phone: '+91 91234 56789', 
      role: 'Support Agent', 
      status: 'Active', 
      regDate: '2026-03-10', 
      lastActive: '5 mins ago', 
      totalShipments: 0,
      agentCode: 'AGT-901',
      desk: 'Tier-2 Escalations & POD Dispute Desk',
      shift: 'Morning Shift (08:00 - 16:00 IST)',
      resolvedTickets: 142,
      avgHandlingMins: '8.4 mins',
      rating: 4.9
    },
    { 
      id: 'usr-15', 
      name: 'Arjun Mehta', 
      email: 'arjun.m@shiptrack.in', 
      phone: '+91 91234 99887', 
      role: 'Support Agent', 
      status: 'Active', 
      regDate: '2026-04-18', 
      lastActive: '30 mins ago', 
      totalShipments: 0,
      agentCode: 'AGT-902',
      desk: 'Tier-1 Live Package Lookup Desk',
      shift: 'Evening Shift (16:00 - 00:00 IST)',
      resolvedTickets: 218,
      avgHandlingMins: '5.2 mins',
      rating: 4.8
    },

    // ADMINISTRATOR
    { 
      id: 'usr-5', 
      name: 'Rajesh Admin', 
      email: 'admin@shiptrack.in', 
      phone: '+91 90000 00000', 
      role: 'Administrator', 
      status: 'Active', 
      regDate: '2026-01-01', 
      lastActive: 'Just now', 
      totalShipments: 0 
    },
  ]);

  const [businessApprovals, setBusinessApprovals] = useState<any[]>([
    {
      id: 'biz-app-1',
      companyName: 'Adani Logistics Services Ltd',
      contactPerson: 'Karan Adani',
      email: 'karan.a@adani-logistics.com',
      phone: '+91 98220 11223',
      taxIdType: 'GSTIN / EIN',
      taxId: '27AAAAA0000A1Z5',
      industry: 'Heavy Freight & Cold Chain',
      tier: 'Enterprise Tier',
      registrationDate: '2026-07-25 16:30',
      status: 'Pending Approval',
      address: 'Mundra Port Logistics Hub, Kutch, Gujarat',
      verificationStatus: 'Documents Uploaded (Pending Admin Audit)',
    },
    {
      id: 'biz-app-2',
      companyName: 'Flipkart Internet Pvt Ltd',
      contactPerson: 'Sanjay Swamy',
      email: 'sanjay.s@flipkart.in',
      phone: '+91 99001 88776',
      taxIdType: 'GSTIN / EIN',
      taxId: '29ABCDE1234F1Z9',
      industry: 'E-Commerce Marketplace',
      tier: 'Enterprise Tier',
      registrationDate: '2026-07-24 10:15',
      status: 'Approved',
      address: 'Outer Ring Road, Devarabeesanahalli, Bengaluru',
      verificationStatus: 'Fully Verified by Administrator',
    }
  ]);

  const [escalations, setEscalations] = useState<any[]>([
    {
      id: 'esc-101',
      shipmentId: 'ship-101',
      trackingNumber: 'STP-9482-IN',
      customerName: 'Aarav Sharma',
      businessClient: 'Tata Electronics Hub',
      operatorName: 'Rajesh Verma',
      supportAgentName: 'Ananya Iyer',
      issueType: 'Flagged POD / Recipient Dispute',
      priority: 'High',
      evidenceUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
      podDetails: {
        recipientName: 'Vikram Mehta',
        deliveredAt: '2026-07-26 14:10',
        verificationStatus: 'FLAGGED',
        notes: 'Signature mismatch reported by recipient.'
      },
      complaintDetails: 'Customer claims parcel was left with security guard without OTP verification.',
      agentDecision: 'Flagged for Admin review. Recommending driver interview.',
      escalationDate: '2026-07-26 14:45',
      status: 'Open',
      internalNotes: 'Awaiting signature verification log from driver device.',
    },
    {
      id: 'esc-102',
      shipmentId: 'ship-103',
      trackingNumber: 'STP-3104-IN',
      customerName: 'Sunita Reddy',
      businessClient: 'Apollo Pharma Logistics',
      operatorName: 'Amit Singh',
      supportAgentName: 'Ananya Iyer',
      issueType: 'Package Damaged in Transit',
      priority: 'Critical',
      evidenceUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80&w=600',
      complaintDetails: 'Outer seal broken during transit near Pune toll plaza.',
      agentDecision: 'Initiated insurance claim verification. Escalated for claim approval.',
      escalationDate: '2026-07-26 11:20',
      status: 'Under Review',
      internalNotes: 'Transit insurance policy active up to $5,000.',
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: 'aud-101',
      adminName: currentUser?.name || 'Rajesh Admin',
      adminEmail: currentUser?.email || 'admin@shiptrack.in',
      action: 'Approved Business Client Application',
      target: 'Flipkart Internet Pvt Ltd (biz-app-2)',
      previousValue: 'Pending Approval',
      newValue: 'Approved / Active Account',
      ipAddress: '10.0.1.10',
      timestamp: '2026-07-26 10:15',
    },
    {
      id: 'aud-102',
      adminName: currentUser?.name || 'Rajesh Admin',
      adminEmail: currentUser?.email || 'admin@shiptrack.in',
      action: 'Reassigned Shipment Operator',
      target: 'Shipment #STP-9482-IN',
      previousValue: 'Unassigned',
      newValue: 'Assigned to Rajesh Verma',
      ipAddress: '10.0.1.10',
      timestamp: '2026-07-26 09:30',
    }
  ]);

  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'ShipTrack Pro Control Tower',
    timezone: 'IST (UTC+05:30) Mumbai / New Delhi',
    currency: 'USD ($) / INR (₹)',
    autoAssignmentEnabled: true,
    delayThresholdMins: 30,
    escalationThresholdHours: 2,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    pushNotificationsEnabled: true,
  });

  // Modal / Drawer Selection States
  const [viewUserDetail, setViewUserDetail] = useState<any | null>(null);
  const [assignModalShipment, setAssignModalShipment] = useState<Shipment | null>(null);
  const [selectedOperatorForAssign, setSelectedOperatorForAssign] = useState<string>('usr-3');
  const [roleChangeUser, setRoleChangeUser] = useState<any | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('Customer');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [actionSuccessBanner, setActionSuccessBanner] = useState<string | null>(null);

  // Search & Filter States
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        if (data.escalations) setEscalations(data.escalations);
        if (data.businessApprovals) setBusinessApprovals(data.businessApprovals);
        if (data.platformSettings) setPlatformSettings(data.platformSettings);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
    } catch (e) {
      console.warn('Backend admin sync fallback');
    }
  };

  const showBanner = (msg: string) => {
    setActionSuccessBanner(msg);
    setTimeout(() => setActionSuccessBanner(null), 4000);
  };

  const logAuditAction = (action: string, target: string, previousValue: string, newValue: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const log = {
      id: `aud-${Date.now()}`,
      adminName: currentUser?.name || 'Rajesh Admin',
      adminEmail: currentUser?.email || 'admin@shiptrack.in',
      action,
      target,
      previousValue,
      newValue,
      ipAddress: '10.0.1.10',
      timestamp: now,
    };
    setAuditLogs(prev => [log, ...prev]);

    fetch('/api/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    }).catch(() => {});
  };

  // --- USER PROFILE ACTIONS ---
  const handleConfirmRoleChange = async () => {
    if (!roleChangeUser) return;

    const prevRole = roleChangeUser.role;
    try {
      await fetch(`/api/admin/users/${roleChangeUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newRole: newSelectedRole,
          adminName: currentUser?.name || 'Administrator',
          reason: roleChangeReason || 'Administrative role re-assignment',
        }),
      });
    } catch (err) {}

    setUserList(prev => prev.map(u => u.id === roleChangeUser.id ? { ...u, role: newSelectedRole } : u));
    if (viewUserDetail && viewUserDetail.id === roleChangeUser.id) {
      setViewUserDetail({ ...viewUserDetail, role: newSelectedRole });
    }

    logAuditAction(
      'User Role Escalation / Modification',
      `${roleChangeUser.name} (${roleChangeUser.email})`,
      prevRole,
      newSelectedRole
    );

    showBanner(`Role for ${roleChangeUser.name} updated to ${newSelectedRole}. Audit log generated.`);

    if (roleChangeUser.email === currentUser?.email && onRoleChange) {
      onRoleChange(newSelectedRole);
    }

    setRoleChangeUser(null);
    setRoleChangeReason('');
  };

  const handleUserStatusChange = (userId: string, newStatus: string) => {
    const u = userList.find(x => x.id === userId);
    if (!u) return;

    const prevStatus = u.status;
    setUserList(prev => prev.map(x => x.id === userId ? { ...x, status: newStatus } : x));
    if (viewUserDetail && viewUserDetail.id === userId) {
      setViewUserDetail({ ...viewUserDetail, status: newStatus });
    }

    logAuditAction(
      `User Account Status Set to ${newStatus}`,
      `${u.name} (${u.email})`,
      prevStatus,
      newStatus
    );

    showBanner(`User ${u.name} status updated to ${newStatus}.`);
  };

  // --- DISPATCH ASSIGNMENT ---
  const handleConfirmAssignOperator = async () => {
    if (!assignModalShipment) return;

    const chosenOp = userList.find(u => u.id === selectedOperatorForAssign) || {
      id: 'usr-3',
      name: 'Rajesh Verma',
    };

    try {
      await fetch(`/api/shipments/${assignModalShipment.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: chosenOp.id,
          operatorName: chosenOp.name,
          assignedBy: currentUser?.name || 'Administrator',
        }),
      });
    } catch (err) {}

    showBanner(`Successfully assigned Shipment #${assignModalShipment.trackingNumber} to ${chosenOp.name}.`);
    logAuditAction(
      'Assigned Shipment Operator',
      `Shipment #${assignModalShipment.trackingNumber}`,
      assignModalShipment.assignedOperatorName || 'Unassigned',
      chosenOp.name
    );

    if (onRefreshData) onRefreshData();
    setAssignModalShipment(null);
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = shipments.map(s => ({
      TrackingNumber: s.trackingNumber,
      Customer: s.receiverName,
      Sender: s.senderName,
      Status: s.status,
      DispatchStatus: s.dispatchStatus || 'Unassigned',
      Operator: s.assignedOperatorName || 'Unassigned',
      Priority: s.priority,
      DeclaredValueUSD: s.declaredValueUsd,
      CreatedAt: s.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Platform Shipments");
    XLSX.writeFile(workbook, `ShipTrack_Platform_Shipments_${Date.now()}.xlsx`);
    showBanner('Shipments workbook (.xlsx) exported successfully.');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ShipTrack Pro - Control Tower Audit Ledger", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated by: ${currentUser?.name || 'Administrator'} | ${new Date().toLocaleString()}`, 14, 28);
    
    let y = 40;
    shipments.slice(0, 15).forEach((s, idx) => {
      doc.text(`${idx + 1}. #${s.trackingNumber} | ${s.senderName} -> ${s.receiverName} | Status: ${s.status}`, 14, y);
      y += 8;
    });

    doc.save(`ShipTrack_Audit_Report_${Date.now()}.pdf`);
    showBanner('Executive Audit PDF exported.');
  };

  // Helper filters for role views
  const getRoleUsers = (roleName: string) => {
    return userList.filter(u => u.role === roleName && (
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.companyName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.vehicle || '').toLowerCase().includes(userSearchTerm.toLowerCase())
    ));
  };

  const customersList = getRoleUsers('Customer');
  const businessClientsList = getRoleUsers('Business Client');
  const operatorsList = getRoleUsers('Logistics Operator');
  const supportAgentsList = getRoleUsers('Support Agent');

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = 
      s.trackingNumber.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.senderName.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
      (s.assignedOperatorName || '').toLowerCase().includes(shipmentSearch.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesAssignment = assignmentFilter === 'ALL' || (s.dispatchStatus || 'Unassigned') === assignmentFilter;
    const matchesPriority = priorityFilter === 'ALL' || s.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesAssignment && matchesPriority;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* ACTION BANNER */}
      {actionSuccessBanner && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-medium animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessBanner}</span>
          </div>
          <button onClick={() => setActionSuccessBanner(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONTROL TOWER MAIN HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Control Tower</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADMINISTRATOR ROLE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized command over customers, business clients, logistics operators, support desk agents, and platform settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>Audit PDF</span>
            </button>
            <button
              onClick={() => {
                if (onRefreshData) onRefreshData();
                fetchAdminData();
                showBanner('Control Tower synchronized live data from server.');
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync System</span>
            </button>
          </div>
        </div>

        {/* DISTINCT SUB-TAB NAVIGATION */}
        <div className="pt-4 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'dashboard', label: 'Command Center', icon: Activity },
            { id: 'shipments', label: 'Global Shipments', icon: Package },
            { id: 'customers', label: 'Customers List', icon: Users, badge: customersList.length },
            { id: 'business_clients', label: 'Business Clients List', icon: Building, badge: businessClientsList.length },
            { id: 'operators', label: 'Logistics Operators List', icon: Truck, badge: operatorsList.length },
            { id: 'agents', label: 'Support Agents List', icon: Headphones, badge: supportAgentsList.length },
            { id: 'business_approvals', label: 'Business Approvals', icon: Briefcase, badge: businessApprovals.filter(b => b.status === 'Pending Approval').length },
            { id: 'escalations', label: 'Escalation Center', icon: ShieldAlert, badge: escalations.filter(e => e.status === 'Open' || e.status === 'Under Review').length },
            { id: 'analytics', label: 'Analytics & SLA', icon: BarChart2 },
            { id: 'reports', label: 'Executive Audit Center', icon: FileText },
            { id: 'map', label: 'Global GPS Map', icon: MapIcon },
            { id: 'system', label: 'System Health', icon: Server },
            { id: 'audit', label: 'Audit Trail', icon: FileSpreadsheet },
            { id: 'notifications', label: 'Alerts', icon: Bell },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== 1. COMMAND CENTER DASHBOARD ==================== */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {[
              { title: 'Customers', value: userList.filter(u => u.role === 'Customer').length, icon: Users, tab: 'customers', color: 'from-cyan-600 to-blue-600' },
              { title: 'Business Clients', value: userList.filter(u => u.role === 'Business Client').length, icon: Building, tab: 'business_clients', color: 'from-indigo-600 to-purple-600' },
              { title: 'Logistics Operators', value: userList.filter(u => u.role === 'Logistics Operator').length, icon: Truck, tab: 'operators', color: 'from-amber-600 to-orange-600' },
              { title: 'Support Agents', value: userList.filter(u => u.role === 'Support Agent').length, icon: Headphones, tab: 'agents', color: 'from-teal-600 to-emerald-600' },
              { title: 'Total Shipments', value: shipments.length, icon: Package, tab: 'shipments', color: 'from-blue-600 to-cyan-600' },
              { title: 'Pending Escalations', value: escalations.filter(e => e.status === 'Open' || e.status === 'Under Review').length, icon: ShieldAlert, tab: 'escalations', color: 'from-rose-600 to-red-600' },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSubTab(kpi.tab as any)}
                  className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400 truncate">{kpi.title}</span>
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-xl font-black text-white">{kpi.value}</div>
                  <div className="mt-1 text-[10px] text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                    <span>Manage List</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Unassigned Shipments & Operator Dispatch</h3>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono">
                  {shipments.filter(s => (s.dispatchStatus || 'Unassigned') === 'Unassigned').length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {shipments.filter(s => (s.dispatchStatus || 'Unassigned') === 'Unassigned').length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-850 rounded-xl border border-dashed border-slate-800">
                    All current platform shipments are assigned to active operators.
                  </div>
                ) : (
                  shipments.filter(s => (s.dispatchStatus || 'Unassigned') === 'Unassigned').slice(0, 4).map((s) => (
                    <div key={s.id} className="p-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-400">#{s.trackingNumber}</span>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-semibold">{s.priority}</span>
                          <span className="text-xs text-white font-medium">{s.senderName} → {s.receiverName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Origin: {s.senderAddress.city} | Created: {s.createdAt} | Value: ${s.declaredValueUsd}
                        </p>
                      </div>

                      <button
                        onClick={() => setAssignModalShipment(s)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Assign Operator</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Critical Escalations</h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('escalations')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer"
                >
                  View All ({escalations.length})
                </button>
              </div>

              <div className="space-y-3">
                {escalations.slice(0, 3).map((esc) => (
                  <div
                    key={esc.id}
                    onClick={() => {
                      setSelectedEscalation(esc);
                      setActiveSubTab('escalations');
                    }}
                    className="p-3 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-rose-400">#{esc.trackingNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                        {esc.status}
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium truncate">{esc.issueType}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{esc.complaintDetails}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. GLOBAL SHIPMENT MONITORING ==================== */}
      {activeSubTab === 'shipments' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Shipment, Customer, Operator..."
                  value={shipmentSearch}
                  onChange={(e) => setShipmentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Shipment Statuses</option>
                  <option value="Created">Created</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed Delivery">Failed Delivery</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Assignment Statuses</option>
                  <option value="Unassigned">Unassigned</option>
                  <option value="Pending Acceptance">Pending Acceptance</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tracking #</th>
                    <th className="py-3 px-4">Recipient Customer</th>
                    <th className="py-3 px-4">Origin / Destination</th>
                    <th className="py-3 px-4">Assigned Operator</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">#{s.trackingNumber}</td>
                      <td className="py-3 px-4 font-medium text-white">{s.receiverName}</td>
                      <td className="py-3 px-4 text-slate-300">{s.senderAddress.city} → {s.receiverAddress.city}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {s.assignedOperatorName || <span className="text-amber-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                          s.status === 'Cancelled' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">{s.priority}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono">${s.declaredValueUsd}</td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setAssignModalShipment(s)}
                          className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Assign Operator
                        </button>
                        {onSelectShipmentToTrack && (
                          <button
                            onClick={() => onSelectShipmentToTrack(s)}
                            className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition cursor-pointer"
                          >
                            Inspect
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. SEPARATE CUSTOMERS LIST ==================== */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Customer Directory ({customersList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registered retail customers. Click on any profile to view full details, package history, and spending logs.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email & Phone</th>
                    <th className="py-3 px-4">Loyalty Tier</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customersList.map((cust) => (
                    <tr 
                      key={cust.id} 
                      onClick={() => setViewUserDetail(cust)}
                      className="hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{cust.id}</td>
                      <td className="py-3 px-4 font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cyan-600/30 text-cyan-300 font-bold flex items-center justify-center text-xs border border-cyan-500/30">
                          {cust.name.charAt(0)}
                        </div>
                        <span>{cust.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div>{cust.email}</div>
                        <div className="text-[10px] text-slate-400">{cust.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {cust.loyaltyTier || 'Standard'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold font-mono">{cust.totalSpent || '$0'}</td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">{cust.totalShipments} Orders</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cust.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewUserDetail(cust);
                          }}
                          className="px-3 py-1 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 float-right"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. SEPARATE BUSINESS CLIENTS LIST ==================== */}
      {activeSubTab === 'business_clients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                <span>Business Clients Directory ({businessClientsList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enterprise B2B clients with API access, corporate freight contracts, and GSTIN/EIN registrations.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business clients..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Client ID</th>
                    <th className="py-3 px-4">Company & Contact</th>
                    <th className="py-3 px-4">Tax ID / GSTIN</th>
                    <th className="py-3 px-4">Enterprise Tier</th>
                    <th className="py-3 px-4">Monthly Freight</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {businessClientsList.map((biz) => (
                    <tr 
                      key={biz.id} 
                      onClick={() => setViewUserDetail(biz)}
                      className="hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-purple-400 font-bold">{biz.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-purple-300 transition">{biz.companyName || biz.name}</div>
                        <div className="text-[10px] text-slate-400">Contact: {biz.name} ({biz.email})</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono font-medium">{biz.taxId || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {biz.tier || 'Enterprise Tier'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">{biz.monthlyFreightVol || '200+ Tons'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          biz.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {biz.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewUserDetail(biz);
                          }}
                          className="px-3 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 float-right"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. SEPARATE LOGISTICS OPERATORS LIST ==================== */}
      {activeSubTab === 'operators' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>Logistics Operators Directory ({operatorsList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active drivers, fleet captains, and heavy freight haulers with real-time GPS tracking and duty status.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search drivers/operators..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Operator ID</th>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Assigned Vehicle</th>
                    <th className="py-3 px-4">License #</th>
                    <th className="py-3 px-4">Duty Status</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Delivered Count</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {operatorsList.map((op) => (
                    <tr 
                      key={op.id} 
                      onClick={() => setViewUserDetail(op)}
                      className="hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-amber-400 font-bold">{op.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-amber-300 transition">{op.name}</div>
                        <div className="text-[10px] text-slate-400">{op.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{op.vehicle || 'Standard Truck'}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{op.licenseNo || 'MH-1234567'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          op.dutyStatus?.includes('On Duty') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {op.dutyStatus || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{op.rating || '4.9'}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">{op.totalShipments} Packages</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewUserDetail(op);
                          }}
                          className="px-3 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 float-right"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. SEPARATE SUPPORT AGENTS LIST ==================== */}
      {activeSubTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-teal-400" />
                <span>Support Agents Directory ({supportAgentsList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Support desk personnel handling package lookup, proof-of-delivery verification, and customer claims.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search support agents..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Agent Code</th>
                    <th className="py-3 px-4">Agent Name</th>
                    <th className="py-3 px-4">Assigned Support Desk</th>
                    <th className="py-3 px-4">Shift Schedule</th>
                    <th className="py-3 px-4">Resolved Tickets</th>
                    <th className="py-3 px-4">Avg Handling Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {supportAgentsList.map((agent) => (
                    <tr 
                      key={agent.id} 
                      onClick={() => setViewUserDetail(agent)}
                      className="hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-teal-400 font-bold">{agent.agentCode || agent.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-teal-300 transition">{agent.name}</div>
                        <div className="text-[10px] text-slate-400">{agent.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{agent.desk || 'Tier-1 Package Lookup'}</td>
                      <td className="py-3 px-4 text-slate-400">{agent.shift || 'Morning Shift'}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold font-mono">{agent.resolvedTickets || 140} Resolved</td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">{agent.avgHandlingMins || '6 mins'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewUserDetail(agent);
                          }}
                          className="px-3 py-1 bg-teal-600/80 hover:bg-teal-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 float-right"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 7. BUSINESS APPROVALS ==================== */}
      {activeSubTab === 'business_approvals' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white">Business Client Enterprise Onboarding Approvals</h3>
            <p className="text-xs text-slate-400">
              Audit corporate GSTIN / EIN tax certificates and provision high-volume API keys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessApprovals.map((b) => (
              <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-400 font-bold">{b.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                    b.status === 'Pending Approval' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{b.companyName}</h4>
                  <p className="text-xs text-slate-400">{b.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-850 rounded-xl text-xs text-slate-300">
                  <div><span className="text-slate-500">Tax ID:</span> <span className="font-mono">{b.taxId}</span></div>
                  <div><span className="text-slate-500">Industry:</span> {b.industry}</div>
                  <div><span className="text-slate-500">Contact:</span> {b.contactPerson}</div>
                  <div><span className="text-slate-500">Tier:</span> {b.tier}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  {b.status === 'Pending Approval' && (
                    <>
                      <button
                        onClick={() => {
                          setBusinessApprovals(prev => prev.map(x => x.id === b.id ? { ...x, status: 'Approved' } : x));
                          showBanner(`Approved enterprise onboarding for ${b.companyName}`);
                          logAuditAction('Approved Business Application', b.companyName, 'Pending', 'Approved');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Approve Enterprise Account
                      </button>
                      <button
                        onClick={() => {
                          setBusinessApprovals(prev => prev.map(x => x.id === b.id ? { ...x, status: 'Rejected' } : x));
                          showBanner(`Rejected onboarding for ${b.companyName}`);
                          logAuditAction('Rejected Business Application', b.companyName, 'Pending', 'Rejected');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === 'Approved' && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Fully Verified & Provisioned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 8. ESCALATION CENTER ==================== */}
      {activeSubTab === 'escalations' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Dispute & Escalation Resolution Center</h3>
              <p className="text-xs text-slate-400">Review disputed POD signatures, damage claims, and customer appeals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escalations.map((esc) => (
              <div key={esc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-400">#{esc.trackingNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    esc.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {esc.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{esc.issueType}</h4>
                <p className="text-xs text-slate-300">{esc.complaintDetails}</p>

                <div className="p-3 bg-slate-850 rounded-xl text-xs space-y-1 text-slate-300">
                  <div><span className="text-slate-500">Customer:</span> {esc.customerName}</div>
                  <div><span className="text-slate-500">Operator:</span> {esc.operatorName}</div>
                  <div><span className="text-slate-500">Agent Recommendation:</span> {esc.agentDecision}</div>
                </div>

                {esc.status !== 'Resolved' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEscalations(prev => prev.map(e => e.id === esc.id ? { ...e, status: 'Resolved' } : e));
                        showBanner(`Escalation #${esc.id} resolved by Administrator.`);
                        logAuditAction('Resolved Escalation', `Shipment #${esc.trackingNumber}`, esc.status, 'Resolved');
                      }}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Resolve & Authorize Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 9. ANALYTICS & SLA ==================== */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2">Platform Operational SLA Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">On-Time Delivery SLA</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">98.4%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">+0.8% vs target</p>
              </div>
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Average Transit Duration</span>
                <p className="text-2xl font-bold text-blue-400 mt-1">28.2 Hours</p>
                <p className="text-[10px] text-slate-500 mt-0.5">-2.1 hrs vs last week</p>
              </div>
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">POD Signature Compliance</span>
                <p className="text-2xl font-bold text-purple-400 mt-1">99.8%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Verified electronically</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 10. EXECUTIVE AUDIT CENTER (REPORTS) ==================== */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Executive Audit Center
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Reports & Multi-Format Export Module
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generate formal executive PDFs, formatted Excel workbooks (.xlsx), and raw CSV logs across 5 core operational dimensions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="text-sm font-bold text-white">Shipment Manifest Ledger</h4>
              <p className="text-xs text-slate-400">Complete audit log of created, transit, and delivered freight parcels.</p>
              <button onClick={handleExportCSV} className="text-xs text-blue-400 font-bold hover:underline cursor-pointer">Generate Manifest Export →</button>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="text-sm font-bold text-white">Proof of Delivery (POD) Ledger</h4>
              <p className="text-xs text-slate-400">Verified signatures, signee details, and photo proof audit trail.</p>
              <button onClick={handleExportPDF} className="text-xs text-blue-400 font-bold hover:underline cursor-pointer">Generate POD Ledger PDF →</button>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="text-sm font-bold text-white">Driver & Fleet SLA Ledger</h4>
              <p className="text-xs text-slate-400">Operator performance ratings, corridor times, and fuel scores.</p>
              <button onClick={handleExportCSV} className="text-xs text-blue-400 font-bold hover:underline cursor-pointer">Export Operator SLA Sheet →</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 11. GLOBAL GPS MAP ==================== */}
      {activeSubTab === 'map' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-400" />
              <span>Global GPS Live Fleet Map</span>
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {shipments.length} Active Shipments Tracked Live
            </span>
          </div>

          <InteractiveMap 
            allShipments={shipments} 
            onSelectShipment={(s) => {
              if (onSelectShipmentToTrack) {
                onSelectShipmentToTrack(s);
              }
            }} 
            isExpanded={true}
          />
        </div>
      )}

      {/* ==================== 12. SYSTEM HEALTH ==================== */}
      {activeSubTab === 'system' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white">System Infrastructure Health</h3>
            <p className="text-xs text-slate-400 mt-0.5">Express API Server, PostgreSQL engine, and GIS Telemetry connections.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">API Latency</span>
                <p className="text-lg font-bold text-emerald-400">24 ms</p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Uptime</span>
                <p className="text-lg font-bold text-blue-400">99.99%</p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Database Pool</span>
                <p className="text-lg font-bold text-purple-400">22 / 50 Active</p>
              </div>
              <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">Error Rate</span>
                <p className="text-lg font-bold text-emerald-400">0.01%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 13. AUDIT TRAIL ==================== */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white">Immutable Platform Audit Trail</h3>
            <p className="text-xs text-slate-400">Security logs of role escalations, dispatches, and administrative decisions.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Previous State</th>
                    <th className="py-3 px-4">New State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">{a.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-white">{a.adminName}</td>
                      <td className="py-3 px-4 text-blue-400 font-medium">{a.action}</td>
                      <td className="py-3 px-4 text-slate-300">{a.target}</td>
                      <td className="py-3 px-4 text-slate-400 italic">{a.previousValue}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{a.newValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 14. ALERTS ==================== */}
      {activeSubTab === 'notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Platform System Alerts & Dispatch Logs</h3>
          <div className="space-y-2">
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">Operator Rajesh Verma dispatched for Shipment #STP-9482-IN</span>
              <span className="text-slate-500">10 mins ago</span>
            </div>
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">Business Client Flipkart Internet approved for Enterprise Tier</span>
              <span className="text-slate-500">2 hours ago</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 15. SETTINGS ==================== */}
      {activeSubTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl">
          <h3 className="text-base font-bold text-white">Control Tower Configuration</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Platform Name</label>
              <input 
                type="text" 
                value={platformSettings.platformName} 
                onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Timezone</label>
              <input 
                type="text" 
                value={platformSettings.timezone} 
                onChange={(e) => setPlatformSettings({ ...platformSettings, timezone: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white" 
              />
            </div>

            <button
              onClick={() => showBanner('Platform configuration saved.')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* ==================== USER DETAIL PROFILE MODAL / DRAWER ==================== */}
      {viewUserDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative text-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {viewUserDetail.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{viewUserDetail.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      viewUserDetail.role === 'Administrator' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      viewUserDetail.role === 'Business Client' ? 'bg-blue-500/20 text-blue-300' :
                      viewUserDetail.role === 'Logistics Operator' ? 'bg-amber-500/20 text-amber-300' :
                      viewUserDetail.role === 'Support Agent' ? 'bg-teal-500/20 text-teal-300' :
                      'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {viewUserDetail.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      viewUserDetail.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {viewUserDetail.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    User ID: {viewUserDetail.id} | Registered: {viewUserDetail.regDate || '2026-06-12'} | Last Active: {viewUserDetail.lastActive || 'Just now'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setViewUserDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 mb-2">Contact & Location Information</h4>
                <div><span className="text-slate-500">Email Address:</span> <span className="text-white font-medium">{viewUserDetail.email}</span></div>
                <div><span className="text-slate-500">Phone Number:</span> <span className="text-white font-medium">{viewUserDetail.phone}</span></div>
                <div><span className="text-slate-500">Address / Hub:</span> <span className="text-white font-medium">{viewUserDetail.address || viewUserDetail.homeHub || 'Main Hub'}</span></div>
              </div>

              {/* Role-Specific Details */}
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Role Credentials ({viewUserDetail.role})
                </h4>

                {viewUserDetail.role === 'Customer' && (
                  <>
                    <div><span className="text-slate-500">Loyalty Tier:</span> <span className="text-amber-400 font-bold">{viewUserDetail.loyaltyTier || 'Gold Elite'}</span></div>
                    <div><span className="text-slate-500">Total Spend:</span> <span className="text-emerald-400 font-bold font-mono">{viewUserDetail.totalSpent || '$12,450'}</span></div>
                    <div><span className="text-slate-500">Total Orders:</span> <span className="text-white font-bold">{viewUserDetail.totalShipments} Orders</span></div>
                    <div><span className="text-slate-500">Active Orders:</span> <span className="text-cyan-300 font-bold">{viewUserDetail.activeOrders || 0} Orders</span></div>
                  </>
                )}

                {viewUserDetail.role === 'Business Client' && (
                  <>
                    <div><span className="text-slate-500">Company Name:</span> <span className="text-white font-bold">{viewUserDetail.companyName}</span></div>
                    <div><span className="text-slate-500">Tax ID (GSTIN/EIN):</span> <span className="text-purple-300 font-mono font-bold">{viewUserDetail.taxId || '27AAACR1234F1ZV'}</span></div>
                    <div><span className="text-slate-500">Enterprise Tier:</span> <span className="text-indigo-300 font-bold">{viewUserDetail.tier || 'Enterprise VIP'}</span></div>
                    <div><span className="text-slate-500">Monthly Freight:</span> <span className="text-emerald-400 font-bold">{viewUserDetail.monthlyFreightVol || '450 Tons'}</span></div>
                    <div><span className="text-slate-500">Account Manager:</span> <span className="text-white">{viewUserDetail.accountManager || 'Vikram Malhotra'}</span></div>
                  </>
                )}

                {viewUserDetail.role === 'Logistics Operator' && (
                  <>
                    <div><span className="text-slate-500">Assigned Vehicle:</span> <span className="text-amber-300 font-bold">{viewUserDetail.vehicle || 'Mahindra Freight Truck #402'}</span></div>
                    <div><span className="text-slate-500">Driver License #:</span> <span className="text-white font-mono">{viewUserDetail.licenseNo || 'DL-1420210082910'}</span></div>
                    <div><span className="text-slate-500">Safety Rating:</span> <span className="text-amber-400 font-bold">★ {viewUserDetail.rating || '4.9'} / 5.0</span></div>
                    <div><span className="text-slate-500">Duty Status:</span> <span className="text-emerald-400 font-bold">{viewUserDetail.dutyStatus || 'On Duty'}</span></div>
                    <div><span className="text-slate-500">Assigned Route:</span> <span className="text-white">{viewUserDetail.assignedRoute || 'Mumbai -> Delhi'}</span></div>
                    <div><span className="text-slate-500">On-time Delivery SLA:</span> <span className="text-emerald-400 font-bold">{viewUserDetail.onTimeSlaPct || '99.2%'}</span></div>
                  </>
                )}

                {viewUserDetail.role === 'Support Agent' && (
                  <>
                    <div><span className="text-slate-500">Agent Code:</span> <span className="text-teal-300 font-mono font-bold">{viewUserDetail.agentCode || 'AGT-901'}</span></div>
                    <div><span className="text-slate-500">Support Desk:</span> <span className="text-white font-medium">{viewUserDetail.desk || 'Tier-2 Escalations Desk'}</span></div>
                    <div><span className="text-slate-500">Shift Schedule:</span> <span className="text-white">{viewUserDetail.shift || 'Morning Shift'}</span></div>
                    <div><span className="text-slate-500">Resolved Escalations:</span> <span className="text-emerald-400 font-bold">{viewUserDetail.resolvedTickets || 142} Tickets</span></div>
                    <div><span className="text-slate-500">Avg Handling Time:</span> <span className="text-white">{viewUserDetail.avgHandlingMins || '8.4 mins'}</span></div>
                  </>
                )}

                {viewUserDetail.role === 'Administrator' && (
                  <>
                    <div><span className="text-slate-500">Privileges:</span> <span className="text-purple-300 font-bold">Full Platform Root Control</span></div>
                    <div><span className="text-slate-500">System Access:</span> <span className="text-emerald-400 font-bold">Verified Administrator</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Associated Shipments List for this User */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Associated Shipments ({shipments.filter(s => 
                  s.receiverName === viewUserDetail.name || 
                  s.senderName === viewUserDetail.name || 
                  s.assignedOperatorName === viewUserDetail.name
                ).length})
              </h4>

              <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-2 px-3">Tracking #</th>
                      <th className="py-2 px-3">Sender / Recipient</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {shipments.filter(s => 
                      s.receiverName === viewUserDetail.name || 
                      s.senderName === viewUserDetail.name || 
                      s.assignedOperatorName === viewUserDetail.name
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                          No active shipments currently associated with this user.
                        </td>
                      </tr>
                    ) : (
                      shipments.filter(s => 
                        s.receiverName === viewUserDetail.name || 
                        s.senderName === viewUserDetail.name || 
                        s.assignedOperatorName === viewUserDetail.name
                      ).map(s => (
                        <tr key={s.id} className="hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-mono text-blue-400 font-bold">#{s.trackingNumber}</td>
                          <td className="py-2 px-3 text-slate-200">{s.senderName} → {s.receiverName}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {onSelectShipmentToTrack && (
                              <button
                                onClick={() => {
                                  setViewUserDetail(null);
                                  onSelectShipmentToTrack(s);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Inspect
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRoleChangeUser(viewUserDetail);
                    setNewSelectedRole(viewUserDetail.role);
                  }}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Modify User Role</span>
                </button>

                {viewUserDetail.status === 'Active' ? (
                  <button
                    onClick={() => handleUserStatusChange(viewUserDetail.id, 'Suspended')}
                    className="px-3.5 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspend Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUserStatusChange(viewUserDetail.id, 'Active')}
                    className="px-3.5 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Activate Account</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setViewUserDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OPERATOR ASSIGNMENT MODAL */}
      {assignModalShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Assign Driver / Operator</h3>
            <p className="text-xs text-slate-400">
              Select an active operator to dispatch for Shipment <span className="text-blue-400 font-mono font-bold">#{assignModalShipment.trackingNumber}</span>.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block font-semibold">Select Active Operator:</label>
              <select
                value={selectedOperatorForAssign}
                onChange={(e) => setSelectedOperatorForAssign(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                {userList.filter(u => u.role === 'Logistics Operator').map(op => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.vehicle || 'Truck'}) - ★ {op.rating || '4.9'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setAssignModalShipment(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignOperator}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE CHANGE CONFIRMATION MODAL */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Modify User Role Privileges</h3>
            <p className="text-xs text-slate-400">
              Changing role for <span className="text-white font-bold">{roleChangeUser.name}</span> ({roleChangeUser.email}).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Select Target Role:</label>
                <select
                  value={newSelectedRole}
                  onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Customer">Customer</option>
                  <option value="Business Client">Business Client</option>
                  <option value="Logistics Operator">Logistics Operator</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Audit Reason / Justification:</label>
                <input
                  type="text"
                  placeholder="e.g. Approved corporate promotion or desk assignment"
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRoleChangeUser(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
              >
                Confirm Privilege Change
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
