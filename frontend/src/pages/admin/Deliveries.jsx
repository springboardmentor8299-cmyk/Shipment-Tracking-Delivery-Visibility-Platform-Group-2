import { useEffect, useState } from "react";
import { getAllShipments } from "../../services/shipmentService";
import { Truck, CheckCircle2, MapPin, User, Package } from "lucide-react";

function Deliveries() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchShipments = async () => {
      const result = await getAllShipments();
      if (mounted) setShipments(result);
    };
    fetchShipments();
    return () => {
      mounted = false;
    };
  }, []);

  const deliveries = shipments.filter((shipment) => shipment.status === "DELIVERED" || shipment.status === "IN_TRANSIT");

  return (
    <div className="admin-dashboard">
      <div className="customer-dashboard-header">
        <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>Deliveries</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>Track active in-transit freight and completed deliveries end-to-end.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {deliveries.length > 0 ? (
          deliveries.map((shipment) => {
            const isDelivered = shipment.status === "DELIVERED";
            return (
              <div
                key={shipment.id}
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderLeft: `5px solid ${isDelivered ? "#16a34a" : "#f59e0b"}`,
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isDelivered ? "#dcfce7" : "#fef3c7",
                        color: isDelivered ? "#16a34a" : "#d97706",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {isDelivered ? <CheckCircle2 size={20} /> : <Truck size={20} />}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{shipment.trackingNumber}</span>
                  </div>

                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      background: isDelivered ? "#dcfce7" : "#fef3c7",
                      color: isDelivered ? "#15803d" : "#b45309"
                    }}
                  >
                    {isDelivered ? "Delivered" : "In Transit"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#475569" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={15} color="#94a3b8" />
                    <span>Receiver: <strong style={{ color: "#0f172a" }}>{shipment.receiverName || "N/A"}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} color="#94a3b8" />
                    <span>Destination: {shipment.deliveryAddress || "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 30, borderRadius: 16, background: "#ffffff", border: "1px solid #e2e8f0", color: "#94a3b8", textAlign: "center", gridColumn: "1 / -1" }}>
            <Package size={36} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div>No delivery records found.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Deliveries;
