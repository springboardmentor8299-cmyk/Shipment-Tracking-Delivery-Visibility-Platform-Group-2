import { useState, useEffect } from "react";
import { getStatusLabel, getStatusBadgeClass } from "../../utils/constants";
import { fetchShipmentDetail } from "../../services/shipmentService";

function ShipmentDetailModal({ shipmentId, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!shipmentId) return;
        setLoading(true);
        fetchShipmentDetail(shipmentId)
            .then(setDetail)
            .catch(() => setError("Failed to load shipment details."))
            .finally(() => setLoading(false));
    }, [shipmentId]);

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Shipment Detail — {detail?.trackingNumber || ""}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading && <div className="text-center py-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}
                        {error && <div className="alert alert-danger">{error}</div>}
                        {detail && (
                            <>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6 className="card-title text-muted mb-3">Sender Information</h6>
                                                <p className="mb-1"><strong>Name:</strong> {detail.senderName}</p>
                                                <p className="mb-0"><strong>Address:</strong> {detail.senderAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6 className="card-title text-muted mb-3">Receiver Information</h6>
                                                <p className="mb-1"><strong>Name:</strong> {detail.receiverName}</p>
                                                <p className="mb-0"><strong>Address:</strong> {detail.deliveryAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-3">
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <small className="text-muted d-block">Status</small>
                                                <span className={`badge ${getStatusBadgeClass(detail.status)} fs-6 mt-1`}>
                                                    {getStatusLabel(detail.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <small className="text-muted d-block">Progress</small>
                                                <div className="progress mt-2" style={{ height: "8px" }}>
                                                    <div className="progress-bar" style={{ width: `${detail.progressPercent}%` }}></div>
                                                </div>
                                                <small className="mt-1 d-block">{detail.progressPercent}%</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <small className="text-muted d-block">Distance</small>
                                                <strong>{detail.totalDistance ? `${detail.totalDistance.toFixed(1)} km` : "-"}</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <small className="text-muted d-block">Est. Duration</small>
                                                <strong>{detail.estimatedDuration ? `${Math.round(detail.estimatedDuration / 60)} hrs` : "-"}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <h6 className="card-title text-muted">Estimated Delivery</h6>
                                                <p className="mb-0">{detail.estimatedDeliveryTime ? new Date(detail.estimatedDeliveryTime).toLocaleString() : "Not set"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <h6 className="card-title text-muted">Actual Delivery</h6>
                                                <p className="mb-0">{detail.actualDeliveryTime ? new Date(detail.actualDeliveryTime).toLocaleString() : "Not delivered yet"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-body">
                                                <h6 className="card-title text-muted">Created By</h6>
                                                <p className="mb-0">{detail.createdByName || "-"}</p>
                                                <small className="text-muted">{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : ""}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {detail.eta && (
                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <div className="card border-info">
                                                <div className="card-body">
                                                    <h6 className="card-title text-info"><i className="bi bi-clock me-2"></i>ETA Details</h6>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <small className="text-muted d-block">Estimated Time</small>
                                                            <strong>{detail.eta.estimatedDeliveryTime ? new Date(detail.eta.estimatedDeliveryTime).toLocaleString() : "-"}</strong>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <small className="text-muted d-block">Remaining Distance</small>
                                                            <strong>{detail.eta.totalDistanceKm ? `${detail.eta.totalDistanceKm.toFixed(1)} km` : "-"}</strong>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <small className="text-muted d-block">Remaining Duration</small>
                                                            <strong>{detail.eta.estimatedDurationMin ? `${Math.round(detail.eta.estimatedDurationMin / 60)} hrs` : "-"}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detail.delayStatus && detail.delayStatus.hasDelay && (
                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <div className="card border-danger">
                                                <div className="card-body">
                                                    <h6 className="card-title text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Delay Alert</h6>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <small className="text-muted d-block">Delay</small>
                                                            <strong>{detail.delayStatus.delayMinutes} minutes</strong>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <small className="text-muted d-block">Reason</small>
                                                            <strong>{detail.delayStatus.delayReason || "Unknown"}</strong>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <small className="text-muted d-block">Probability</small>
                                                            <strong>{detail.delayStatus.probability ? `${(detail.delayStatus.probability * 100).toFixed(0)}%` : "-"}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detail.forecast && (
                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <div className="card border-success">
                                                <div className="card-body">
                                                    <h6 className="card-title text-success"><i className="bi bi-graph-up me-2"></i>Delivery Forecast</h6>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <small className="text-muted d-block">Predicted Delivery</small>
                                                            <strong>{detail.forecast.predictedDeliveryTime ? new Date(detail.forecast.predictedDeliveryTime).toLocaleString() : "-"}</strong>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <small className="text-muted d-block">Confidence</small>
                                                            <strong>{detail.forecast.confidenceScore ? `${(detail.forecast.confidenceScore * 100).toFixed(0)}%` : "-"}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h6 className="card-title text-muted">Tracking Timeline ({detail.events?.length || 0} events)</h6>
                                        {detail.events && detail.events.length > 0 ? (
                                            <div className="timeline mt-3">
                                                {detail.events.map((event, idx) => (
                                                    <div key={event.id} className="d-flex mb-3">
                                                        <div className="me-3 d-flex flex-column align-items-center" style={{ width: "40px", flexShrink: 0 }}>
                                                            <div className={`rounded-circle ${getStatusBadgeClass(event.status)} d-flex align-items-center justify-content-center`} style={{ width: "32px", height: "32px", zIndex: 1 }}>
                                                                <i className="bi bi-check text-white small"></i>
                                                            </div>
                                                            {idx < detail.events.length - 1 && <div style={{ width: "2px", flex: 1, backgroundColor: "#dee2e6" }}></div>}
                                                        </div>
                                                        <div>
                                                            <strong>{getStatusLabel(event.status)}</strong>
                                                            <div className="text-muted small">
                                                                {event.recordedAt ? new Date(event.recordedAt).toLocaleString() : ""}
                                                                {event.latitude && event.longitude ? ` — ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}` : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted mb-0">No events recorded.</p>
                                        )}
                                    </div>
                                </div>

                                {detail.latestLatitude && detail.latestLongitude && (
                                    <div className="card">
                                        <div className="card-body">
                                            <h6 className="card-title text-muted">Latest Live Location</h6>
                                            <p className="mb-1"><strong>Coordinates:</strong> {detail.latestLatitude.toFixed(4)}, {detail.latestLongitude.toFixed(4)}</p>
                                            <p className="mb-0"><strong>Status:</strong> {detail.latestLocationStatus ? getStatusLabel(detail.latestLocationStatus) : "-"}</p>
                                            <small className="text-muted">Last updated: {detail.latestEventAt ? new Date(detail.latestEventAt).toLocaleString() : "-"}</small>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShipmentDetailModal;