import React, { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { Bell, CheckCircle2, Truck, Package, AlertCircle, Trash2, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CustomerNotifications() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  const filtered = notifications.filter(n => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "REQUESTS") return n.category === "SHIPMENT_REQUEST";
    if (filter === "STATUS") return n.category === "STATUS_UPDATE";
    if (filter === "POD") return n.category === "POD_CONFIRMED";
    return true;
  });

  const getIcon = (cat) => {
    switch (cat) {
      case "POD_CONFIRMED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "STATUS_UPDATE":
        return <Truck className="w-5 h-5 text-amber-600" />;
      case "SHIPMENT_REQUEST":
        return <Package className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 uppercase tracking-wider">
            Live Activity Feed
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Notifications Hub</h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium">
            Real-time delivery status updates, POD confirmations, and shipment request alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
          <button
            onClick={clearNotifications}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-bold rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "ALL", label: "All Activity" },
          { id: "UNREAD", label: "Unread Only" },
          { id: "REQUESTS", label: "Shipment Requests" },
          { id: "STATUS", label: "Status Updates" },
          { id: "POD", label: "POD Confirmations" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs">
            No notifications found in this category.
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                !n.read ? "bg-blue-50/40 border-blue-200" : "bg-slate-50/50 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm mt-0.5">
                  {getIcon(n.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    {!n.read && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{n.message}</p>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {n.trackingNumber && (
                <button
                  onClick={() => navigate(`/customer/track/${n.trackingNumber}`)}
                  className="px-3.5 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  Track Shipment #{n.trackingNumber}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerNotifications;
