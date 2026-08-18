import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function AnalyticsCard({ title, value, change, subtitle, icon: Icon, color = "blue" }) {
  const getGradient = () => {
    switch (color) {
      case "emerald":
      case "green":
        return "from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-200";
      case "amber":
      case "yellow":
        return "from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-200";
      case "rose":
      case "red":
        return "from-rose-500/10 to-pink-500/5 text-rose-600 border-rose-200";
      case "purple":
      case "indigo":
        return "from-purple-500/10 to-indigo-500/5 text-purple-600 border-purple-200";
      default:
        return "from-blue-500/10 to-cyan-500/5 text-blue-600 border-blue-200";
    }
  };

  const isPositive = change && String(change).startsWith("+");
  const isNegative = change && String(change).startsWith("-");

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            {value}
          </span>
          {change && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 12,
                display: "inline-flex",
                alignItems: "center",
                background: isPositive ? "#dcfce7" : isNegative ? "#ffe4e6" : "#f1f5f9",
                color: isPositive ? "#15803d" : isNegative ? "#be123c" : "#475569"
              }}
            >
              {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : isNegative ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
              {change}
            </span>
          )}
        </div>
        {subtitle && <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{subtitle}</span>}
      </div>

      {Icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: color === "emerald" || color === "green" ? "#dcfce7" : color === "amber" ? "#fef3c7" : color === "rose" ? "#ffe4e6" : "rgba(37, 99, 235, 0.1)",
            color: color === "emerald" || color === "green" ? "#16a34a" : color === "amber" ? "#d97706" : color === "rose" ? "#dc2626" : "#2563eb"
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}

export default AnalyticsCard;
