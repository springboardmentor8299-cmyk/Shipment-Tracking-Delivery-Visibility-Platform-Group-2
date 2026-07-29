import { useState, useEffect } from "react";
import { fetchAllQueries, respond } from "../../services/supportService";

function QueriesPanel() {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [respondId, setRespondId] = useState(null);
    const [responseText, setResponseText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadQueries = async () => {
        setLoading(true);
        try {
            const data = await fetchAllQueries();
            setQueries(data);
        } catch {
            setError("Failed to load queries.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadQueries(); }, []);

    const handleRespond = async (id) => {
        if (!responseText.trim()) return;
        setSubmitting(true);
        try {
            await respond(id, { response: responseText });
            setRespondId(null);
            setResponseText("");
            loadQueries();
        } catch {
            setError("Failed to submit response.");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = filter === "ALL" ? queries : queries.filter((q) => q.status === filter);

    return (
        <div className="recent-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Customer Queries</h4>
                <div className="btn-group">
                    {["ALL", "PENDING", "RESOLVED"].map((f) => (
                        <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setFilter(f)}>
                            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <p className="text-muted">Loading queries...</p>}

            {!loading && filtered.length === 0 && <p className="text-muted mb-0">No queries found.</p>}

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
                                <th>Date</th>
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
                                        <span className={`badge ${q.status === "PENDING" ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"}`}>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td>{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-"}</td>
                                    <td>
                                        {q.status === "PENDING" ? (
                                            <button className="btn btn-sm btn-primary" onClick={() => setRespondId(q.id)}>Respond</button>
                                        ) : (
                                            <small className="text-muted">Resolved{q.respondedByName ? ` by ${q.respondedByName}` : ""}</small>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {respondId && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Respond to Query</h5>
                                <button type="button" className="btn-close" onClick={() => { setRespondId(null); setResponseText(""); }}></button>
                            </div>
                            <div className="modal-body">
                                {(() => {
                                    const q = queries.find((x) => x.id === respondId);
                                    if (!q) return null;
                                    return (
                                        <>
                                            <div className="mb-3 p-3 bg-light rounded">
                                                <p className="mb-1"><strong>From:</strong> {q.customerName} ({q.customerEmail})</p>
                                                <p className="mb-1"><strong>Subject:</strong> {q.subject}</p>
                                                {q.trackingNumber && <p className="mb-1"><strong>Tracking:</strong> {q.trackingNumber}</p>}
                                                <hr />
                                                <p className="mb-0">{q.message}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">Your Response</label>
                                                <textarea className="form-control" rows="4" value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Type your response..."></textarea>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setRespondId(null); setResponseText(""); }}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => handleRespond(respondId)} disabled={submitting || !responseText.trim()}>
                                    {submitting ? "Sending..." : "Send Response"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QueriesPanel;