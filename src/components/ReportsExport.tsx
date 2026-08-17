import React, { useState } from 'react';
import { Shipment } from '../types';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck,
  Package,
  Truck,
  AlertTriangle,
  Compass,
  Building2,
  Layers,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  TrendingUp,
  Share2,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ReportsExportProps {
  shipments: Shipment[];
}

export type ReportCategory = 'shipments' | 'delivery' | 'routes' | 'delays' | 'logistics';

export const ReportsExport: React.FC<ReportsExportProps> = ({ shipments }) => {
  const [activeReportCategory, setActiveReportCategory] = useState<ReportCategory>('shipments');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-25');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 1. Mock/Calculated Data for Route Performance Reports
  const routePerformanceData = [
    { corridor: 'San Francisco (SFO) -> New York (JFK)', corridorId: 'COR-801', distanceKm: 4120, avgSpeedKmh: 78, slaCompliancePct: 98.4, totalVolume: 1420, avgTransitHours: 28.5, status: 'Optimal' },
    { corridor: 'Los Angeles (LAX) -> Chicago (ORD)', corridorId: 'COR-402', distanceKm: 3240, avgSpeedKmh: 72, slaCompliancePct: 96.2, totalVolume: 980, avgTransitHours: 32.0, status: 'Minor Delays' },
    { corridor: 'Seattle (SEA) -> Dallas (DFW)', corridorId: 'COR-309', distanceKm: 3350, avgSpeedKmh: 81, slaCompliancePct: 97.8, totalVolume: 750, avgTransitHours: 26.2, status: 'Optimal' },
    { corridor: 'Miami (MIA) -> Atlanta (ATL)', corridorId: 'COR-105', distanceKm: 1060, avgSpeedKmh: 68, slaCompliancePct: 94.1, totalVolume: 1120, avgTransitHours: 14.8, status: 'Congested' },
    { corridor: 'Frankfurt (FRA) -> London (LHR)', corridorId: 'COR-902', distanceKm: 780, avgSpeedKmh: 65, slaCompliancePct: 92.5, totalVolume: 620, avgTransitHours: 18.0, status: 'Customs Hold' },
  ];

  // 2. Mock/Calculated Data for Delay Analysis Reports
  const delayAnalysisData = [
    { incidentId: 'INC-9041', trackingNumber: 'STP-9482-US', rootCause: 'Severe Storm / Front Invalidation', location: 'Omaha Hub, NE', riskLevel: 'High', delayHours: 4.5, impactCount: 42, status: 'Rerouted' },
    { incidentId: 'INC-8812', trackingNumber: 'STP-8829-US', rootCause: 'Interstate I-80 Lane Closure', location: 'Des Moines, IA', riskLevel: 'Medium', delayHours: 2.0, impactCount: 18, status: 'Mitigated' },
    { incidentId: 'INC-7420', trackingNumber: 'STP-3021-EU', rootCause: 'Customs Clearance Document Review', location: 'Frankfurt Airport', riskLevel: 'High', delayHours: 12.0, impactCount: 85, status: 'Pending Review' },
    { incidentId: 'INC-6105', trackingNumber: 'STP-1049-US', rootCause: 'Recipient Address Variance', location: 'Las Vegas, NV', riskLevel: 'Low', delayHours: 1.5, impactCount: 1, status: 'Address Updated' },
  ];

  // 3. Mock/Calculated Data for Logistics Reports
  const logisticsData = [
    { fleetId: 'TRK-104', vehicleType: 'Semi-Trailer Heavy Class', driverName: 'Carlos Mendez', hubLocation: 'West Coast Hub (SFO)', capacityUtilPct: 94, fuelEfficiency: '28.4 L/100km', carbonScore: 'A-', status: 'Active In-Transit' },
    { fleetId: 'VAN-208', vehicleType: 'EV Delivery Sprinter', driverName: 'Elena Rostova', hubLocation: 'Central Hub (ORD)', capacityUtilPct: 88, fuelEfficiency: '18.2 kWh/100km', carbonScore: 'A+', status: 'Out for Delivery' },
    { fleetId: 'TRK-302', vehicleType: 'Refrigerated Cold-Chain Truck', driverName: 'Marcus Vance', hubLocation: 'East Coast Hub (JFK)', capacityUtilPct: 91, fuelEfficiency: '31.0 L/100km', carbonScore: 'B+', status: 'Cross-Dock Loading' },
    { fleetId: 'VAN-412', vehicleType: 'Cargo Express Fleet', driverName: 'Sarah Jenkins', hubLocation: 'Southern Hub (DFW)', capacityUtilPct: 76, fuelEfficiency: '22.1 L/100km', carbonScore: 'A', status: 'Maintenance Service' },
  ];

  // Filtered Shipments for Shipment & Delivery Reports
  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'All' || s.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Export PDF Handler using jsPDF
  const handleExportPDF = () => {
    setExportNotice(`Compiling PDF Report for ${getReportTitle()}...`);
    
    setTimeout(() => {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 23, 42); // Slate-900
      doc.rect(0, 0, 210, 36, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ShipTrack Pro Logistics Ledger', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Official Executive Export: ${getReportTitle()} | Period: ${startDate} to ${endDate}`, 14, 28);

      // Section Title & KPI Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Report Module: ${getReportTitle()}`, 14, 48);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated by: System Operator | Total System Audit Records: ${getRecordCount()}`, 14, 55);

      let y = 68;

      // Render Dynamic Columns based on Category
      if (activeReportCategory === 'shipments') {
        doc.setFont('helvetica', 'bold');
        doc.text('Tracking #', 14, y);
        doc.text('Sender', 55, y);
        doc.text('Receiver', 100, y);
        doc.text('Priority', 145, y);
        doc.text('Status', 175, y);

        doc.setDrawColor(203, 213, 225);
        doc.line(14, y + 2, 196, y + 2);
        y += 8;

        doc.setFont('helvetica', 'normal');
        filteredShipments.forEach((s) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(s.trackingNumber, 14, y);
          doc.text(s.senderName.substring(0, 18), 55, y);
          doc.text(s.receiverName.substring(0, 18), 100, y);
          doc.text(s.priority, 145, y);
          doc.text(s.status, 175, y);
          y += 7;
        });
      } else if (activeReportCategory === 'delivery') {
        doc.setFont('helvetica', 'bold');
        doc.text('Tracking #', 14, y);
        doc.text('Recipient', 55, y);
        doc.text('Delivery Status', 105, y);
        doc.text('ETA / Timestamp', 150, y);

        doc.line(14, y + 2, 196, y + 2);
        y += 8;

        doc.setFont('helvetica', 'normal');
        filteredShipments.forEach((s) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(s.trackingNumber, 14, y);
          doc.text(s.receiverName.substring(0, 22), 55, y);
          doc.text(s.status, 105, y);
          doc.text(s.proofOfDelivery?.deliveredAt || s.estimatedDeliveryTime.substring(0, 16), 150, y);
          y += 7;
        });
      } else if (activeReportCategory === 'routes') {
        doc.setFont('helvetica', 'bold');
        doc.text('Corridor Route', 14, y);
        doc.text('Distance', 90, y);
        doc.text('Avg Speed', 120, y);
        doc.text('SLA %', 150, y);
        doc.text('Status', 175, y);

        doc.line(14, y + 2, 196, y + 2);
        y += 8;

        doc.setFont('helvetica', 'normal');
        routePerformanceData.forEach((r) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(r.corridor.substring(0, 32), 14, y);
          doc.text(`${r.distanceKm} km`, 90, y);
          doc.text(`${r.avgSpeedKmh} km/h`, 120, y);
          doc.text(`${r.slaCompliancePct}%`, 150, y);
          doc.text(r.status, 175, y);
          y += 7;
        });
      } else if (activeReportCategory === 'delays') {
        doc.setFont('helvetica', 'bold');
        doc.text('Incident ID', 14, y);
        doc.text('Root Cause', 45, y);
        doc.text('Location', 110, y);
        doc.text('Risk', 155, y);
        doc.text('Status', 175, y);

        doc.line(14, y + 2, 196, y + 2);
        y += 8;

        doc.setFont('helvetica', 'normal');
        delayAnalysisData.forEach((d) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(d.incidentId, 14, y);
          doc.text(d.rootCause.substring(0, 26), 45, y);
          doc.text(d.location.substring(0, 18), 110, y);
          doc.text(d.riskLevel, 155, y);
          doc.text(d.status, 175, y);
          y += 7;
        });
      } else if (activeReportCategory === 'logistics') {
        doc.setFont('helvetica', 'bold');
        doc.text('Fleet ID', 14, y);
        doc.text('Driver Name', 45, y);
        doc.text('Hub Location', 95, y);
        doc.text('Capacity %', 145, y);
        doc.text('Status', 175, y);

        doc.line(14, y + 2, 196, y + 2);
        y += 8;

        doc.setFont('helvetica', 'normal');
        logisticsData.forEach((l) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(l.fleetId, 14, y);
          doc.text(l.driverName, 45, y);
          doc.text(l.hubLocation.substring(0, 22), 95, y);
          doc.text(`${l.capacityUtilPct}%`, 145, y);
          doc.text(l.status, 175, y);
          y += 7;
        });
      }

      doc.save(`ShipTrack_Pro_${activeReportCategory.toUpperCase()}_Report_${startDate}.pdf`);
      setExportNotice(null);
    }, 1000);
  };

  // Export Excel Handler using SheetJS (XLSX)
  const handleExportExcel = () => {
    setExportNotice(`Generating Excel Workbook (.xlsx) for ${getReportTitle()}...`);

    setTimeout(() => {
      let exportData: any[] = [];

      if (activeReportCategory === 'shipments') {
        exportData = filteredShipments.map(s => ({
          'Tracking Number': s.trackingNumber,
          'Sender Name': s.senderName,
          'Sender Address': `${s.senderAddress.street}, ${s.senderAddress.city}, ${s.senderAddress.country}`,
          'Receiver Name': s.receiverName,
          'Receiver Address': `${s.receiverAddress.street}, ${s.receiverAddress.city}, ${s.receiverAddress.country}`,
          'Status': s.status,
          'Priority': s.priority,
          'Weight (kg)': s.weightKg,
          'Estimated Delivery': s.estimatedDeliveryTime
        }));
      } else if (activeReportCategory === 'delivery') {
        exportData = filteredShipments.map(s => ({
          'Tracking Number': s.trackingNumber,
          'Recipient Name': s.receiverName,
          'Delivery Status': s.status,
          'POD Verified': s.proofOfDelivery ? 'YES' : 'NO',
          'Delivered Timestamp': s.proofOfDelivery?.deliveredAt || 'N/A',
          'Signee Name': s.proofOfDelivery?.signeeName || 'N/A',
          'Delivery Address': `${s.receiverAddress.street}, ${s.receiverAddress.city}`
        }));
      } else if (activeReportCategory === 'routes') {
        exportData = routePerformanceData.map(r => ({
          'Corridor ID': r.corridorId,
          'Route Corridor': r.corridor,
          'Distance (km)': r.distanceKm,
          'Avg Speed (km/h)': r.avgSpeedKmh,
          'SLA Compliance %': r.slaCompliancePct,
          'Monthly Package Volume': r.totalVolume,
          'Avg Transit Hours': r.avgTransitHours,
          'Route Status': r.status
        }));
      } else if (activeReportCategory === 'delays') {
        exportData = delayAnalysisData.map(d => ({
          'Incident ID': d.incidentId,
          'Associated Tracking #': d.trackingNumber,
          'Root Cause Category': d.rootCause,
          'Bottleneck Location': d.location,
          'AI Risk Rating': d.riskLevel,
          'Delay Impact (Hours)': d.delayHours,
          'Affected Packages': d.impactCount,
          'Mitigation Status': d.status
        }));
      } else if (activeReportCategory === 'logistics') {
        exportData = logisticsData.map(l => ({
          'Fleet Vehicle ID': l.fleetId,
          'Vehicle Specification': l.vehicleType,
          'Driver Officer': l.driverName,
          'Assigned Regional Hub': l.hubLocation,
          'Capacity Utilization %': l.capacityUtilPct,
          'Fuel / Power Efficiency': l.fuelEfficiency,
          'Carbon Rating': l.carbonScore,
          'Fleet Status': l.status
        }));
      }

      // Create Workbook and Sheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, getReportTitle());

      // Write File
      XLSX.writeFile(workbook, `ShipTrack_Pro_${activeReportCategory.toUpperCase()}_Ledger_${startDate}.xlsx`);
      setExportNotice(null);
    }, 1000);
  };

  // Quick Export CSV
  const handleExportCSV = () => {
    let csvHeaders: string[] = [];
    let csvRows: string[][] = [];

    if (activeReportCategory === 'shipments') {
      csvHeaders = ['Tracking Number', 'Sender', 'Receiver', 'Status', 'Priority', 'ETA'];
      csvRows = filteredShipments.map(s => [s.trackingNumber, `"${s.senderName}"`, `"${s.receiverName}"`, s.status, s.priority, s.estimatedDeliveryTime]);
    } else if (activeReportCategory === 'delivery') {
      csvHeaders = ['Tracking Number', 'Recipient', 'Delivery Status', 'Delivered At', 'Signee'];
      csvRows = filteredShipments.map(s => [s.trackingNumber, `"${s.receiverName}"`, s.status, s.proofOfDelivery?.deliveredAt || 'N/A', `"${s.proofOfDelivery?.signeeName || 'N/A'}"`]);
    } else if (activeReportCategory === 'routes') {
      csvHeaders = ['Corridor ID', 'Route Corridor', 'Distance (km)', 'Avg Speed', 'SLA %', 'Status'];
      csvRows = routePerformanceData.map(r => [r.corridorId, `"${r.corridor}"`, r.distanceKm.toString(), `${r.avgSpeedKmh} km/h`, `${r.slaCompliancePct}%`, r.status]);
    } else if (activeReportCategory === 'delays') {
      csvHeaders = ['Incident ID', 'Tracking Number', 'Root Cause', 'Location', 'Risk Level', 'Mitigation Status'];
      csvRows = delayAnalysisData.map(d => [d.incidentId, d.trackingNumber, `"${d.rootCause}"`, `"${d.location}"`, d.riskLevel, d.status]);
    } else if (activeReportCategory === 'logistics') {
      csvHeaders = ['Fleet ID', 'Vehicle Type', 'Driver', 'Hub Location', 'Capacity Util %', 'Status'];
      csvRows = logisticsData.map(l => [l.fleetId, `"${l.vehicleType}"`, `"${l.driverName}"`, `"${l.hubLocation}"`, `${l.capacityUtilPct}%`, l.status]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShipTrack_Pro_${activeReportCategory}_${startDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReportTitle = () => {
    switch (activeReportCategory) {
      case 'shipments': return 'Shipment Manifest & Service Report';
      case 'delivery': return 'Delivery Status & Proof-of-Delivery Report';
      case 'routes': return 'Corridor Route Performance Report';
      case 'delays': return 'Delay Analysis & Incident Exception Report';
      case 'logistics': return 'Logistics Fleet & Facility Overview Report';
      default: return 'Logistics Report';
    }
  };

  const getRecordCount = () => {
    switch (activeReportCategory) {
      case 'shipments': case 'delivery': return filteredShipments.length;
      case 'routes': return routePerformanceData.length;
      case 'delays': return delayAnalysisData.length;
      case 'logistics': return logisticsData.length;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header Banner */}
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

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export PDF (vi)
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel .xlsx (vii)
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Quick CSV
          </button>
        </div>
      </div>

      {/* Export Notification Toast Banner */}
      {exportNotice && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-indigo-300 text-xs font-semibold animate-fadeIn">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-indigo-400" />
          {exportNotice}
        </div>
      )}

      {/* Report Category Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { id: 'shipments', label: '(i) Shipment Reports', icon: Package, desc: 'Manifest & Priorities' },
          { id: 'delivery', label: '(ii) Delivery Reports', icon: CheckCircle2, desc: 'Status & Digital POD' },
          { id: 'routes', label: '(iii) Route Performance', icon: Compass, desc: 'Corridor & SLA Speeds' },
          { id: 'delays', label: '(iv) Delay Analysis', icon: AlertTriangle, desc: 'Exceptions & AI Risks' },
          { id: 'logistics', label: '(v) Logistics Reports', icon: Layers, desc: 'Fleet & Hub Capacity' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportCategory(tab.id as ReportCategory)}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-500/10' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                {isActive && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
              </div>
              <div>
                <span className="text-xs font-bold block">{tab.label}</span>
                <span className="text-[10px] text-slate-400 font-normal">{tab.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Search Keywords</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tracking #, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Priority Filter</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Priorities</option>
            <option value="Overnight Express">Overnight Express</option>
            <option value="Priority Air">Priority Air</option>
            <option value="Standard Ground">Standard Ground</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Start Audit Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">End Audit Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Live Dataset Report Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-0">
        
        {/* Table Top Toolbar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              {getReportTitle()} (Preview Grid)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live audit view ready for PDF (vi) and Excel (vii) export generation.
            </p>
          </div>

          <span className="px-3 py-1 bg-slate-800 text-purple-300 border border-slate-700 rounded-full font-mono text-[11px] font-bold">
            {getRecordCount()} Records Compiled
          </span>
        </div>

        {/* Dynamic Table Content per Category */}
        <div className="overflow-x-auto">
          
          {/* (i) SHIPMENT REPORTS TABLE */}
          {activeReportCategory === 'shipments' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Tracking #</th>
                  <th className="p-3">Shipper / Sender</th>
                  <th className="p-3">Consignee / Receiver</th>
                  <th className="p-3">Cargo Weight</th>
                  <th className="p-3">Service Priority</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-blue-400">{s.trackingNumber}</td>
                    <td className="p-3 font-semibold text-white">{s.senderName} ({s.senderAddress.city})</td>
                    <td className="p-3">{s.receiverName} ({s.receiverAddress.city})</td>
                    <td className="p-3 font-mono text-cyan-300">{s.weightKg} kg</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 border border-slate-700 rounded text-[10px] font-bold">
                        {s.priority}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-emerald-400">{s.status}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{s.estimatedDeliveryTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* (ii) DELIVERY REPORTS TABLE */}
          {activeReportCategory === 'delivery' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Tracking #</th>
                  <th className="p-3">Recipient Name</th>
                  <th className="p-3">Delivery Status</th>
                  <th className="p-3">Digital POD Status</th>
                  <th className="p-3">Delivered Timestamp</th>
                  <th className="p-3 text-right">Signee Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-blue-400">{s.trackingNumber}</td>
                    <td className="p-3 font-semibold text-white">{s.receiverName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {s.proofOfDelivery ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending Receipt</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{s.proofOfDelivery?.deliveredAt || s.estimatedDeliveryTime}</td>
                    <td className="p-3 text-right font-semibold text-white">{s.proofOfDelivery?.signeeName || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* (iii) ROUTE PERFORMANCE REPORTS TABLE */}
          {activeReportCategory === 'routes' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Corridor ID</th>
                  <th className="p-3">Transport Corridor Route</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Avg Speed</th>
                  <th className="p-3">Monthly Volume</th>
                  <th className="p-3">SLA Compliance %</th>
                  <th className="p-3 text-right">Route Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {routePerformanceData.map((r) => (
                  <tr key={r.corridorId} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-purple-400">{r.corridorId}</td>
                    <td className="p-3 font-semibold text-white">{r.corridor}</td>
                    <td className="p-3 font-mono text-slate-300">{r.distanceKm} km</td>
                    <td className="p-3 font-mono text-cyan-300">{r.avgSpeedKmh} km/h</td>
                    <td className="p-3 font-mono text-indigo-300">{r.totalVolume} pkgs</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{r.slaCompliancePct}%</td>
                    <td className="p-3 text-right font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* (iv) DELAY ANALYSIS REPORTS TABLE */}
          {activeReportCategory === 'delays' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Incident ID</th>
                  <th className="p-3">Associated Tracking #</th>
                  <th className="p-3">Root Cause Exception</th>
                  <th className="p-3">Bottleneck Location</th>
                  <th className="p-3">AI Delay Risk</th>
                  <th className="p-3">Delay Duration</th>
                  <th className="p-3 text-right">Mitigation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {delayAnalysisData.map((d) => (
                  <tr key={d.incidentId} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">{d.incidentId}</td>
                    <td className="p-3 font-mono text-blue-400">{d.trackingNumber}</td>
                    <td className="p-3 font-semibold text-white">{d.rootCause}</td>
                    <td className="p-3 text-slate-400">{d.location}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.riskLevel === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {d.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-cyan-300">+{d.delayHours} Hours</td>
                    <td className="p-3 text-right font-semibold text-emerald-400">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* (v) LOGISTICS REPORTS TABLE */}
          {activeReportCategory === 'logistics' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Fleet ID</th>
                  <th className="p-3">Vehicle Specification</th>
                  <th className="p-3">Assigned Driver</th>
                  <th className="p-3">Regional Hub</th>
                  <th className="p-3">Capacity Utilization</th>
                  <th className="p-3">Efficiency Index</th>
                  <th className="p-3 text-right">Fleet Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {logisticsData.map((l) => (
                  <tr key={l.fleetId} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-purple-400">{l.fleetId}</td>
                    <td className="p-3 font-semibold text-white">{l.vehicleType}</td>
                    <td className="p-3 text-slate-300">{l.driverName}</td>
                    <td className="p-3 text-slate-400">{l.hubLocation}</td>
                    <td className="p-3 font-mono font-bold text-cyan-300">{l.capacityUtilPct}%</td>
                    <td className="p-3 font-mono text-emerald-400">{l.fuelEfficiency}</td>
                    <td className="p-3 text-right font-semibold text-indigo-300">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>

    </div>
  );
};
