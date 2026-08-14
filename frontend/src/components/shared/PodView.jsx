import { getPodStatusLabel, getPodStatusBadgeClass, getPodMethodLabel } from "../../utils/constants";

function PodView({ pod, showImage = true }) {
    if (!pod) return null;

    return (
        <div className="card border-success">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-title text-success mb-0">
                        <i className="bi bi-clipboard-check me-2"></i>Proof of Delivery
                    </h6>
                    <span className={`badge ${getPodStatusBadgeClass(pod.verificationStatus)}`}>
                        {getPodStatusLabel(pod.verificationStatus)}
                    </span>
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <small className="text-muted d-block">Received By</small>
                        <strong>{pod.recipientName}</strong>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted d-block">Delivered At</small>
                        <strong>{pod.deliveredAt ? new Date(pod.deliveredAt).toLocaleString() : "-"}</strong>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted d-block">Captured At</small>
                        <strong>{pod.capturedAt ? new Date(pod.capturedAt).toLocaleString() : "-"}</strong>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted d-block">Method</small>
                        <span className="badge bg-secondary-subtle text-secondary">{getPodMethodLabel(pod.method)}</span>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted d-block">Captured By</small>
                        <strong>{pod.capturedByName || "-"}</strong>
                    </div>
                </div>

                {pod.verifiedByName && (
                    <div className="mt-3">
                        <small className="text-muted d-block">Verified By</small>
                        <strong>
                            {pod.verifiedByName}
                            {pod.verifiedAt ? ` — ${new Date(pod.verifiedAt).toLocaleString()}` : ""}
                        </strong>
                        {pod.verificationNotes && (
                            <p className="text-muted small mb-0 mt-1">Note: {pod.verificationNotes}</p>
                        )}
                    </div>
                )}

                {pod.notes && (
                    <p className="text-muted small mt-2 mb-0">
                        <i className="bi bi-chat-left-text me-1"></i>{pod.notes}
                    </p>
                )}

                {showImage && (
                    <>
                        <div className="mt-3">
                            <small className="text-muted d-block mb-2">Delivered Item Image</small>
                            <div className="border rounded-3 p-3 text-center bg-body-tertiary">
                                {pod.itemImageData ? (
                                    <img
                                        src={pod.itemImageData}
                                        alt="Delivered item"
                                        style={{ maxHeight: 200, maxWidth: "100%" }}
                                    />
                                ) : (
                                    <p className="text-muted mb-0">No item image available.</p>
                                )}
                            </div>
                            {typeof pod.itemImageIntact === "boolean" && (
                                <div className="mt-2">
                                    {pod.itemImageIntact ? (
                                        <span className="badge bg-success-subtle text-success">
                                            <i className="bi bi-shield-check me-1"></i>Item image integrity verified
                                        </span>
                                    ) : (
                                        <span className="badge bg-danger-subtle text-danger">
                                            <i className="bi bi-shield-x me-1"></i>Item image data altered
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-3">
                            <small className="text-muted d-block mb-2">Recipient Signature</small>
                            <div className="border rounded-3 p-3 text-center bg-body-tertiary">
                                {pod.signatureData ? (
                                    <img
                                        src={pod.signatureData}
                                        alt="Recipient signature"
                                        style={{ maxHeight: 160, maxWidth: "100%" }}
                                    />
                                ) : (
                                    <p className="text-muted mb-0">No signature image available.</p>
                                )}
                            </div>
                            {pod.signatureIntact !== undefined && (
                                <div className="mt-2">
                                    {pod.signatureIntact ? (
                                        <span className="badge bg-success-subtle text-success">
                                            <i className="bi bi-shield-check me-1"></i>Signature integrity verified
                                        </span>
                                    ) : (
                                        <span className="badge bg-danger-subtle text-danger">
                                            <i className="bi bi-shield-x me-1"></i>Signature data altered
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PodView;
