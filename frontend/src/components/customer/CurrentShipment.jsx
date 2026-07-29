import { useEffect, useState } from "react";
import { fetchMyShipments } from "../../services/shipmentService";
import { getStatusLabel } from "../../utils/constants";

function CurrentShipment() {

    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadShipment = async () => {

            try {

                const shipments = await fetchMyShipments();

                // Most recent shipment that is not yet delivered/cancelled, or
                // simply the most recent one if everything is finished.
                const active = shipments.find(
                    (s) => s.status !== "DELIVERED" && s.status !== "CANCELLED"
                );

                setShipment(active || shipments[0] || null);

            } catch {

                setError("Could not load your current shipment.");

            } finally {

                setLoading(false);

            }

        };

        loadShipment();

    }, []);

    if (loading) {
        return (
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                    <p className="text-muted mb-0">Loading current shipment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                    <p className="text-danger mb-0">{error}</p>
                </div>
            </div>
        );
    }

    if (!shipment) {
        return (
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                    <h3
                        className="fw-bold mb-3"
                        style={{ color: "var(--brand-primary)" }}
                    >
                        📦 Current Shipment
                    </h3>
                    <p className="text-muted mb-0">
                        You don't have any shipments yet. Create one from "My Orders" below.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <h3
                        className="fw-bold mb-0"
                        style={{ color: "var(--brand-primary)" }}
                    >
                        📦 Current Shipment
                    </h3>

                    <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                            background: "var(--brand-primary-light)",
                            color: "var(--brand-primary)",
                            fontSize: "14px"
                        }}
                    >
                        Active
                    </span>

                </div>

                <div className="row">

                    <div className="col-6 mb-4">
                        <small className="text-muted">Tracking ID</small>
                        <h5 className="fw-bold">{shipment.trackingNumber}</h5>
                    </div>

                    <div className="col-6 mb-4">
                        <small className="text-muted">Status</small>
                        <br />
                        <span className="badge bg-primary rounded-pill px-3 py-2">
                            🚚 {getStatusLabel(shipment.status)}
                        </span>
                    </div>

                    <div className="col-6 mb-4">
                        <small className="text-muted">Sender</small>
                        <h6>{shipment.senderName}</h6>
                    </div>

                    <div className="col-6 mb-4">
                        <small className="text-muted">Sender Address</small>
                        <h6>{shipment.senderAddress}</h6>
                    </div>

                    <div className="col-6 mb-4">
                        <small className="text-muted">Receiver</small>
                        <h6>{shipment.receiverName}</h6>
                    </div>

                    <div className="col-6 mb-4">
                        <small className="text-muted">Receiver Address</small>
                        <h6>{shipment.deliveryAddress}</h6>
                    </div>

                </div>

                <hr />

                <div className="d-flex justify-content-between">
                    <span className="fw-semibold">Shipment Progress</span>
                    <span className="fw-bold" style={{ color: "var(--brand-primary)" }}>
                        {shipment.progressPercent}%
                    </span>
                </div>

                <div className="progress mt-2" style={{ height: "10px" }}>
                    <div
                        className="progress-bar"
                        style={{
                            width: `${shipment.progressPercent}%`,
                            background: "var(--brand-primary)"
                        }}
                    />
                </div>

            </div>

        </div>
    );
}

export default CurrentShipment;
