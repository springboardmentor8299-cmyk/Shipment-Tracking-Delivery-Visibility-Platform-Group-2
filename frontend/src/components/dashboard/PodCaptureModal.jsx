import { useState } from "react";
import SignaturePad from "../shared/SignaturePad";
import { capture } from "../../services/podService";

const MAX_IMAGE_SIDE = 800;
const IMAGE_QUALITY = 0.7;

function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
                const width = Math.round(img.width * scale);
                const height = Math.round(img.height * scale);
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
            };
            img.onerror = () => reject(new Error("Could not read the selected image."));
            img.src = reader.result;
        };
        reader.onerror = () => reject(new Error("Could not read the selected file."));
        reader.readAsDataURL(file);
    });
}

function PodCaptureModal({ shipmentId, trackingNumber, receiverName, replacing = false, onSaved, onClose }) {
    const [recipientName, setRecipientName] = useState(receiverName || "");
    const [signature, setSignature] = useState(null);
    const [itemImage, setItemImage] = useState(null);
    const [method, setMethod] = useState("DIGITAL");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            e.target.value = "";
            return;
        }
        setError("");
        try {
            setItemImage(await resizeImage(file));
        } catch (err) {
            setError(err.message || "Could not process the selected image.");
        }
        e.target.value = "";
    };

    const handleSave = async () => {
        if (!recipientName.trim()) {
            setError("Recipient name is required.");
            return;
        }
        if (!signature) {
            setError("Please capture the recipient signature first.");
            return;
        }
        if (!itemImage) {
            setError("Please upload a photo of the delivered item.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const saved = await capture(shipmentId, {
                recipientName: recipientName.trim(),
                signatureData: signature,
                itemImageData: itemImage,
                method,
                notes: notes.trim() || null,
            });
            if (onSaved) onSaved(saved);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Could not save proof of delivery.");
            setSaving(false);
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-signature me-2"></i>Proof of Delivery — {trackingNumber || ""}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {replacing && (
                            <div className="alert alert-warning">
                                <i className="bi bi-arrow-repeat me-1"></i>
                                A previous proof of delivery exists for this shipment and will be replaced.
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Recipient Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                placeholder="Name of the person receiving the package"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Recipient Signature *</label>
                            <SignaturePad onChange={setSignature} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Delivered Item Image *</label>
                            {itemImage ? (
                                <div>
                                    <div className="border rounded-3 p-2 text-center bg-body-tertiary mb-2">
                                        <img
                                            src={itemImage}
                                            alt="Delivered item"
                                            style={{ maxHeight: 220, maxWidth: "100%" }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => setItemImage(null)}
                                    >
                                        <i className="bi bi-x-circle me-1"></i>Remove Image
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                            )}
                            <small className="text-muted">
                                Upload a photo of the delivered item as proof. Images are resized automatically.
                            </small>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Method</label>
                                <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                                    <option value="DIGITAL">On-screen signature</option>
                                    <option value="PHYSICAL">Paper signature</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Notes</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Optional delivery notes"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary bluebtn" onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-1"></i>Save Proof of Delivery
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PodCaptureModal;
