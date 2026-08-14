import { useEffect, useState } from "react";
import { getPodStatusLabel, getPodStatusBadgeClass, getPodMethodLabel } from "../../utils/constants";
import { verify } from "../../services/podService";

function PodVerifyModal({ pod, onVerified, onClose }) {
    const [decision, setDecision] = useState(() =>
        ["VERIFIED", "REJECTED"].includes(pod.verificationStatus) ? pod.verificationStatus : "VERIFIED"
    );
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const finalized = pod.verificationStatus === "VERIFIED" || pod.verificationStatus === "REJECTED";
    const tampered = pod.signatureIntact === false || pod.itemImageIntact === false;

    useEffect(() => {
        if (tampered && decision === "VERIFIED") {
            setDecision("REJECTED");
        }
    }, [tampered, decision]);

    const handleVerify = async () => {
        setSaving(true);
        setError("");
        try {
            const updated = await verify(pod.id, {
                decision,
                notes: notes.trim() || null,
            });
            if (onVerified) onVerified(updated);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Could not update verification.");
            setSaving(false);
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-patch-check me-2"></i>Verify Proof of Delivery — {pod.trackingNumber || ""}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <small className="text-muted d-block">Recipient</small>
                                <strong>{pod.recipientName}</strong>
                            </div>
                            <div className="col-md-6">
                                <small className="text-muted d-block">Captured At</small>
                                <strong>{pod.capturedAt ? new Date(pod.capturedAt).toLocaleString() : "-"}</strong>
                            </div>
                            <div className="col-md-6">
                                <small className="text-muted d-block">Method</small>
                                <strong>{getPodMethodLabel(pod.method)}</strong>
                            </div>
                            <div className="col-md-6">
                                <small className="text-muted d-block">Status</small>
                                <span className={`badge ${getPodStatusBadgeClass(pod.verificationStatus)}`}>
                                    {getPodStatusLabel(pod.verificationStatus)}
                                </span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label d-block">Delivered Item Image</label>
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
                            <div className="mt-2">
                                {typeof pod.itemImageIntact === "boolean" && (
                                    pod.itemImageIntact ? (
                                        <span className="badge bg-success-subtle text-success">
                                            <i className="bi bi-shield-check me-1"></i>Item image integrity verified
                                        </span>
                                    ) : (
                                        <span className="badge bg-danger-subtle text-danger">
                                            <i className="bi bi-shield-x me-1"></i>Item image data altered
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label d-block">Captured Signature</label>
                            <div className="border rounded-3 p-3 text-center bg-body-tertiary">
                                {pod.signatureData ? (
                                    <img
                                        src={pod.signatureData}
                                        alt="Recipient signature"
                                        style={{ maxHeight: 180, maxWidth: "100%" }}
                                    />
                                ) : (
                                    <p className="text-muted mb-0">No signature image available.</p>
                                )}
                            </div>
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
                        </div>

                        {finalized && (
                            <div className={`alert ${pod.verificationStatus === "VERIFIED" ? "alert-success" : "alert-danger"}`}>
                                Currently {pod.verificationStatus.toLowerCase()} — you can change the decision below.
                                {pod.verifiedAt ? ` Last decision at ${new Date(pod.verifiedAt).toLocaleString()}` : ""}
                            </div>
                        )}

                        {tampered && (
                            <div className="alert alert-danger">
                                A captured proof image failed its integrity check and cannot be verified.
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Decision</label>
                            <select
                                className="form-select"
                                value={decision}
                                onChange={(e) => setDecision(e.target.value)}
                                disabled={saving}
                            >
                                <option value="VERIFIED" disabled={tampered}>Verified</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Verification Notes</label>
                            <textarea
                                className="form-control"
                                rows="2"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes about this verification"
                            ></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-primary bluebtn"
                            onClick={handleVerify}
                            disabled={saving || (tampered && decision === "VERIFIED")}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-1"></i>Submit Verification
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PodVerifyModal;
