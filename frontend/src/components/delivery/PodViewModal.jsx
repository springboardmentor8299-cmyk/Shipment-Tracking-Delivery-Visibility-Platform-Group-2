import { useEffect, useState } from "react";
import { fetchPodByShipment } from "../../services/podService";
import PodView from "../shared/PodView";

function PodViewModal({ shipmentId, trackingNumber, onClose }) {

    const [pod, setPod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPodByShipment(shipmentId)
            .then(setPod)
            .catch((err) => setError(err.response?.data?.message || "Could not load proof of delivery."))
            .finally(() => setLoading(false));
    }, [shipmentId]);

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-clipboard-check me-2"></i>Proof of Delivery — {trackingNumber || ""}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {loading && <p className="text-muted">Loading proof of delivery...</p>}
                        {!loading && !error && <PodView pod={pod} />}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PodViewModal;