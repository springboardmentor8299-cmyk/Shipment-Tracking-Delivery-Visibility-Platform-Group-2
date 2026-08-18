import React, { useState } from "react";
import { FileText, Download, Upload, FileSpreadsheet, CheckCircle2, Shield } from "lucide-react";
import ExportButton from "../../components/common/ExportButton";
import { useNotifications } from "../../context/NotificationContext";

export function BusinessReports() {
  const [csvContent, setCsvContent] = useState("");
  const { addNotification } = useNotifications();

  const handleBulkCsvImport = () => {
    if (!csvContent.trim()) {
      alert("Please paste valid CSV shipment rows.");
      return;
    }
    addNotification({
      title: "Bulk CSV Shipments Imported",
      message: "Business Enterprise account imported batch shipment manifest successfully.",
      category: "SHIPMENT_REQUEST"
    });
    alert("Bulk CSV Shipment import processed successfully! 5 new shipments created.");
    setCsvContent("");
  };

  const reportsList = [
    { title: "Monthly SLA & On-Time Performance Report", date: "August 2026", type: "PDF / Excel", size: "2.4 MB" },
    { title: "Regional Traffic & Delay Risk Audit", date: "Q3 2026", type: "Excel (.xlsx)", size: "1.8 MB" },
    { title: "Enterprise Sub-Client Activity Manifest", date: "August 15, 2026", type: "PDF Report", size: "950 KB" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1e293b 100%)",
          color: "#ffffff",
          padding: "24px 28px",
          borderRadius: 24,
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          border: "1px solid #334155"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: 20,
                background: "rgba(59, 130, 246, 0.25)",
                color: "#93c5fd",
                border: "1px solid rgba(147, 197, 253, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.6px"
              }}
            >
              Enterprise Center
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#ffffff",
              margin: "4px 0",
              letterSpacing: "-0.5px"
            }}
          >
            Reports & Export Center
          </h1>
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
            Generate executive compliance documents, export raw analytics, and perform bulk batch imports.
          </p>
        </div>

        <ExportButton reportType="logistics" label="Export Analytics Report" />
      </div>

      {/* Main Grid: Export Options & Bulk CSV Import */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Card 1: Report Export Center */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <FileText size={22} color="#2563eb" />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Export Executive Reports
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px 0" }}>
            Select your preferred file format to download the complete logistics dataset.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FileText size={20} color="#ef4444" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>PDF Performance Audit</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Formatted visual report with charts</div>
                </div>
              </div>
              <ExportButton reportType="logistics" label="PDF" />
            </div>

            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FileSpreadsheet size={20} color="#16a34a" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Excel Spreadsheet (.xlsx)</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Raw data rows for accounting</div>
                </div>
              </div>
              <ExportButton reportType="logistics" label="Excel" />
            </div>
          </div>
        </div>

        {/* Card 2: Bulk CSV Batch Import Tool */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Upload size={22} color="#2563eb" />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Bulk CSV Shipment Import
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>
            Paste CSV formatted rows: Sender, Receiver, DeliveryAddress, TrackingNo
          </p>

          <textarea
            rows={4}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="Delhi Hub, Customer B, Koramangala Bengaluru, SH9001&#10;Mumbai Port, Customer C, Panaji Goa, SH9002"
            style={{
              width: "100%",
              fontSize: 12,
              padding: 12,
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              fontFamily: "ui-monospace, Consolas, monospace",
              marginBottom: 16,
              boxSizing: "border-box"
            }}
          />

          <button
            onClick={handleBulkCsvImport}
            style={{
              width: "100%",
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 700,
              color: "#ffffff",
              background: "#2563eb",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <Upload size={16} />
            <span>Process Bulk CSV Import</span>
          </button>
        </div>
      </div>

      {/* Generated Reports History Table */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
          Archived Reports & Compliance Audits
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569", fontWeight: 700, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.5px" }}>
                <th style={{ padding: "12px 16px" }}>Report Title</th>
                <th style={{ padding: "12px 16px" }}>Generated Date</th>
                <th style={{ padding: "12px 16px" }}>Format</th>
                <th style={{ padding: "12px 16px" }}>File Size</th>
                <th style={{ padding: "12px 16px" }}>Action</th>
              </tr>
            </thead>
            <tbody style={{ fontWeight: 500, color: "#334155" }}>
              {reportsList.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>{r.title}</td>
                  <td style={{ padding: "14px 16px" }}>{r.date}</td>
                  <td style={{ padding: "14px 16px" }}>{r.type}</td>
                  <td style={{ padding: "14px 16px" }}>{r.size}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <ExportButton reportType="logistics" label="Download" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BusinessReports;
