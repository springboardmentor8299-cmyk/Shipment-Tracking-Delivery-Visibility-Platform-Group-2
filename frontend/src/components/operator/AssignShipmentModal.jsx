import { useEffect, useState } from "react";
import "../../styles/AddShipmentModal.css";

function AssignShipmentModal({
  show,
  driver,
  drivers = [],
  unassignedShipments = [],
  onClose,
  onAssign,
}) {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedDriverId(driver?.id ? String(driver.id) : "");
    setSelectedShipmentId("");
  }, [driver, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedShipmentId) return;

    setSubmitting(true);
    try {
      await onAssign(Number(selectedShipmentId), Number(selectedDriverId));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Assign Shipment to Driver</h2>

        <form onSubmit={handleSubmit}>
          <label>Driver</label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            required
            disabled={!!driver}
          >
            <option value="">Select a driver</option>
            {drivers
              .filter((d) => {
                if (d.id === driver?.id) return true;
                if (d.status === "OFFLINE") return false;
                const capacity = d.shipmentCapacity ?? Infinity;
                const active =
                  d.activeShipmentCount ?? d.activeShipments?.length ?? 0;
                return active < capacity;
              })
              .map((d) => {
                const capacity = d.shipmentCapacity;
                const active =
                  d.activeShipmentCount ?? d.activeShipments?.length ?? 0;
                return (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.vehicleNumber}
                    {capacity != null ? ` (${active}/${capacity})` : ""}
                  </option>
                );
              })}
          </select>

          <label>Shipment</label>
          <select
            value={selectedShipmentId}
            onChange={(e) => setSelectedShipmentId(e.target.value)}
            required
          >
            <option value="">Select an unassigned shipment</option>
            {unassignedShipments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.trackingId} — {s.origin} → {s.destination}
              </option>
            ))}
          </select>

          {unassignedShipments.length === 0 && (
            <p
              style={{
                color: "#64748b",
                fontSize: "0.85rem",
                margin: "-6px 0 4px",
              }}
            >
              No unassigned shipments right now — every active shipment already
              has a driver.
            </p>
          )}

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={submitting || unassignedShipments.length === 0}
            >
              {submitting ? "Assigning..." : "Assign & Notify Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignShipmentModal;
