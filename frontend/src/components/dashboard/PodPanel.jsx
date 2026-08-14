import { useEffect, useState } from "react";
import { getPodStatusLabel, getPodStatusBadgeClass, getPodMethodLabel, POD_STATUSES } from "../../utils/constants";
import { fetchAllPods } from "../../services/podService";
import PodVerifyModal from "./PodVerifyModal";

function PodPanel({ onDataChanged }) {
    const [pods, setPods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [verifyPod, setVerifyPod] = useState(null);

    const loadPods = async () => {
        try {
            const data = await fetchAllPods();
            setPods(data);
        } catch {
            setError("Could not load proof of delivery records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPods();
    }, []);

    const handleVerified = () => {
        loadPods();
        if (onDataChanged) onDataChanged();
    };

    const filtered = filter === "ALL" ? pods : pods.filter((p) => p.verificationStatus === filter);

    return (
        <div className="recent-card">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h4 className="mb-0">Proof of Delivery</h4>
                <div className="d-flex align-items-center gap-2">
                    <label className="text-muted small mb-0">Filter:</label>
                    <select className="form-select form-select-sm" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="ALL">All</option>
                        {POD_STATUSES.map((status) => (
                            <option key={status} value={status}>{getPodStatusLabel(status)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <p className="text-muted">Loading proof of delivery records...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && filtered.length === 0 && <p className="text-muted mb-0">No proof of delivery records found.</p>}

            {!loading && !error && filtered.length > 0 && (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Tracking ID</th>
                                <th>Recipient</th>
                                <th>Method</th>
                                <th>Captured By</th>
                                <th>Captured</th>
                                <th>Delivered</th>
                                <th>Status</th>
                                <th>Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((pod) => (
                                <tr key={pod.id}>
                                    <td>{pod.trackingNumber}</td>
                                    <td>{pod.recipientName}</td>
                                    <td>
                                        <span className="badge bg-secondary-subtle text-secondary">{getPodMethodLabel(pod.method)}</span>
                                    </td>
                                    <td>{pod.capturedByName || "-"}</td>
                                    <td>{pod.capturedAt ? new Date(pod.capturedAt).toLocaleString() : "-"}</td>
                                    <td>{pod.deliveredAt ? new Date(pod.deliveredAt).toLocaleString() : "-"}</td>
                                    <td>
                                        <span className={`badge ${getPodStatusBadgeClass(pod.verificationStatus)}`}>
                                            {getPodStatusLabel(pod.verificationStatus)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => setVerifyPod(pod)} title="View & Verify Signature">
                                            <i className="bi bi-patch-check me-1"></i>View / Verify
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {verifyPod && (
                <PodVerifyModal pod={verifyPod} onVerified={handleVerified} onClose={() => setVerifyPod(null)} />
            )}
        </div>
    );
}

export default PodPanel;
