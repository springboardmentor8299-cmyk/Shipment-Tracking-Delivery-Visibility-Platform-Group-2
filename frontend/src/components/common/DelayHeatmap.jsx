import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function DelayHeatmap({ data = [] }) {
  const regions = data.length > 0 ? data : [
    { region: "North India (Delhi/NCR)", delayPercent: 4.2, status: "Low Risk" },
    { region: "South India (Bengaluru/Chennai)", delayPercent: 2.1, status: "Optimal" },
    { region: "West India (Mumbai/Pune)", delayPercent: 6.8, status: "Moderate Risk" },
    { region: "East India (Kolkata/Howrah)", delayPercent: 5.0, status: "Moderate Risk" }
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={20} color="#f59e0b" />
          Regional Delay Heatmap
        </h3>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Live Traffic Analytics</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {regions.map((r, idx) => {
          const isHigh = r.delayPercent >= 6.0;
          const isMedium = r.delayPercent >= 3.5 && r.delayPercent < 6.0;

          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                <span>{r.region}</span>
                <span style={{ color: isHigh ? "#e11d48" : isMedium ? "#d97706" : "#059669", fontWeight: 800 }}>
                  {r.delayPercent}% delay rate
                </span>
              </div>

              <div style={{ width: "100%", height: 10, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 5,
                    width: `${Math.min(r.delayPercent * 10, 100)}%`,
                    background: isHigh
                      ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                      : isMedium
                      ? "linear-gradient(90deg, #facc15, #f59e0b)"
                      : "linear-gradient(90deg, #34d399, #10b981)",
                    transition: "width 0.5s ease"
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DelayHeatmap;
