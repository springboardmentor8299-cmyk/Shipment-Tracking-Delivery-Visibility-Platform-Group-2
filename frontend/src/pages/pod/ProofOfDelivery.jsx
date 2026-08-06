import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCamera,
  FaSignature,
  FaCheckCircle,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import {
  getAllShipments,
  updateShipment,
} from "../../services/shipmentService";
import { submitPOD, getAllPODs, deletePOD } from "../../services/podService";
import "./ProofOfDelivery.css";

const VERIFICATION_METHODS = [
  { value: "SIGNATURE", label: "Signature only" },
  { value: "OTP", label: "OTP code" },
  { value: "ID_CHECK", label: "ID verification" },
];

const CHECKLIST_ITEMS = [
  { key: "identityConfirmed", label: "Receiver identity confirmed" },
  {
    key: "packageConditionOk",
    label: "Package condition checked — no visible damage",
  },
  { key: "itemCountVerified", label: "Item count matches shipment record" },
];

// Shipments in these statuses are the ones a POD would realistically be
// captured for — still useful to allow searching any tracking ID though,
// in case a record needs to be logged after the fact.
const DELIVERY_CANDIDATE_STATUSES = ["OUT_FOR_DELIVERY", "IN_TRANSIT"];

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

//  (i) Digital signature capture — plain canvas pad, mouse + touch
function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: ((point.clientX - rect.left) / rect.width) * canvas.width,
      y: ((point.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingRef.current = true;
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSignature) setHasSignature(true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  // Report a fresh data URL every time drawing stops (not just on the
  // hasSignature flip), so edits after the first stroke are captured.
  const handlePointerUp = () => {
    if (drawingRef.current) {
      drawingRef.current = false;
      if (hasSignature || canvasRef.current) {
        onChange(canvasRef.current.toDataURL("image/png"));
      }
    }
  };

  return (
    <div className="pod-signature-block">
      <canvas
        ref={canvasRef}
        width={520}
        height={180}
        className="pod-signature-canvas"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={handlePointerUp}
      />
      <div className="pod-signature-actions">
        {!hasSignature && (
          <span className="pod-signature-hint">
            Sign above with mouse or finger
          </span>
        )}
        <button
          type="button"
          className="pod-link-btn"
          onClick={clear}
          disabled={!hasSignature}
        >
          Clear signature
        </button>
      </div>
    </div>
  );
}

// (ii) Delivery photo upload — multi-file, drag/drop, previews
function PhotoUpload({ photos, onAdd, onRemove }) {
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    const withPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    onAdd(withPreviews);
  };

  return (
    <div>
      <div
        className="pod-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <FaCamera size={22} />
        <p>Drop delivery photos here, or click to choose files</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {photos.length > 0 && (
        <div className="pod-photo-grid">
          {photos.map((photo, index) => (
            <div className="pod-photo-thumb" key={photo.url}>
              <img src={photo.url} alt={`Delivery evidence ${index + 1}`} />
              <button
                type="button"
                className="pod-photo-remove"
                onClick={() => onRemove(index)}
                title="Remove photo"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main page
export default function ProofOfDelivery() {
  const [activeTab, setActiveTab] = useState("new");

  // Shipment lookup
  const [shipments, setShipments] = useState([]);
  const [shipmentQuery, setShipmentQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Form fields
  const [receiverName, setReceiverName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("SIGNATURE");
  const [otp, setOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [checklist, setChecklist] = useState({});
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Records
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [recordSearch, setRecordSearch] = useState("");
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    if (activeTab === "records") loadRecords();
  }, [activeTab]);

  const loadShipments = async () => {
    try {
      const data = await getAllShipments();
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load shipments:", err);
    }
  };

  const loadRecords = async () => {
    setRecordsLoading(true);
    setRecordsError("");
    try {
      const data = await getAllPODs();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load POD records:", err);
      setRecordsError(
        err?.response?.data?.message ||
          "Could not load POD records. This needs a matching backend at /api/admin/pod — see note below.",
      );
    } finally {
      setRecordsLoading(false);
    }
  };

  const shipmentMatches = useMemo(() => {
    if (!shipmentQuery.trim()) {
      return shipments
        .filter((s) =>
          DELIVERY_CANDIDATE_STATUSES.includes(String(s.status).toUpperCase()),
        )
        .slice(0, 8);
    }
    const q = shipmentQuery.trim().toLowerCase();
    return shipments
      .filter(
        (s) =>
          s.trackingId?.toLowerCase().includes(q) ||
          s.customerName?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [shipmentQuery, shipments]);

  const pickShipment = (shipment) => {
    setSelectedShipment(shipment);
    setShipmentQuery(shipment.trackingId);
    setReceiverName(shipment.receiverName || "");
  };

  const toggleChecklistItem = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const regenerateOtp = () => setOtp(generateOtp());

  useEffect(() => {
    if (verificationMethod === "OTP" && !otp) regenerateOtp();
  }, [verificationMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setSelectedShipment(null);
    setShipmentQuery("");
    setReceiverName("");
    setDeliveryNotes("");
    setVerificationMethod("SIGNATURE");
    setOtp("");
    setOtpInput("");
    setChecklist({});
    setSignatureDataUrl(null);
    setPhotos([]);
  };

  // (iv) Verification workflow — must be satisfied before a POD can be submitted
  const verificationSatisfied = useMemo(() => {
    if (verificationMethod === "OTP") return otpInput.trim() === otp;
    if (verificationMethod === "ID_CHECK") return !!checklist.identityConfirmed;
    return true; // SIGNATURE method is verified by the signature itself
  }, [verificationMethod, otp, otpInput, checklist]);

  const allChecklistDone = CHECKLIST_ITEMS.every((item) => checklist[item.key]);

  const canSubmit =
    selectedShipment &&
    receiverName.trim() &&
    signatureDataUrl &&
    allChecklistDone &&
    verificationSatisfied &&
    !submitting;

  // (iii) Delivery confirmation — submits the POD and flips the shipment to DELIVERED
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedShipment) {
      setFormError("Search for and select a shipment first.");
      return;
    }
    if (!signatureDataUrl) {
      setFormError("A signature is required before confirming delivery.");
      return;
    }
    if (!allChecklistDone) {
      setFormError(
        "Complete the verification checklist before confirming delivery.",
      );
      return;
    }
    if (!verificationSatisfied) {
      setFormError(
        verificationMethod === "OTP"
          ? "The OTP entered doesn't match. Ask the receiver for the correct code."
          : "Verification is incomplete for the selected method.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await submitPOD({
        trackingId: selectedShipment.trackingId,
        receiverName,
        deliveryNotes,
        verificationMethod,
        verificationCode: verificationMethod === "OTP" ? otpInput : "",
        verificationChecklist: checklist,
        signatureDataUrl,
        photos,
      });

      // Delivery confirmation: reflect it on the shipment itself.
      // Only the status changes here — `deliveryDate` is the target/
      // promised date set at creation and is used elsewhere (customer
      // tracking, delivery performance reporting) as that baseline, so
      // POD confirmation shouldn't overwrite it with today's date.
      await updateShipment(selectedShipment.id, {
        ...selectedShipment,
        status: "DELIVERED",
      });

      setFormSuccess(
        `Delivery confirmed for ${selectedShipment.trackingId}. POD record saved.`,
      );
      resetForm();
      loadShipments();
    } catch (err) {
      console.error("POD submission failed:", err);
      setFormError(
        err?.response?.data?.message ||
          "Could not save this POD. This needs a matching backend at POST /api/admin/pod — see note below.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!recordSearch.trim()) return records;
    const q = recordSearch.trim().toLowerCase();
    return records.filter(
      (r) =>
        r.trackingId?.toLowerCase().includes(q) ||
        r.receiverName?.toLowerCase().includes(q),
    );
  }, [recordSearch, records]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this POD record? This cannot be undone."))
      return;
    setDeletingId(id);
    try {
      await deletePOD(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (viewingRecord?.id === id) setViewingRecord(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete this record.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pod-wrapper">
      <h1>Proof of Delivery</h1>
      <p className="pod-subtitle">
        Capture signature, photo evidence, and verification for each delivery —
        and manage saved POD records.
      </p>

      <div className="pod-tabs">
        <button
          className={activeTab === "new" ? "pod-tab active" : "pod-tab"}
          onClick={() => setActiveTab("new")}
        >
          New POD
        </button>
        <button
          className={activeTab === "records" ? "pod-tab active" : "pod-tab"}
          onClick={() => setActiveTab("records")}
        >
          POD Records
        </button>
      </div>

      {activeTab === "new" && (
        <form className="pod-card" onSubmit={handleSubmit}>
          {/* Shipment lookup */}
          <div className="pod-section">
            <label className="pod-label">Shipment</label>
            <div className="pod-search-box">
              <FaSearch className="pod-search-icon" />
              <input
                type="text"
                placeholder="Search by tracking ID or customer name"
                value={shipmentQuery}
                onChange={(e) => {
                  setShipmentQuery(e.target.value);
                  setSelectedShipment(null);
                }}
              />
            </div>

            {!selectedShipment && shipmentMatches.length > 0 && (
              <div className="pod-shipment-list">
                {shipmentMatches.map((s) => (
                  <div
                    key={s.id}
                    className="pod-shipment-option"
                    onClick={() => pickShipment(s)}
                  >
                    <div>
                      <strong>{s.trackingId}</strong> — {s.customerName}
                      <div className="pod-shipment-route">
                        {s.origin} → {s.destination}
                      </div>
                    </div>
                    <span
                      className={`pod-status-badge status-${String(s.status).toLowerCase()}`}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selectedShipment && (
              <div className="pod-selected-shipment">
                <div>
                  <strong>{selectedShipment.trackingId}</strong> —{" "}
                  {selectedShipment.customerName}
                  <div className="pod-shipment-route">
                    {selectedShipment.origin} → {selectedShipment.destination}
                  </div>
                </div>
                <button
                  type="button"
                  className="pod-link-btn"
                  onClick={() => setSelectedShipment(null)}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Receiver + notes */}
          <div className="pod-section pod-grid-2">
            <div>
              <label className="pod-label">Receiver name</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Who received the package?"
              />
            </div>
            <div>
              <label className="pod-label">Delivery notes (optional)</label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Left at reception"
              />
            </div>
          </div>

          {/* Verification workflow */}
          <div className="pod-section">
            <label className="pod-label">Verification method</label>
            <div className="pod-method-row">
              {VERIFICATION_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  className={
                    verificationMethod === m.value
                      ? "pod-method active"
                      : "pod-method"
                  }
                  onClick={() => setVerificationMethod(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {verificationMethod === "OTP" && (
              <div className="pod-otp-box">
                <div>
                  Code sent to receiver: <strong>{otp}</strong>
                  <button
                    type="button"
                    className="pod-link-btn"
                    onClick={regenerateOtp}
                  >
                    Resend
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter the 6-digit code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                />
              </div>
            )}

            <div className="pod-checklist">
              {CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} className="pod-checklist-item">
                  <input
                    type="checkbox"
                    checked={!!checklist[item.key]}
                    onChange={() => toggleChecklistItem(item.key)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Signature */}
          <div className="pod-section">
            <label className="pod-label">
              <FaSignature /> Receiver signature
            </label>
            <SignaturePad onChange={setSignatureDataUrl} />
          </div>

          {/* Photos */}
          <div className="pod-section">
            <label className="pod-label">Delivery photos</label>
            <PhotoUpload
              photos={photos}
              onAdd={(newOnes) => setPhotos((prev) => [...prev, ...newOnes])}
              onRemove={(index) =>
                setPhotos((prev) => prev.filter((_, i) => i !== index))
              }
            />
          </div>

          {formError && <p className="pod-error">{formError}</p>}
          {formSuccess && (
            <p className="pod-success">
              <FaCheckCircle /> {formSuccess}
            </p>
          )}

          <button
            type="submit"
            className="pod-btn-primary"
            disabled={!canSubmit}
          >
            {submitting ? "Saving…" : "Confirm Delivery"}
          </button>
        </form>
      )}

      {activeTab === "records" && (
        <div className="pod-card">
          <div className="pod-search-box pod-records-search">
            <FaSearch className="pod-search-icon" />
            <input
              type="text"
              placeholder="Search records by tracking ID or receiver"
              value={recordSearch}
              onChange={(e) => setRecordSearch(e.target.value)}
            />
          </div>

          {recordsError && <p className="pod-error">{recordsError}</p>}

          {recordsLoading ? (
            <p className="pod-muted">Loading records…</p>
          ) : filteredRecords.length === 0 ? (
            <p className="pod-muted">No POD records yet.</p>
          ) : (
            <div className="pod-table-wrap">
              <table className="pod-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Receiver</th>
                    <th>Verification</th>
                    <th>Evidence</th>
                    <th>Delivered At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => (
                    <tr key={r.id}>
                      <td>{r.trackingId}</td>
                      <td>{r.receiverName}</td>
                      <td>{r.verificationMethod}</td>
                      <td>
                        {r.signatureUrl && (
                          <FaSignature title="Signature captured" />
                        )}{" "}
                        {r.photoUrls?.length > 0 && (
                          <span>
                            <FaCamera /> {r.photoUrls.length}
                          </span>
                        )}
                      </td>
                      <td>
                        {r.deliveredAt
                          ? new Date(r.deliveredAt).toLocaleString()
                          : "—"}
                      </td>
                      <td>
                        <button
                          className="pod-link-btn"
                          onClick={() => setViewingRecord(r)}
                        >
                          View
                        </button>
                        <button
                          className="pod-link-btn pod-link-danger"
                          disabled={deletingId === r.id}
                          onClick={() => handleDelete(r.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewingRecord && (
        <div
          className="pod-modal-backdrop"
          onClick={() => setViewingRecord(null)}
        >
          <div className="pod-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="pod-modal-close"
              onClick={() => setViewingRecord(null)}
            >
              <FaTimes />
            </button>
            <h3>{viewingRecord.trackingId}</h3>
            <p className="pod-muted">
              Received by <strong>{viewingRecord.receiverName}</strong> ·{" "}
              {viewingRecord.deliveredAt
                ? new Date(viewingRecord.deliveredAt).toLocaleString()
                : "—"}
            </p>
            {viewingRecord.deliveryNotes && (
              <p>{viewingRecord.deliveryNotes}</p>
            )}

            {viewingRecord.signatureUrl && (
              <div>
                <label className="pod-label">Signature</label>
                <img
                  className="pod-modal-signature"
                  src={viewingRecord.signatureUrl}
                  alt="Signature"
                />
              </div>
            )}

            {viewingRecord.photoUrls?.length > 0 && (
              <div>
                <label className="pod-label">Photos</label>
                <div className="pod-photo-grid">
                  {viewingRecord.photoUrls.map((url, i) => (
                    <div className="pod-photo-thumb" key={url}>
                      <img src={url} alt={`Evidence ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
