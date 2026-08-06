import { useEffect, useState } from "react";
import { getShipmentTracking } from "../../../services/customerService";

// Static data outside component prevent re-creation on every render
const TRACKING_STEPS = [
  { id: "CREATED", label: "Order Confirmed" },
  { id: "PICKED_UP", label: "Picked Up" },
  { id: "IN_TRANSIT", label: "Current Location" },
  { id: "OUT_FOR_DELIVERY", label: "Destination Hub" },
  { id: "DELIVERED", label: "Delivered" },
];

const STATUS_ORDER = TRACKING_STEPS.map((step) => step.id);

// Formats an ISO date/datetime string the way the reference design shows it:
// a plain date ("2026-07-28") for milestones, or a "Last updated: <time>" line
// for the live truck-location step.
function formatStepDate(value, { asLastUpdated = false } = {}) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  if (asLastUpdated) {
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `Last updated: ${time}`;
  }

  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Builds the real, per-shipment subtext (location + date/time) for each step,
// using only fields the backend actually has for this ticket — no placeholders.
function getStepDetails(step, shipment) {
  switch (step.id) {
    case "CREATED":
      return {
        location: shipment.origin,
        date: formatStepDate(shipment.shipmentDate),
      };
    case "PICKED_UP":
      return {
        location: shipment.origin ? `${shipment.origin} Hub` : null,
        date: formatStepDate(shipment.shipmentDate),
      };
    case "IN_TRANSIT":
      return {
        location: shipment.currentLocationName,
        date: formatStepDate(shipment.lastLocationUpdate, {
          asLastUpdated: true,
        }),
      };
    case "OUT_FOR_DELIVERY":
      return {
        location: shipment.destination ? `${shipment.destination} Hub` : null,
        date:
          formatStepDate(shipment.estimatedDeliveryTime) ||
          formatStepDate(shipment.deliveryDate),
      };
    case "DELIVERED":
      return {
        location: shipment.destination,
        date: formatStepDate(shipment.deliveryDate),
      };
    default:
      return { location: null, date: null };
  }
}

export default function CustomerTracking({ trackingId }) {
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    if (!trackingId) return;

    let isMounted = true;
    getShipmentTracking(trackingId)
      .then((data) => {
        if (isMounted) setShipment(data);
      })
      .catch((err) => console.error("Error fetching tracking data:", err));

    return () => {
      isMounted = false; // Prevent state updates if component unmounts
    };
  }, [trackingId]);

  if (!trackingId) {
    return (
      <div style={styles.centerContainer}>
        <h2>Select a shipment to track.</h2>
        <p>
          Go to <b>Dashboard</b> and click the <b>Track</b> button.
        </p>
      </div>
    );
  }

  if (!shipment) {
    return <h2 style={{ padding: "30px" }}>Loading...</h2>;
  }

  const currentIndex = STATUS_ORDER.indexOf(shipment.status);

  return (
    <div style={{ padding: "0px" }}>
      <h2>Shipment Tracking</h2>

      <div style={styles.card}>
        {/* Shipment Details Metadata */}
        <div style={styles.metaGrid}>
          <p>
            <strong>Tracking ID:</strong> {shipment.trackingId}
          </p>
          <p>
            <strong>Origin:</strong> {shipment.origin}
          </p>
          <p>
            <strong>Destination:</strong> {shipment.destination}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span style={styles.statusBadge}>{shipment.status}</span>
          </p>
          <p>
            <strong>Shipment Date:</strong> {shipment.shipmentDate}
          </p>
          <p>
            <strong>Delivery Date:</strong> {shipment.deliveryDate}
          </p>
        </div>

        <hr style={styles.divider} />

        <h3>Shipment Progress</h3>

        {/* Timeline Progress */}
        <div style={styles.timelineList}>
          {TRACKING_STEPS.map((step, index) => {
            const isLast = index === TRACKING_STEPS.length - 1;
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isPending = index > currentIndex;

            // Unified color lookup
            const accentColor = isCompleted
              ? "#22c55e"
              : isActive
                ? "#2563eb"
                : "#cbd5e1";

            const lineColor = isCompleted ? "#22c55e" : "#e2e8f0";

            // Real per-shipment data for this step — no placeholders.
            const { location, date } = isPending
              ? {}
              : getStepDetails(step, shipment);

            return (
              <div
                key={step.id}
                style={{
                  ...styles.stepRow,
                  paddingBottom: isLast ? "0" : "28px",
                }}
              >
                {/* Left Marker Column */}
                <div style={styles.markerCol}>
                  {/* Circle Dot */}
                  <div style={{ ...styles.dot, backgroundColor: accentColor }}>
                    {isCompleted && <span style={styles.checkmark}>✓</span>}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      style={{ ...styles.line, backgroundColor: lineColor }}
                    />
                  )}
                </div>

                {/* Right Content Label */}
                <div style={styles.labelWrapper}>
                  <h4
                    style={{
                      ...styles.label,
                      color: isActive || isCompleted ? "#0f172a" : "#64748b",
                      fontWeight: isActive ? "700" : "500",
                    }}
                  >
                    {step.label}
                  </h4>
                  {location && <p style={styles.stepLocation}>{location}</p>}
                  {date && <p style={styles.stepDate}>{date}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Clean style object keeps JSX clean and readable
const styles = {
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  statusBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "600",
  },
  divider: {
    margin: "24px 0",
    border: "none",
    borderTop: "1px solid #f1f5f9",
  },
  timelineList: {
    display: "flex",
    flexDirection: "column",
    marginTop: "20px",
  },
  stepRow: {
    display: "flex",
    alignItems: "stretch",
    position: "relative",
  },
  markerCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "16px",
    position: "relative",
    width: "22px",
    flexShrink: 0,
  },
  dot: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    flexShrink: 0,
    transition: "background-color 0.3s ease",
  },
  checkmark: {
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
  },
  line: {
    width: "2px",
    position: "absolute",
    top: "22px",
    bottom: "-28px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1,
    transition: "background-color 0.3s ease",
  },
  labelWrapper: {
    minHeight: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  label: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "22px",
  },
  stepLocation: {
    margin: "2px 0 0 0",
    fontSize: "13px",
    color: "#475569",
    lineHeight: "18px",
  },
  stepDate: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "16px",
  },
  centerContainer: {
    padding: "40px",
    textAlign: "center",
  },
};
