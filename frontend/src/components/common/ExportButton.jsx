import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import axios from "axios";
import { getStoredAuth } from "../../utils/auth";

export function ExportButton({ reportType = "shipment", label = "Export Report" }) {
  const [downloading, setDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setDownloading(true);
    setShowMenu(false);
    try {
      const auth = getStoredAuth();
      const token = auth?.token;

      const response = await axios.get(
        `http://localhost:8080/api/reports/${reportType}/export?format=${format}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          responseType: "blob"
        }
      );

      const blob = new Blob([response.data], {
        type: format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}_report.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export report error:", err);
      alert("Failed to export report. Make sure you have appropriate access permissions.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={downloading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 18px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: 13,
          borderRadius: 12,
          border: "none",
          cursor: downloading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
          opacity: downloading ? 0.6 : 1,
          transition: "all 0.2s ease"
        }}
      >
        {downloading ? (
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Download size={16} />
        )}
        <span>{label}</span>
      </button>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: 8,
            width: 210,
            background: "#ffffff",
            borderRadius: 14,
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
            border: "1px solid #e2e8f0",
            zIndex: 999,
            overflow: "hidden"
          }}
        >
          <div style={{ padding: "4px 0" }}>
            <button
              onClick={() => handleExport("pdf")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "background 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <FileText size={16} color="#ef4444" />
              <span>Download PDF Report</span>
            </button>

            <button
              onClick={() => handleExport("excel")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderTop: "1px solid #f1f5f9",
                transition: "background 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <FileSpreadsheet size={16} color="#16a34a" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
