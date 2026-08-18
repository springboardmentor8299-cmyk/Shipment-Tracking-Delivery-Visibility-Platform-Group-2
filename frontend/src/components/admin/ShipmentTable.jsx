import { useEffect, useState } from "react";
import { getAllShipments, updateShipment, deleteShipment } from "../../services/shipmentService";
import { Search, CheckCircle2, Truck, Clock, Package, Edit, Trash2, Eye, X, Save, ShieldAlert } from "lucide-react";
import PodViewerModal from "../pod/PodViewerModal";

import { getStoredUser } from "../../utils/auth";

function ShipmentTable({ searchTerm = "" }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState("");
  const currentUser = getStoredUser();
  const isAdmin = ["ADMIN", "ADMINISTRATOR"].includes((currentUser?.role || "").toUpperCase());

  // Modals state
  const [inspectShipmentId, setInspectShipmentId] = useState(null);
  const [inspectTrackingNo, setInspectTrackingNo] = useState("");
  const [editingShipment, setEditingShipment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const allShipments = await getAllShipments();
      setShipments(allShipments);
    } catch (error) {
      console.error("Shipment loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (shipment) => {
    setEditingShipment(shipment);
    setEditForm({
      trackingNumber: shipment.trackingNumber || "",
      senderName: shipment.senderName || "",
      receiverName: shipment.receiverName || "",
      deliveryAddress: shipment.deliveryAddress || "",
      status: shipment.status || "PENDING",
      customerId: shipment.customerId || ""
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingShipment) return;
    setSubmittingEdit(true);
    try {
      await updateShipment(editingShipment.id, editForm);
      alert(`Shipment #${editForm.trackingNumber} updated successfully!`);
      setEditingShipment(null);
      loadShipments();
    } catch (err) {
      console.error("Failed to update shipment:", err);
      alert("Failed to save shipment changes.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (id, trackingNo) => {
    if (window.confirm(`Are you sure you want to permanently delete shipment #${trackingNo}?`)) {
      try {
        await deleteShipment(id);
        alert(`Shipment #${trackingNo} deleted.`);
        loadShipments();
      } catch (err) {
        console.error("Failed to delete shipment:", err);
        alert("Failed to delete shipment.");
      }
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    const query = (searchTerm || localQuery || "").trim().toLowerCase();
    if (!query) return true;

    return [
      shipment.trackingNumber,
      shipment.senderName,
      shipment.receiverName,
      shipment.deliveryAddress,
      shipment.status,
    ]
      .filter(Boolean)
      .some((value) => value.toString().toLowerCase().includes(query));
  });

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "DELIVERED") {
      return { bg: "#dcfce7", color: "#15803d", border: "#86efac", icon: CheckCircle2, label: "DELIVERED" };
    }
    if (s === "IN_TRANSIT") {
      return { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd", icon: Truck, label: "IN TRANSIT" };
    }
    if (s === "REQUESTED") {
      return { bg: "#e0f2fe", color: "#0369a1", border: "#7dd3fc", icon: Package, label: "REQUESTED" };
    }
    return { bg: "#fef3c7", color: "#b45309", border: "#fde68a", icon: Clock, label: "PENDING" };
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: "24px 28px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>All Shipments & POD Log</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Live records, proof of delivery, edit & delete controls</p>
        </div>

        {!searchTerm && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "8px 14px", width: 260 }}>
            <Search size={16} color="#94a3b8" />
            <input
              placeholder="Search tracking ID, status..."
              onChange={(e) => setLocalQuery(e.target.value)}
              value={localQuery}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", color: "#0f172a" }}
            />
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Tracking ID</th>
              <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Driver (Logistics Operator)</th>
              <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Receiver</th>
              <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Destination</th>
              <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Status</th>
              <th style={{ padding: "14px 18px", fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>Actions & POD</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: 14 }}>
                  Loading shipments...
                </td>
              </tr>
            ) : filteredShipments.length > 0 ? (
              filteredShipments.map((shipment) => {
                const badge = getStatusBadge(shipment.status);
                const BadgeIcon = badge.icon;

                return (
                  <tr key={shipment.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                    <td style={{ padding: "16px 18px", fontSize: 14, fontWeight: 800, color: "#2563eb", whiteSpace: "nowrap" }}>
                      #{shipment.trackingNumber}
                    </td>
                    <td style={{ padding: "16px 18px", fontSize: 14, color: "#334155", fontWeight: 600 }}>{shipment.senderName}</td>
                    <td style={{ padding: "16px 18px", fontSize: 14, color: "#334155", fontWeight: 600 }}>{shipment.receiverName}</td>
                    <td style={{ padding: "16px 18px", fontSize: 13, color: "#64748b" }}>{shipment.deliveryAddress}</td>
                    <td style={{ padding: "16px 18px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 14px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border || 'transparent'}`
                        }}
                      >
                        <BadgeIcon size={13} />
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: "16px 18px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => { setInspectShipmentId(shipment.id); setInspectTrackingNo(shipment.trackingNumber); }}
                          title="Inspect Proof of Delivery (POD)"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#eff6ff", border: "1.5px solid #bfdbfe", color: "#1d4ed8", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                        >
                          <Eye size={14} color="#2563eb" /> POD
                        </button>

                        {/* EDIT and DELETE are ONLY rendered for ADMIN */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(shipment)}
                              title="Edit Shipment"
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#ffffff", border: "1.5px solid #cbd5e1", color: "#334155", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            >
                              <Edit size={14} /> Edit
                            </button>

                            <button
                              onClick={() => handleDelete(shipment.id, shipment.trackingNumber)}
                              title="Delete Shipment"
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6">
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                    <Package size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>No shipments found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Shipment Modal */}
      {editingShipment && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Shipment #{editForm.trackingNumber}</h3>
              <button onClick={() => setEditingShipment(null)} className="modal-close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "grid", gap: 14, paddingTop: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Tracking ID</label>
                <input
                  type="text"
                  value={editForm.trackingNumber}
                  onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Driver (Logistics Operator) Name</label>
                <input
                  type="text"
                  value={editForm.senderName}
                  onChange={(e) => setEditForm({ ...editForm, senderName: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Receiver Name</label>
                <input
                  type="text"
                  value={editForm.receiverName}
                  onChange={(e) => setEditForm({ ...editForm, receiverName: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Delivery Address</label>
                <input
                  type="text"
                  value={editForm.deliveryAddress}
                  onChange={(e) => setEditForm({ ...editForm, deliveryAddress: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff" }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button type="button" onClick={() => setEditingShipment(null)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", fontWeight: 700, fontSize: 13 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingEdit} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <Save size={15} /> {submittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POD Viewer Modal */}
      <PodViewerModal
        isOpen={!!inspectShipmentId}
        onClose={() => setInspectShipmentId(null)}
        shipmentId={inspectShipmentId}
        trackingNumber={inspectTrackingNo}
      />
    </div>
  );
}

export default ShipmentTable;
