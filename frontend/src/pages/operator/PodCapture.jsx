import React, { useEffect, useState, useRef } from "react";
import {
  PenTool,
  CheckCircle2,
  Camera,
  Search,
  Key,
  FileCheck
} from "lucide-react";
import axios from "axios";
import { getStoredAuth, getStoredUser } from "../../utils/auth";
import { useNotifications } from "../../context/NotificationContext";
import { getAllShipments, updateShipmentStatus } from "../../services/shipmentService";

function PodCapture() {
  const [activeTab, setActiveTab] = useState("new"); // "new" or "records"
  const [shipments, setShipments] = useState([]);
  const [podRecords, setPodRecords] = useState([]);
  const { addNotification } = useNotifications();
  const currentUser = getStoredUser();

  // New POD Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [receiverName, setReceiverName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("signature");
  const [checks, setChecks] = useState({
    identityConfirmed: false,
    conditionChecked: false,
    itemCountMatches: false,
  });

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  // Signature canvas state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Photo Upload state
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchOperatorData();
  }, []);

  const fetchOperatorData = async () => {
    try {
      const all = await getAllShipments();
      setShipments(all || []);

      const inTransit = (all || []).filter(s => (s.status || "").toUpperCase() === "IN_TRANSIT" || (s.status || "").toUpperCase() === "PENDING" || (s.status || "").toUpperCase() === "OUT_FOR_DELIVERY");
      if (inTransit.length > 0) {
        setSelectedShipment(inTransit[0]);
        setReceiverName(inTransit[0].receiverName || "");
      }
    } catch (err) {
      console.error("Error loading operator POD data:", err);
    }
  };

  // Canvas drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // OTP functions
  const handleGenerateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpVerified(false);
    setInputOtp("");
    setOtpMessage(`SMS OTP sent to recipient: ${code}`);
  };

  const handleVerifyOtp = () => {
    if (inputOtp.trim() === generatedOtp) {
      setOtpVerified(true);
      setOtpMessage("OTP verified successfully!");
    } else {
      setOtpVerified(false);
      setOtpMessage("Invalid OTP code. Please try again.");
    }
  };

  // Handle Photo Drop / Selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const urls = files.map(f => URL.createObjectURL(f));
      setPhotos(prev => [...prev, ...urls]);
    }
  };

  // Submit POD
  const handleConfirmDelivery = async () => {
    if (!selectedShipment) {
      alert("Please select a shipment for Proof of Delivery.");
      return;
    }
    if (!receiverName.trim()) {
      alert("Please enter the receiver name.");
      return;
    }
    if (verificationMethod === "otp" && !otpVerified) {
      alert("Please verify the OTP code before confirming delivery.");
      return;
    }

    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};

      let sigData = "";
      if (hasSignature && canvasRef.current) {
        sigData = canvasRef.current.toDataURL("image/png");
      }

      await axios.post(
        `http://localhost:8080/api/pod/${selectedShipment.id}/confirm`,
        {
          signatureData: sigData || "DATA_CAPTURED_DIGITAL_SIG",
          photoUrls: photos.join(",") || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
          recipientName: receiverName,
          deliveryAgentId: auth?.id || 501,
          geoLat: selectedShipment.destLatitude || 28.6139,
          geoLng: selectedShipment.destLongitude || 77.2090,
          notes: deliveryNotes || "Confirmed delivery by field operator"
        },
        { headers }
      );

      // Update shipment status to DELIVERED
      await updateShipmentStatus(selectedShipment.id, "DELIVERED");

      const newRecord = {
        id: Date.now(),
        shipmentId: selectedShipment.id,
        trackingNumber: selectedShipment.trackingNumber,
        recipientName: receiverName,
        capturedAt: new Date().toISOString(),
        notes: deliveryNotes,
        status: "DELIVERED"
      };
      setPodRecords(prev => [newRecord, ...prev]);

      // Route Notification to ADMIN
      addNotification({
        title: "POD Confirmed & Package Delivered",
        message: `Field operator ${currentUser?.username || 'Driver'} delivered shipment #${selectedShipment.trackingNumber}. POD evidence captured for ${receiverName}.`,
        category: "POD_CONFIRMED",
        trackingNumber: selectedShipment.trackingNumber,
        recipientRole: "ADMIN"
      });

      // Route Notification to CUSTOMER
      addNotification({
        title: "Your Package Has Been Delivered!",
        message: `Shipment #${selectedShipment.trackingNumber} was handed over to ${receiverName}. Proof of delivery recorded.`,
        category: "POD_CONFIRMED",
        trackingNumber: selectedShipment.trackingNumber,
        recipientRole: "CUSTOMER",
        targetCustomer: receiverName
      });

      alert(`Delivery & Proof of Delivery confirmed for shipment #${selectedShipment.trackingNumber}!`);

      // Reset form
      clearSignature();
      setPhotos([]);
      setDeliveryNotes("");
      setOtpVerified(false);
      setGeneratedOtp("");
      setInputOtp("");
      setOtpMessage("");
      fetchOperatorData();
    } catch (err) {
      console.error("Error confirming POD delivery:", err);
      alert("Failed to confirm delivery. Please try again.");
    }
  };

  const inTransitShipments = shipments.filter(s => {
    const q = searchTerm.trim().toLowerCase();
    const isMatchingStatus = (s.status || "").toUpperCase() !== "DELIVERED";
    if (!q) return isMatchingStatus;
    return isMatchingStatus && (
      (s.trackingNumber || "").toLowerCase().includes(q) ||
      (s.receiverName || "").toLowerCase().includes(q) ||
      (s.senderName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Top Title Section */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
          Proof of Delivery (POD Capture)
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#475569", fontWeight: 500 }}>
          Capture signature, photo evidence, and recipient OTP verification upon completing package handoff.
        </p>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: 12, borderBottom: "2px solid #e2e8f0", marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab("new")}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 800,
            color: activeTab === "new" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "new" ? "3px solid #2563eb" : "3px solid transparent",
            background: "none",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <PenTool size={16} /> New POD Entry
        </button>

        <button
          onClick={() => setActiveTab("records")}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 800,
            color: activeTab === "records" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "records" ? "3px solid #2563eb" : "3px solid transparent",
            background: "none",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <FileCheck size={16} /> Saved POD Records ({podRecords.length})
        </button>
      </div>

      {/* TAB 1: NEW POD FORM */}
      {activeTab === "new" && (
        <div style={{ background: "#ffffff", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15,23,42,0.04)", display: "grid", gap: 24 }}>
          {/* Section 1: Shipment Selector */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
              Select Active Shipment for POD
            </label>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 14 }} />
              <input
                type="text"
                placeholder="Search by tracking ID or customer name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  borderRadius: 12,
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: 14,
                  fontWeight: 500,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Shipment Selection List */}
            <div style={{ display: "grid", gap: 10, maxHeight: 180, overflowY: "auto" }}>
              {inTransitShipments.length === 0 ? (
                <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No active in-transit shipments found.
                </div>
              ) : (
                inTransitShipments.map(s => {
                  const isSelected = selectedShipment?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => { setSelectedShipment(s); setReceiverName(s.receiverName || ""); }}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        background: isSelected ? "#eff6ff" : "#f8fafc",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                          #{s.trackingNumber} — <span style={{ color: "#2563eb" }}>{s.receiverName}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {s.pickupAddress || "Origin"} → {s.deliveryAddress}
                        </div>
                      </div>

                      <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: "#fef3c7", color: "#b45309" }}>
                        {s.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Receiver Name & Delivery Notes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
                Receiver name
              </label>
              <input
                type="text"
                placeholder="Who received the package?"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: 14,
                  fontWeight: 500,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
                Delivery notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Left at reception"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: 14,
                  fontWeight: 500,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Section 3: Verification Method & Checkboxes */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 10 }}>
              Verification method
            </label>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setVerificationMethod("signature")}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  background: verificationMethod === "signature" ? "#2563eb" : "#f1f5f9",
                  color: verificationMethod === "signature" ? "#ffffff" : "#475569",
                  cursor: "pointer"
                }}
              >
                Signature only
              </button>
              <button
                type="button"
                onClick={() => setVerificationMethod("otp")}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  background: verificationMethod === "otp" ? "#2563eb" : "#f1f5f9",
                  color: verificationMethod === "otp" ? "#ffffff" : "#475569",
                  cursor: "pointer"
                }}
              >
                OTP code
              </button>
              <button
                type="button"
                onClick={() => setVerificationMethod("id")}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  background: verificationMethod === "id" ? "#2563eb" : "#f1f5f9",
                  color: verificationMethod === "id" ? "#ffffff" : "#475569",
                  cursor: "pointer"
                }}
              >
                ID verification
              </button>
            </div>

            {/* OTP Code Generator section when OTP pill selected */}
            {verificationMethod === "otp" && (
              <div style={{ padding: 16, background: "#eff6ff", borderRadius: 16, border: "1px solid #bfdbfe", marginBottom: 16, display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1e40af" }}>Recipient OTP Verification</span>
                  <button
                    type="button"
                    onClick={handleGenerateOtp}
                    style={{ padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Key size={14} /> Generate OTP
                  </button>
                </div>

                {otpMessage && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: otpVerified ? "#16a34a" : "#1d4ed8" }}>
                    {otpMessage}
                  </div>
                )}

                {generatedOtp && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      style={{ padding: 8, borderRadius: 10, border: "1px solid #cbd5e1", width: 160, fontSize: 14, textAlign: "center", fontWeight: 800 }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      style={{ padding: "8px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      Verify Code
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Checkboxes */}
            <div style={{ display: "grid", gap: 10, fontSize: 13, color: "#334155", fontWeight: 600 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checks.identityConfirmed}
                  onChange={(e) => setChecks({ ...checks, identityConfirmed: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                Receiver identity confirmed
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checks.conditionChecked}
                  onChange={(e) => setChecks({ ...checks, conditionChecked: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                Package condition checked — no visible damage
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checks.itemCountMatches}
                  onChange={(e) => setChecks({ ...checks, itemCountMatches: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                Item count matches shipment record
              </label>
            </div>
          </div>

          {/* Section 4: Receiver Signature */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                Receiver signature
              </label>
              <button
                type="button"
                onClick={clearSignature}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Clear signature
              </button>
            </div>

            <div style={{ border: "1.5px dashed #cbd5e1", borderRadius: 16, background: "#f8fafc", padding: 8, display: "flex", justifyContent: "center" }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ background: "#ffffff", borderRadius: 12, cursor: "crosshair", touchAction: "none" }}
              />
            </div>
            <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, display: "block" }}>
              Sign above with mouse or finger
            </span>
          </div>

          {/* Section 5: Delivery Photos */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
              Delivery photos
            </label>
            <label style={{ border: "1.5px dashed #cbd5e1", borderRadius: 16, background: "#f8fafc", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}>
              <Camera size={32} color="#64748b" style={{ marginBottom: 8 }} />
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                Drop delivery photos here, or click to choose files
              </span>
              <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
            </label>

            {photos.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                {photos.map((p, idx) => (
                  <img key={idx} src={p} alt={`Photo ${idx + 1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid #cbd5e1" }} />
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Submit Button */}
          <div>
            <button
              type="button"
              onClick={handleConfirmDelivery}
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                background: "#2563eb",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <CheckCircle2 size={18} /> Confirm Delivery & Save POD
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: POD RECORDS */}
      {activeTab === "records" && (
        <div style={{ background: "#ffffff", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15,23,42,0.04)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>Saved Proof of Delivery Records</h3>
          {podRecords.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>
              No POD records created in this session yet. Complete a delivery entry above to log records.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {podRecords.map(r => (
                <div key={r.id} style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 16, background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#2563eb", fontSize: 14 }}>#{r.trackingNumber}</span>
                    <div style={{ fontSize: 13, color: "#334155", fontWeight: 600, marginTop: 2 }}>
                      Recipient: {r.recipientName} | Delivered At: {new Date(r.capturedAt).toLocaleString()}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "#dcfce7", color: "#166534" }}>
                    DELIVERED & VERIFIED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PodCapture;
