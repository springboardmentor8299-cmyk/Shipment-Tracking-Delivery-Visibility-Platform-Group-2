import React, { useEffect, useState } from "react";
import {
  Search,
  CheckCircle2,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import axios from "axios";
import { getStoredAuth } from "../../utils/auth";
import { useNotifications } from "../../context/NotificationContext";
import { getSupportIssues, resolveSupportIssue } from "../../services/shipmentService";

export function SupportDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [disputedPods, setDisputedPods] = useState([]);
  const [supportIssues, setSupportIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Issues Filter State
  const [issueFilter, setIssueFilter] = useState("ALL"); // ALL, PENDING, IN_PROGRESS, RESOLVED
  const [issueSearch, setIssueSearch] = useState("");

  // Query Resolution Modal State
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState("RESOLVED");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    setLoading(true);
    try {
      const auth = getStoredAuth();
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};

      const [analyticsRes, disputedRes, issuesData] = await Promise.all([
        axios.get("http://localhost:8080/api/analytics/support", { headers }).catch(() => ({ data: null })),
        axios.get("http://localhost:8080/api/pod/disputed", { headers }).catch(() => ({ data: [] })),
        getSupportIssues()
      ]);

      setAnalytics(analyticsRes.data);
      setDisputedPods(disputedRes.data || []);
      setSupportIssues(issuesData || []);
    } catch (err) {
      console.error("Error fetching support data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#64748b", fontSize: 14, fontWeight: 600 }}>
        <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 12, color: "#2563eb" }} />
        <div>Loading Customer Support Center...</div>
      </div>
    );
  }

  const activeIssuesCount = supportIssues.filter(i => (i.status || "").toUpperCase() === "PENDING" || (i.status || "").toUpperCase() === "IN_PROGRESS").length;

  return (
    <div style={{ paddingBottom: 48, display: "grid", gap: 24 }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          borderRadius: 24,
          padding: "28px 32px",
          boxShadow: "0 10px 25px rgba(15,23,42,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "rgba(147, 51, 234, 0.25)", color: "#c084fc", border: "1px solid rgba(192, 132, 252, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Customer Service & Claims Hub
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", margin: "8px 0 4px 0", letterSpacing: "-0.5px" }}>
            Support Agent Command Center
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
            Resolve customer queries, verify disputed POD claims, and perform global fleet audits.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={fetchSupportData}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <RefreshCw size={15} /> Refresh Center
          </button>
          <div style={{ background: "rgba(16, 185, 129, 0.2)", padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: 13, fontWeight: 700, color: "#a7f3d0" }}>
            SLA Performance: <span style={{ color: "#34d399", fontWeight: 800 }}>{analytics?.slaMetPercentage || 98.4}%</span>
          </div>
        </div>
      </div>

      {/* Support KPIs Metric Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ padding: 20, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Raised Queries</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#2563eb", marginTop: 4 }}>{activeIssuesCount}</div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{activeIssuesCount > 0 ? `${activeIssuesCount} Open Tickets` : "All Tickets Clear"}</div>
        </div>

        <div style={{ padding: 20, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Open POD Disputes</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#e11d48", marginTop: 4 }}>{analytics?.openDisputesCount || disputedPods.length}</div>
          <div style={{ fontSize: 12, color: "#e11d48", fontWeight: 600, marginTop: 2 }}>Recipient claims review</div>
        </div>

        <div style={{ padding: 20, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Resolved Today</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#166534", marginTop: 4 }}>{analytics?.resolvedTodayCount || 14}</div>
          <div style={{ fontSize: 12, color: "#166534", fontWeight: 600, marginTop: 2 }}>+6 Closed tickets</div>
        </div>

        <div style={{ padding: 20, borderRadius: 20, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg SLA Resolution</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#b45309", marginTop: 4 }}>{analytics?.avgResolutionTimeMins || 28}m</div>
          <div style={{ fontSize: 12, color: "#b45309", fontWeight: 600, marginTop: 2 }}>Target &lt; 45 mins</div>
        </div>
      </div>

      {/* CUSTOMER RAISED SUPPORT ISSUES & QUERIES */}
      <div style={{ background: "#ffffff", borderRadius: 24, padding: 28, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, borderBottom: "1.5px solid #f1f5f9", paddingBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Customer Raised Support Issues & Queries</h2>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                {activeIssuesCount} Active Open Tickets
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", fontWeight: 500 }}>
              Review customer service tickets logged from customer portal, answer queries, and mark issues as resolved.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: 220 }}>
              <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: 11 }} />
              <input
                type="text"
                placeholder="Search by tracking ID or email..."
                value={issueSearch}
                onChange={(e) => setIssueSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: 12,
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 4, borderRadius: 12 }}>
              {[
                { id: "ALL", label: "All Tickets" },
                { id: "PENDING", label: "Open / Pending" },
                { id: "IN_PROGRESS", label: "In Progress" },
                { id: "RESOLVED", label: "Resolved" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setIssueFilter(f.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: issueFilter === f.id ? "#ffffff" : "transparent",
                    color: issueFilter === f.id ? "#2563eb" : "#64748b",
                    boxShadow: issueFilter === f.id ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets Cards List */}
        {supportIssues.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
            <MessageSquare size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
            <div>No customer support issues logged in system.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {supportIssues
              .filter((issue) => {
                const q = issueSearch.toLowerCase().trim();
                const matchesQuery =
                  !q ||
                  (issue.subject || "").toLowerCase().includes(q) ||
                  (issue.trackingId || "").toLowerCase().includes(q) ||
                  (issue.customerEmail || "").toLowerCase().includes(q) ||
                  (issue.customerUsername || "").toLowerCase().includes(q);

                if (!matchesQuery) return false;
                const st = (issue.status || "").toUpperCase();
                if (issueFilter === "ALL") return true;
                if (issueFilter === "PENDING") return st === "PENDING";
                if (issueFilter === "IN_PROGRESS") return st === "IN_PROGRESS";
                if (issueFilter === "RESOLVED") return st === "RESOLVED";
                return true;
              })
              .map((issue) => {
                const st = (issue.status || "").toUpperCase();
                const isPending = st === "PENDING" || st === "IN_PROGRESS";
                const isResolved = st === "RESOLVED";

                return (
                  <div
                    key={issue.id}
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      background: isPending ? "#fffdf5" : "#f8fafc",
                      border: `1.5px solid ${isPending ? "#fde68a" : "#e2e8f0"}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12
                    }}
                  >
                    {/* Ticket Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Ticket #{issue.id}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}>
                          {issue.requestType || "ISSUE"}
                        </span>
                        {issue.trackingId && issue.trackingId !== "-" && (
                          <span style={{ fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 8, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                            Tracking: #{issue.trackingId}
                          </span>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "4px 14px",
                          borderRadius: 20,
                          background: isResolved ? "#dcfce7" : st === "IN_PROGRESS" ? "#eff6ff" : "#fef3c7",
                          color: isResolved ? "#166534" : st === "IN_PROGRESS" ? "#1d4ed8" : "#b45309",
                          border: `1px solid ${isResolved ? "#86efac" : st === "IN_PROGRESS" ? "#93c5fd" : "#fde68a"}`
                        }}
                      >
                        {issue.status}
                      </span>
                    </div>

                    {/* Subject */}
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>{issue.subject}</h4>

                    {/* Description */}
                    {issue.description && (
                      <p style={{ fontSize: 13, color: "#334155", background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", margin: 0, lineHeight: 1.5 }}>
                        "{issue.description}"
                      </p>
                    )}

                    {/* Meta Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 12, fontSize: 12, color: "#64748b" }}>
                      <div>
                        Customer: <strong style={{ color: "#0f172a", fontWeight: 700 }}>{issue.customerUsername || "Client"}</strong> ({issue.customerEmail || "N/A"})
                      </div>

                      {issue.resolutionNotes && (
                        <div style={{ background: "#ecfdf5", color: "#047857", padding: "4px 12px", borderRadius: 8, border: "1px solid #a7f3d0", fontWeight: 600 }}>
                          Notes: "{issue.resolutionNotes}"
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8 }}>
                        {isPending ? (
                          <button
                            onClick={() => {
                              setResolvingIssue(issue);
                              setResolutionStatus("RESOLVED");
                              setResolutionNotes(issue.resolutionNotes || "");
                            }}
                            style={{
                              padding: "8px 18px",
                              borderRadius: 10,
                              border: "none",
                              background: "#2563eb",
                              color: "#ffffff",
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6
                            }}
                          >
                            <CheckCircle2 size={15} /> Resolve Query
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setResolvingIssue(issue);
                              setResolutionStatus(issue.status);
                              setResolutionNotes(issue.resolutionNotes || "");
                            }}
                            style={{
                              padding: "8px 16px",
                              borderRadius: 10,
                              border: "1.5px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#334155",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            View / Edit Notes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Query Resolution Modal */}
      {resolvingIssue && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 }}>
          <div style={{ background: "#ffffff", borderRadius: 24, padding: 28, maxWidth: 520, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0", display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Resolve Customer Query</h3>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Ticket #{resolvingIssue.id} | {resolvingIssue.customerEmail}</div>
              </div>
              <button
                onClick={() => setResolvingIssue(null)}
                style={{ border: "none", background: "transparent", fontSize: 20, fontWeight: 800, color: "#94a3b8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 14, fontSize: 13 }}>
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <span style={{ fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>Subject: {resolvingIssue.subject}</span>
                <div style={{ color: "#475569", fontStyle: "italic" }}>"{resolvingIssue.description}"</div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 700, color: "#334155" }}>Update Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: 13, fontWeight: 600, outline: "none" }}
                >
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 700, color: "#334155" }}>Support Agent Resolution Notes</label>
                <textarea
                  rows={4}
                  placeholder="Enter details of action taken or response for customer..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
              <button
                onClick={() => setResolvingIssue(null)}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff", color: "#334155", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await resolveSupportIssue(resolvingIssue.id, resolutionStatus, resolutionNotes);
                    addNotification({
                      title: `Support Query ${resolutionStatus}: #${resolvingIssue.id}`,
                      message: `Query regarding "${resolvingIssue.subject}" updated to ${resolutionStatus} by Support Agent.`,
                      category: "GENERAL",
                      trackingNumber: resolvingIssue.trackingId || ""
                    });
                    alert(`Customer query #${resolvingIssue.id} updated to ${resolutionStatus}!`);
                    setResolvingIssue(null);
                    fetchSupportData();
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update query status.");
                  }
                }}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#2563eb", color: "#ffffff", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}
              >
                Save & Update Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportDashboard;
