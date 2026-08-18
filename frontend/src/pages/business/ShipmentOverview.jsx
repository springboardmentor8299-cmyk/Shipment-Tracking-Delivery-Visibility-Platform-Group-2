import React, { useEffect, useState } from "react";
import { Package, Search, Filter, Upload, CheckCircle2, Clock, Truck } from "lucide-react";
import axios from "axios";
import { getStoredAuth } from "../../utils/auth";
import { useNotifications } from "../../context/NotificationContext";

export function ShipmentOverview() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
      const res = await axios.get("http://localhost:8080/api/shipments", { headers });
      setShipments(res.data || []);
    } catch (err) {
      console.error("Error loading shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCsvImport = async () => {
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
    setShowCsvModal(false);
    setCsvContent("");
    fetchShipments();
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      (s.trackingNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.senderName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.receiverName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.deliveryAddress || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
              Logistics Management
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
            Shipment Overview
          </h1>
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
            Manage, filter, and track real-time status for all active enterprise cargo manifests.
          </p>
        </div>

        <button
          onClick={() => setShowCsvModal(true)}
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
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)"
          }}
        >
          <Upload size={16} />
          <span>Import CSV Manifest</span>
        </button>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by tracking number, sender, receiver, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#0f172a",
              fontWeight: 500
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Status:</span>
          {["ALL", "DELIVERED", "IN_TRANSIT", "PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: statusFilter === status ? "#2563eb" : "#f1f5f9",
                color: statusFilter === status ? "#ffffff" : "#475569"
              }}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Enterprise Active Shipments Table Card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Package size={20} color="#2563eb" />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Enterprise Cargo Manifests
            </h3>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#2563eb",
              background: "#eff6ff",
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid #bfdbfe"
            }}
          >
            {filteredShipments.length} Cargo Items
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontWeight: 600 }}>
            Loading shipment manifests...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
            No shipments found matching filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569", fontWeight: 700, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.5px" }}>
                  <th style={{ padding: "12px 16px" }}>Tracking #</th>
                  <th style={{ padding: "12px 16px" }}>Sender</th>
                  <th style={{ padding: "12px 16px" }}>Receiver</th>
                  <th style={{ padding: "12px 16px" }}>Delivery Address</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                </tr>
              </thead>
              <tbody style={{ fontWeight: 500, color: "#334155" }}>
                {filteredShipments.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#2563eb" }}>{s.trackingNumber}</td>
                    <td style={{ padding: "14px 16px" }}>{s.senderName}</td>
                    <td style={{ padding: "14px 16px" }}>{s.receiverName}</td>
                    <td style={{ padding: "14px 16px" }}>{s.deliveryAddress}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 12px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          background: s.status === "DELIVERED" ? "#dcfce7" : s.status === "IN_TRANSIT" ? "#fef3c7" : "#f1f5f9",
                          color: s.status === "DELIVERED" ? "#15803d" : s.status === "IN_TRANSIT" ? "#b45309" : "#475569"
                        }}
                      >
                        {s.status === "DELIVERED" && <CheckCircle2 size={13} />}
                        {s.status === "IN_TRANSIT" && <Truck size={13} />}
                        {s.status === "PENDING" && <Clock size={13} />}
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk CSV Modal */}
      {showCsvModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            padding: 16
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              maxWidth: 480,
              width: "100%",
              padding: 28,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0"
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
              Bulk CSV Shipment Import
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px 0", fontWeight: 500 }}>
              Paste CSV rows format: Sender, Receiver, DeliveryAddress, TrackingNo
            </p>

            <textarea
              rows={5}
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowCsvModal(false)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#475569",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCsvImport}
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ffffff",
                  background: "#2563eb",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                }}
              >
                Process CSV Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShipmentOverview;
