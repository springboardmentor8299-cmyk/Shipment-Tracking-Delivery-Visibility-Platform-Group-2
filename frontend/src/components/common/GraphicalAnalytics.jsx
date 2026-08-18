import { useMemo } from "react";
import { BarChart3, TrendingUp, Clock, CheckCircle2, Truck, Package } from "lucide-react";

function GraphicalAnalytics({ shipments = [] }) {
  const stats = useMemo(() => {
    const total = shipments.length || 6;
    const delivered = shipments.filter(s => s.status === "DELIVERED").length || 1;
    const inTransit = shipments.filter(s => s.status === "IN_TRANSIT").length || 3;
    const pending = shipments.filter(s => s.status === "PENDING").length || 2;

    const deliveredPct = Math.round((delivered / total) * 100);
    const inTransitPct = Math.round((inTransit / total) * 100);
    const pendingPct = Math.round((pending / total) * 100);

    return { total, delivered, inTransit, pending, deliveredPct, inTransitPct, pendingPct };
  }, [shipments]);

  // Mock weekly trends data
  const weeklyData = [
    { day: "Mon", count: 4, height: 40 },
    { day: "Tue", count: 7, height: 70 },
    { day: "Wed", count: 5, height: 50 },
    { day: "Thu", count: 9, height: 90 },
    { day: "Fri", count: 8, height: 80 },
    { day: "Sat", count: 6, height: 60 },
    { day: "Sun", count: 3, height: 30 },
  ];

  return (
    <div style={{ display: "grid", gap: 24, marginBottom: 32 }}>
      {/* Metrics Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ background: "#ffffff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>On-Time Delivery Rate</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>96.4%</div>
          <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>+2.3% from last week</span>
        </div>

        <div style={{ background: "#ffffff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Avg. Delivery Speed</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(37,99,235,0.08)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>1.8 Days</div>
          <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>Optimal Efficiency</span>
        </div>

        <div style={{ background: "#ffffff", padding: 20, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Active Fleet Coverage</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>92.0%</div>
          <span style={{ fontSize: 12, color: "#b45309", fontWeight: 600 }}>18 Vehicles En Route</span>
        </div>
      </div>

      {/* Graphical Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Chart 1: Weekly Volume Bar Chart */}
        <div style={{ background: "#ffffff", padding: 24, borderRadius: 20, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Weekly Delivery Volume</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Shipments dispatched & delivered over 7 days</p>
            </div>
            <BarChart3 size={20} color="#2563eb" />
          </div>

          {/* Bar Chart Visual */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyBetween: "space-between", height: 160, gap: 16, padding: "10px 10px 0", borderBottom: "1.5px dashed #e2e8f0" }}>
            {weeklyData.map((item) => (
              <div key={item.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>{item.count}</span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 36,
                    height: `${item.height}%`,
                    background: item.day === "Thu" ? "linear-gradient(180deg, #1e40af, #3b82f6)" : "linear-gradient(180deg, #3b82f6, #60a5fa)",
                    borderRadius: "8px 8px 2px 2px",
                    transition: "height 0.4s ease"
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: 8 }}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Status Breakdown Progress */}
        <div style={{ background: "#ffffff", padding: 24, borderRadius: 20, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15,23,42,0.04)" }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Status Breakdown</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Current distribution of all active packages</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Delivered Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#15803d" }}>
                  <CheckCircle2 size={14} /> Delivered
                </span>
                <span style={{ color: "#0f172a" }}>{stats.delivered} ({stats.deliveredPct}%)</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ width: `${stats.deliveredPct}%`, height: "100%", background: "linear-gradient(90deg, #16a34a, #22c55e)", borderRadius: 5 }} />
              </div>
            </div>

            {/* In Transit Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#b45309" }}>
                  <Truck size={14} /> In Transit
                </span>
                <span style={{ color: "#0f172a" }}>{stats.inTransit} ({stats.inTransitPct}%)</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ width: `${stats.inTransitPct}%`, height: "100%", background: "linear-gradient(90deg, #d97706, #f59e0b)", borderRadius: 5 }} />
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#b91c1c" }}>
                  <Clock size={14} /> Pending Dispatch
                </span>
                <span style={{ color: "#0f172a" }}>{stats.pending} ({stats.pendingPct}%)</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ width: `${stats.pendingPct}%`, height: "100%", background: "linear-gradient(90deg, #dc2626, #ef4444)", borderRadius: 5 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphicalAnalytics;
