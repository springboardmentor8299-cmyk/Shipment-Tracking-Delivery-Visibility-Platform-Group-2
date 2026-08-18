import { useState, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { getStoredUser } from "../../utils/auth";
import { createShipment, createSupportIssue, getMySupportIssues } from "../../services/shipmentService";
import { CheckCircle2, AlertCircle, Upload, FileText, Send, LifeBuoy } from "lucide-react";

const initialSampleRequests = [
  {
    id: 5,
    requestType: "ISSUE",
    shipmentId: "TRK-79282CB1",
    subject: "do this shipment active",
    status: "RESOLVED",
    createdOn: "8/13/2026, 7:01:50 PM"
  },
  {
    id: 4,
    requestType: "SHIPMENT_REQUEST",
    shipmentId: "-",
    subject: "Shipment Request",
    status: "RESOLVED",
    createdOn: "8/13/2026, 6:39:25 PM"
  },
  {
    id: 2,
    requestType: "SHIPMENT_REQUEST",
    shipmentId: "-",
    subject: "Shipment Request",
    status: "PENDING",
    createdOn: "8/11/2026, 6:59:36 PM"
  },
  {
    id: 1,
    requestType: "SHIPMENT_REQUEST",
    shipmentId: "-",
    subject: "Shipment Request",
    status: "RESOLVED",
    createdOn: "8/11/2026, 6:19:12 PM"
  }
];

export default function Support() {
  const [activeTab, setActiveTab] = useState("shipment"); // "shipment", "issue", "my_requests"
  const { addNotification } = useNotifications();
  const user = getStoredUser();

  // Tab 1: Shipment Request Form State
  const [shipmentForm, setShipmentForm] = useState({
    senderName: user?.username || "",
    receiverName: "",
    pickupAddress: "",
    deliveryAddress: "",
    documents: "",
    weightKg: "",
    requestDate: "",
    specialInstructions: ""
  });

  // Tab 2: Raise Issue Form State
  const [issueForm, setIssueForm] = useState({
    trackingId: "",
    issueType: "",
    subject: "",
    description: "",
    file: null
  });

  // Requests Table State
  const [requestsList, setRequestsList] = useState(() => {
    try {
      const saved = localStorage.getItem("cargoflow_support_requests");
      return saved ? JSON.parse(saved) : initialSampleRequests;
    } catch {
      return initialSampleRequests;
    }
  });

  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch My Requests from backend
  const fetchMyRequests = async () => {
    try {
      const data = await getMySupportIssues();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.id,
          requestType: item.requestType || "ISSUE",
          shipmentId: item.trackingId || "-",
          subject: item.subject,
          status: item.status || "PENDING",
          createdOn: item.createdAt ? new Date(item.createdAt).toLocaleString() : new Date().toLocaleString(),
          resolutionNotes: item.resolutionNotes
        }));
        setRequestsList(formatted);
      }
    } catch (err) {
      console.error("Error fetching support requests:", err);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [activeTab]);

  // Submit Shipment Request
  const handleShipmentSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!shipmentForm.senderName || !shipmentForm.receiverName || !shipmentForm.deliveryAddress) {
      setFormError("Please fill in Sender Name, Receiver Name, and Delivery Address.");
      return;
    }

    setLoading(true);
    try {
      const generatedTracking = "SH" + Math.floor(10000 + Math.random() * 90000);
      
      await createShipment({
        trackingNumber: generatedTracking,
        senderName: shipmentForm.senderName,
        receiverName: shipmentForm.receiverName,
        deliveryAddress: shipmentForm.deliveryAddress,
        status: "REQUESTED"
      });

      // Also create support issue record for tracking
      await createSupportIssue({
        requestType: "SHIPMENT_REQUEST",
        trackingId: generatedTracking,
        issueType: "Shipment Request",
        subject: `New Shipment Creation Request: ${generatedTracking}`,
        description: `Customer requested shipment from ${shipmentForm.senderName} to ${shipmentForm.receiverName} at ${shipmentForm.deliveryAddress}.`
      });

      const newReqRecord = {
        id: Date.now(),
        requestType: "SHIPMENT_REQUEST",
        shipmentId: generatedTracking,
        subject: "Shipment Request",
        status: "PENDING",
        createdOn: new Date().toLocaleString()
      };

      setRequestsList(prev => [newReqRecord, ...prev]);

      // Route Notification to ADMIN & SUPPORT
      addNotification({
        title: "New Customer Shipment Request",
        message: `Customer ${shipmentForm.senderName} raised shipment request #${generatedTracking} to ${shipmentForm.deliveryAddress}.`,
        category: "SHIPMENT_REQUEST",
        trackingNumber: generatedTracking,
        recipientRole: "ADMIN"
      });

      setFormSuccess(`Shipment request #${generatedTracking} submitted successfully! Admin will review and accept shortly.`);
      setShipmentForm({
        senderName: user?.username || "",
        receiverName: "",
        pickupAddress: "",
        deliveryAddress: "",
        documents: "",
        weightKg: "",
        requestDate: "",
        specialInstructions: ""
      });
      fetchMyRequests();
    } catch (err) {
      console.error(err);
      setFormError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Issue
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!issueForm.subject || !issueForm.description) {
      setFormError("Please fill in Subject and Issue Description.");
      return;
    }

    setLoading(true);
    try {
      const created = await createSupportIssue({
        requestType: "ISSUE",
        trackingId: issueForm.trackingId || "-",
        issueType: issueForm.issueType || "General Issue",
        subject: issueForm.subject,
        description: issueForm.description,
        customerEmail: user?.email,
        customerUsername: user?.username
      });

      const newIssueRecord = {
        id: created.id || Date.now(),
        requestType: "ISSUE",
        shipmentId: issueForm.trackingId || "-",
        subject: issueForm.subject,
        status: "PENDING",
        createdOn: new Date().toLocaleString()
      };

      setRequestsList(prev => [newIssueRecord, ...prev]);

      // Route Notification to ADMIN & SUPPORT
      addNotification({
        title: `Customer Raised Support Issue: ${issueForm.subject}`,
        message: `Customer ${user?.username || 'Client'} raised issue regarding #${issueForm.trackingId || 'general shipment'}: "${issueForm.description.substring(0, 60)}..."`,
        category: "GENERAL",
        trackingNumber: issueForm.trackingId || "",
        recipientRole: "ADMIN"
      });

      setFormSuccess("Support issue submitted successfully! Our support agent team has been notified.");
      setIssueForm({
        trackingId: "",
        issueType: "",
        subject: "",
        description: "",
        file: null
      });
      fetchMyRequests();
    } catch (err) {
      console.error("Error creating support issue:", err);
      setFormError("Failed to submit support issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 14,
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 500,
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s"
  };

  return (
    <div style={{ paddingBottom: 48, maxWidth: 960, margin: "0 auto" }}>
      {/* Top Banner Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
          Support Center
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#64748b", fontWeight: 500 }}>
          Request shipment creation or raise delivery related issues.
        </p>
      </div>

      {/* Pill Tabs Header (Matches screenshot design) */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {[
          { id: "shipment", label: "Shipment Request" },
          { id: "issue", label: "Raise Issue" },
          { id: "my_requests", label: "My Requests" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setFormSuccess("");
              setFormError("");
            }}
            style={{
              padding: "10px 22px",
              borderRadius: 24,
              border: "none",
              background: activeTab === t.id ? "#2563eb" : "#e2e8f0",
              color: activeTab === t.id ? "#ffffff" : "#475569",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card Container */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: 32,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)"
        }}
      >
        {/* TAB 1: RAISE SHIPMENT REQUEST */}
        {activeTab === "shipment" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0" }}>
              Raise Shipment Request
            </h2>

            <form onSubmit={handleShipmentSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <input
                  type="text"
                  placeholder="Sender Name"
                  value={shipmentForm.senderName}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, senderName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Receiver Name"
                  value={shipmentForm.receiverName}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, receiverName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Pickup Address"
                  value={shipmentForm.pickupAddress}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, pickupAddress: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={shipmentForm.deliveryAddress}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, deliveryAddress: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <select
                  value={shipmentForm.documents}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, documents: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Documents</option>
                  <option value="Commercial Invoice">Commercial Invoice</option>
                  <option value="Bill of Lading">Bill of Lading</option>
                  <option value="Packing List">Packing List</option>
                  <option value="Customs Declaration">Customs Declaration</option>
                </select>
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Weight (Kg)"
                  value={shipmentForm.weightKg}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, weightKg: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  value={shipmentForm.requestDate}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, requestDate: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Special Instructions"
                  value={shipmentForm.specialInstructions}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, specialInstructions: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", background: "#fef2f2", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", background: "#f0fdf4", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                  transition: "background 0.2s"
                }}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: RAISE ISSUE */}
        {activeTab === "issue" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0" }}>
              Raise Issue
            </h2>

            <form onSubmit={handleIssueSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <input
                  type="text"
                  placeholder="Tracking ID"
                  value={issueForm.trackingId}
                  onChange={(e) => setIssueForm({ ...issueForm, trackingId: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <select
                  value={issueForm.issueType}
                  onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select Issue</option>
                  <option value="Delayed Delivery">Delayed Delivery</option>
                  <option value="Package Damaged">Package Damaged</option>
                  <option value="Incorrect Address">Incorrect Address</option>
                  <option value="Driver Behavior">Driver Behavior</option>
                  <option value="Payment / Invoice Query">Payment / Invoice Query</option>
                  <option value="Other Issue">Other Issue</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={issueForm.subject}
                  onChange={(e) => setIssueForm({ ...issueForm, subject: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder="Describe your issue..."
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div>
                <input
                  type="file"
                  onChange={(e) => setIssueForm({ ...issueForm, file: e.target.files[0] })}
                  style={{ fontSize: 13, color: "#475569", cursor: "pointer" }}
                />
              </div>

              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", background: "#fef2f2", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", background: "#f0fdf4", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                  transition: "background 0.2s"
                }}
              >
                {loading ? "Submitting..." : "Submit Issue"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MY REQUESTS */}
        {activeTab === "my_requests" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0" }}>
              My Requests
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>REQUEST ID</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>REQUEST TYPE</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>SHIPMENT ID</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>SUBJECT</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>STATUS</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>CREATED ON</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                        No support requests logged yet.
                      </td>
                    </tr>
                  ) : (
                    requestsList.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 16px", color: "#64748b", fontWeight: 600 }}>{r.id}</td>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>{r.requestType}</td>
                        <td style={{ padding: "14px 16px", color: "#2563eb", fontWeight: 700 }}>{r.shipmentId}</td>
                        <td style={{ padding: "14px 16px", color: "#334155" }}>{r.subject}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "4px 10px",
                              borderRadius: 12,
                              background: r.status === "RESOLVED" ? "#dcfce7" : "#fef3c7",
                              color: r.status === "RESOLVED" ? "#166534" : "#b45309"
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#64748b" }}>{r.createdOn}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
