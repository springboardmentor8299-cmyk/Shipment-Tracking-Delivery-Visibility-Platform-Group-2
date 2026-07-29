import { lazy, Suspense, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import CurrentShipment from "../../components/customer/CurrentShipment";
import ShipmentTracker from "../../components/customer/ShipmentTracker";
import MyOrders from "../../components/customer/MyOrders";
import { track } from "../../services/shipmentService";
import { submitQuery, fetchMyQueries } from "../../services/supportService";

const TrackingMapView = lazy(() => import("../../components/maps/TrackingMapView"));

function CustomerDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [trackingInput, setTrackingInput] = useState("");
    const [resolvedId, setResolvedId] = useState(null);
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackError, setTrackError] = useState("");

    const [supportForm, setSupportForm] = useState({ subject: "", message: "", trackingNumber: "" });
    const [myQueries, setMyQueries] = useState([]);
    const [queriesLoading, setQueriesLoading] = useState(false);
    const [supportSubmitting, setSupportSubmitting] = useState(false);
    const [supportSuccess, setSupportSuccess] = useState("");
    const [supportError, setSupportError] = useState("");

    useEffect(() => {
        loadMyQueries();
    }, []);

    const loadMyQueries = async () => {
        setQueriesLoading(true);
        try {
            const data = await fetchMyQueries();
            setMyQueries(data);
        } catch {
            // silent
        } finally {
            setQueriesLoading(false);
        }
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        if (!supportForm.subject.trim() || !supportForm.message.trim()) return;
        setSupportSubmitting(true);
        setSupportError("");
        setSupportSuccess("");
        try {
            await submitQuery({
                subject: supportForm.subject,
                message: supportForm.message,
                trackingNumber: supportForm.trackingNumber || undefined,
            });
            setSupportSuccess("Your query has been submitted. Support will respond shortly.");
            setSupportForm({ subject: "", message: "", trackingNumber: "" });
            loadMyQueries();
        } catch {
            setSupportError("Failed to submit query. Please try again.");
        } finally {
            setSupportSubmitting(false);
        }
    };

const tabs = [
        { key: "dashboard", label: "Dashboard" },
        { key: "orders", label: "My Orders" },
        { key: "tracking", label: "Track Shipment" },
        { key: "live", label: "Live Tracking" },
        { key: "support", label: "Support" },
    ];

    const handleTrackSubmit = async (e) => {
        e.preventDefault();
        const val = trackingInput.trim();
        if (!val) return;
        setTrackLoading(true);
        setTrackError("");
        setResolvedId(null);
        try {
            const shipment = await track(val);
            setResolvedId(shipment.id);
        } catch {
            setTrackError("No shipment found with that tracking number.");
        } finally {
            setTrackLoading(false);
        }
    };

    return (
        <>
            <CustomerNavbar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="container py-5" style={{ maxWidth: "1400px" }}>
                <div className="mb-5">
                    <h2 className="fw-bold" style={{ color: "var(--brand-primary)" }}>
                        Welcome Back, {user?.name || "Customer"}
                    </h2>
                    <p className="text-muted">
                        Manage your shipments and track deliveries in real time.
                    </p>
                </div>

                <ul className="nav nav-pills mb-4 gap-2">
                    {tabs.map((tab) => (
                        <li className="nav-item" key={tab.key}>
                            <button
                                className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                                style={{
                                    background: activeTab === tab.key ? "var(--brand-primary)" : "transparent",
                                    color: activeTab === tab.key ? "#fff" : "var(--brand-primary)",
                                    border: "1px solid var(--brand-primary)",
                                    borderRadius: "8px",
                                    padding: "8px 20px",
                                    fontWeight: 600,
                                }}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {activeTab === "dashboard" && (
                    <div className="row g-4">
                        <div className="col-lg-5"><CurrentShipment /></div>
                        <div className="col-lg-7"><ShipmentTracker /></div>
                    </div>
                )}
                {activeTab === "orders" && <MyOrders />}
                {activeTab === "tracking" && (
                    <div className="row justify-content-center">
                        <div className="col-lg-8"><ShipmentTracker /></div>
                    </div>
                )}
                {activeTab === "live" && (
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h4 className="fw-bold mb-3" style={{ color: "var(--brand-primary)" }}>
                                    Live Tracking
                                </h4>
                                <form onSubmit={handleTrackSubmit} className="input-group mb-4">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Enter Tracking Number (e.g. TRK123456)..."
                                        value={trackingInput}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                    />
                                    <button className="btn btn-primary px-4" type="submit" disabled={trackLoading}>
                                        {trackLoading ? "Searching..." : "Track"}
                                    </button>
                                </form>
                                {trackError && (
                                    <div className="alert alert-danger mb-4">{trackError}</div>
                                )}
                                {trackLoading && (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
                                {resolvedId ? (
                                    <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading tracking...</span></div></div>}>
                                        <TrackingMapView shipmentId={resolvedId} />
                                    </Suspense>
                                ) : !trackLoading && !trackError ? (
                                    <p className="text-muted">Enter a tracking number above to view live tracking.</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
)}
                {activeTab === "support" && (
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                <h4 className="fw-bold mb-3" style={{ color: "var(--brand-primary)" }}>Contact Support</h4>
                                {supportSuccess && <div className="alert alert-success">{supportSuccess}</div>}
                                {supportError && <div className="alert alert-danger">{supportError}</div>}
                                <form onSubmit={handleSupportSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Subject</label>
                                        <input type="text" className="form-control" value={supportForm.subject} onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })} placeholder="Brief subject" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Message</label>
                                        <textarea className="form-control" rows="4" value={supportForm.message} onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })} placeholder="Describe your issue..." required></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted">Tracking Number (optional)</label>
                                        <input type="text" className="form-control" value={supportForm.trackingNumber} onChange={(e) => setSupportForm({ ...supportForm, trackingNumber: e.target.value })} placeholder="e.g. TRK123456" />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={supportSubmitting}>
                                        {supportSubmitting ? "Submitting..." : "Submit Query"}
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                <h4 className="fw-bold mb-3" style={{ color: "var(--brand-primary)" }}>My Queries</h4>
                                {queriesLoading ? (
                                    <p className="text-muted">Loading...</p>
                                ) : myQueries.length === 0 ? (
                                    <p className="text-muted">No queries submitted yet.</p>
                                ) : (
                                    <div className="list-group">
                                        {myQueries.map((q) => (
                                            <div key={q.id} className="list-group-item">
                                                <div className="d-flex justify-content-between">
                                                    <strong>{q.subject}</strong>
                                                    <span className={`badge ${q.status === "PENDING" ? "bg-warning" : "bg-success"}`}>{q.status}</span>
                                                </div>
                                                <p className="mb-1 small text-muted mt-1">{q.message}</p>
                                                {q.response && (
                                                    <div className="mt-2 p-2 bg-light rounded">
                                                        <small className="fw-semibold">Response:</small>
                                                        <p className="mb-0 small">{q.response}</p>
                                                        {q.respondedByName && <small className="text-muted">— {q.respondedByName}</small>}
                                                    </div>
                                                )}
                                                <small className="text-muted">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ""}</small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default CustomerDashboard;
