import { useState } from "react";
import ShipmentTable from "../../components/admin/ShipmentTable";
import CreateShipment from "../../components/admin/CreateShipment";
import { Search, Plus, X } from "lucide-react";

function Shipments() {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="admin-dashboard space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>Shipments & Proof of Delivery Log</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Create, edit, delete, and inspect proof of delivery records for all fleet shipments.</p>
        </div>

        <button
          onClick={() => setShowCreate(prev => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow transition ${
            showCreate ? "bg-slate-200 text-slate-800 hover:bg-slate-300" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showCreate ? <X size={16} /> : <Plus size={16} />}
          {showCreate ? "Close Create Form" : "Create New Shipment"}
        </button>
      </div>

      {showCreate && (
        <CreateShipment
          onCreated={() => {
            setShowCreate(false);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      <div style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', gap: 10, boxShadow: '0 2px 6px rgba(15,23,42,0.03)' }}>
          <Search size={18} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shipments by tracking ID, sender, receiver..."
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 14, color: '#0f172a' }}
          />
        </div>
      </div>

      <ShipmentTable key={refreshKey} searchTerm={query} />
    </div>
  );
}

export default Shipments;
