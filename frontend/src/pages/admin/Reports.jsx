import ShipmentTable from "../../components/admin/ShipmentTable";
import { FileText, Download } from "lucide-react";

function Reports() {
  const handleExport = () => {
    alert("Downloading shipment logistics report (CSV format)...");
  };

  return (
    <div className="admin-dashboard">
      <div className="customer-dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>Logistics Reports</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>Generate, review, and export comprehensive delivery reports.</p>
        </div>

        <button
          onClick={handleExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #1e40af, #2563eb)",
            color: "#ffffff",
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
          }}
        >
          <Download size={16} /> Export Report (CSV)
        </button>
      </div>

      <ShipmentTable />
    </div>
  );
}

export default Reports;
