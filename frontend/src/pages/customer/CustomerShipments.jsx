import { useState } from "react";
import MyShipmentTable from "../../components/customer/MyShipmentTable";
import { Search } from "lucide-react";

function CustomerShipments() {
  const [query, setQuery] = useState("");

  return (
    <div style={{ display: "grid", gap: 24, paddingBottom: 48 }}>
      <div>
        <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          My Shipments & Package Tracking
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 14, fontWeight: 500 }}>
          View real-time status of your active packages and inspect verified Proof of Delivery (POD) records.
        </p>
      </div>

      <div style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '10px 16px', gap: 10, boxShadow: '0 2px 8px rgba(15,23,42,0.03)' }}>
          <Search size={18} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my shipments by tracking ID..."
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 14, color: '#0f172a' }}
          />
        </div>
      </div>

      <MyShipmentTable searchTerm={query} />
    </div>
  );
}

export default CustomerShipments;
