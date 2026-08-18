import React from "react";
import ExportButton from "../common/ExportButton";

export function PlatformControlHeader({ username = "Admin" }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1e293b 100%)",
        color: "#ffffff",
        padding: "28px 32px",
        borderRadius: 24,
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
        marginBottom: 24,
        border: "1px solid #334155"
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: "4px 12px",
              borderRadius: 20,
              background: "rgba(59, 130, 246, 0.25)",
              color: "#93c5fd",
              border: "1px solid rgba(147, 197, 253, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.6px"
            }}
          >
            System Administrator
          </span>
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 6px 0",
            letterSpacing: "-0.5px"
          }}
        >
          Platform Control Center
        </h1>

        <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
          Welcome back, <strong>{username}</strong>. System status:{" "}
          <span style={{ color: "#34d399", fontWeight: 800 }}>100% Operational</span>
        </p>
      </div>

    </div>
  );
}

export default PlatformControlHeader;
