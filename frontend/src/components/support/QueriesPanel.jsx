import { useState, useEffect, useCallback } from "react";
import ChatThread from "./ChatThread";
import { fetchAllQueries, resolveChat } from "../../services/supportService";
import { connectToSupportChat, disconnectSupportChat } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";

function QueriesPanel() {
    const { user } = useAuth();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [openQuery, setOpenQuery] = useState(null);

    const loadQueries = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await fetchAllQueries();
            setQueries(data);
            setOpenQuery((current) => (current ? data.find((q) => q.id === current.id) ?? current : current));
        } catch {
            setError("Failed to load queries.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => { loadQueries(); }, [loadQueries]);

    useEffect(() => {
        const openId = openQuery?.id;
        if (!openId) return;
        connectToSupportChat(openId, () => {
            loadQueries(true);
        });
        return () => disconnectSupportChat();
    }, [openQuery?.id, loadQueries]);

    const handleResolve = async (id) => {
        try {
            await resolveChat(id);
            loadQueries(true);
        } catch {
            setError("Failed to resolve the conversation.");
        }
    };

    const filtered = filter === "ALL" ? queries : queries.filter((q) => q.status === filter);

    return (
        <div className="recent-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Customer Conversations</h4>
                <div className="btn-group">
                    {["ALL", "ACTIVE", "RESOLVED"].map((f) => (
                        <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setFilter(f)}>
                            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <p className="text-muted">Loading conversations...</p>}

            {!loading && filtered.length === 0 && <p className="text-muted mb-0">No conversations found.</p>}

            {!loading && filtered.length > 0 && (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Subject</th>
                                <th>Tracking #</th>
                                <th>Status</th>
                                <th>Last Activity</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((q) => (
                                <tr key={q.id}>
                                    <td>{q.customerName}</td>
                                    <td>{q.customerEmail}</td>
                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.subject}</td>
                                    <td>{q.trackingNumber || "-"}</td>
                                    <td>
                                        <span className={`badge ${q.status === "ACTIVE" ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"}`}>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td>{q.lastMessageAt ? new Date(q.lastMessageAt).toLocaleString() : "-"}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-primary" onClick={() => setOpenQuery(q)}>
                                                <i className="bi bi-chat-dots me-1"></i>Open Chat
                                            </button>
                                            {q.status === "ACTIVE" && (
                                                <button className="btn btn-sm btn-success" onClick={() => handleResolve(q.id)}>
                                                    <i className="bi bi-check2-circle me-1"></i>Resolve
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {openQuery && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {openQuery.subject}
                                    {openQuery.trackingNumber && <small className="text-muted ms-2">#{openQuery.trackingNumber}</small>}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setOpenQuery(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-2 small text-muted">
                                    <strong>From:</strong> {openQuery.customerName} ({openQuery.customerEmail})
                                </p>
                                <ChatThread
                                    query={openQuery}
                                    currentUser={user}
                                    onChanged={() => loadQueries(true)}
                                    onError={setError}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setOpenQuery(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QueriesPanel;
