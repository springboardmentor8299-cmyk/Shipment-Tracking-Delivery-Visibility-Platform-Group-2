import { useState } from "react";
import { track } from "../../services/shipmentService";
import { getStatusLabel } from "../../utils/constants";

function ShipmentTracker() {

    const [trackingId, setTrackingId] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTrack = async (e) => {

        e.preventDefault();

        if (!trackingId.trim()) {
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {

            const shipment = await track(trackingId.trim());
            setResult(shipment);

        } catch (err) {

            setError(err.response?.data?.message || "No shipment found with that tracking ID.");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

                <h3
                    className="fw-bold mb-3"
                    style={{ color: "var(--brand-primary)" }}
                >
                    🔍 Track Shipment
                </h3>

                <p className="text-muted">
                    Enter your tracking ID to view the latest shipment status.
                </p>

                <form onSubmit={handleTrack}>

                    <div className="mb-3">

                        <label className="form-label fw-semibold">
                            Tracking ID
                        </label>

                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Example : TRK123456"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn bluebtn w-100 py-2"
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Track Shipment"}
                    </button>

                </form>

                {error && (
                    <div className="alert alert-danger mt-3 mb-0">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-4 p-3 rounded-4" style={{ background: "var(--brand-bg-light)" }}>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-bold mb-0">{result.trackingNumber}</h6>
                            <span className="badge bg-primary rounded-pill px-3 py-2">
                                {getStatusLabel(result.status)}
                            </span>
                        </div>

                        <p className="mb-1"><strong>From:</strong> {result.senderName}</p>
                        <p className="mb-1"><strong>Sender Address:</strong> {result.senderAddress}</p>
                        <p className="mb-1"><strong>To:</strong> {result.receiverName}</p>
                        <p className="mb-1"><strong>Receiver Address:</strong> {result.deliveryAddress}</p>

                        <div className="progress mt-3" style={{ height: "8px" }}>
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${result.progressPercent}%`,
                                    background: "var(--brand-primary)"
                                }}
                            />
                        </div>

                        {result.events && result.events.length > 0 && (
                            <ul className="list-unstyled mt-3 mb-0 small text-muted">
                                {result.events.map((event) => (
                                    <li key={event.id} className="mb-1">
                                        • {getStatusLabel(event.status)}
                                        {event.recordedAt ? ` — ${new Date(event.recordedAt).toLocaleString()}` : ""}
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>
                )}

                <hr className="my-4" />

                <h6
                    className="fw-bold"
                    style={{ color: "var(--brand-primary)" }}
                >
                    Quick Tips
                </h6>

                <ul className="text-muted">
                    <li>Tracking IDs start with <b>TRK</b>.</li>
                    <li>Example: <b>TRK123456</b>.</li>
                    <li>Updates are refreshed in real time.</li>
                </ul>

            </div>

        </div>

    );

}

export default ShipmentTracker;
