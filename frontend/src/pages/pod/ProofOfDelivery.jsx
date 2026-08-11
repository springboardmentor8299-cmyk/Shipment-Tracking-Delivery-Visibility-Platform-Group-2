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
import { sendPodOtp, verifyPodOtp } from "../../services/podOtpService";
import { generatePodBillPdf } from "../../utils/generatePodBill";
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
  // Only logistics operators actually perform deliveries and capture new
  // POD evidence out in the field. Admins review/audit what's already been
  // captured, so they only get the records list — no "New POD" form.
  const canCreatePod = localStorage.getItem("role") === "LOGISTICS_OPERATOR";
  const [activeTab, setActiveTab] = useState(canCreatePod ? "new" : "records");

  // Shipment lookup
  const [shipments, setShipments] = useState([]);
  const [shipmentQuery, setShipmentQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Form fields
  const [receiverName, setReceiverName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("SIGNATURE");

  // (iv) OTP verification workflow — driven entirely by the backend:
  // it generates the code, stores it temporarily, and notifies the
  // customer; here we just track where in that flow we are.
  const [otpInput, setOtpInput] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

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
  const [generatingBillId, setGeneratingBillId] = useState(null);
  const [billError, setBillError] = useState("");

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

  const resetOtpFlow = () => {
    setOtpInput("");
    setOtpSending(false);
    setOtpSent(false);
    setOtpVerifying(false);
    setOtpVerified(false);
    setOtpError("");
  };

  // Step 1+2+3+4: admin selects OTP -> ask the backend to generate, store,
  // and send it to the customer.
  const handleSendOtp = async () => {
    if (!selectedShipment) return;
    setOtpSending(true);
    setOtpError("");
    setOtpVerified(false);
    setOtpInput("");
    try {
      await sendPodOtp(selectedShipment.trackingId);
      setOtpSent(true);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      setOtpSent(false);
      setOtpError(
        err?.response?.data?.message || "Could not send the OTP. Try again.",
      );
    } finally {
      setOtpSending(false);
    }
  };

  // Step 6+7: admin enters the code the customer gave them -> backend
  // verifies it server-side.
  const handleVerifyOtp = async () => {
    if (!selectedShipment || !otpInput.trim()) return;
    setOtpVerifying(true);
    setOtpError("");
    try {
      const result = await verifyPodOtp(selectedShipment.trackingId, otpInput.trim());
      if (result?.verified) {
        setOtpVerified(true);
      } else {
        setOtpVerified(false);
        setOtpError("That code doesn't match. Ask the receiver to confirm it and try again.");
      }
    } catch (err) {
      console.error("Failed to verify OTP:", err);
      setOtpVerified(false);
      setOtpError(
        err?.response?.data?.message || "Could not verify this code. Try again.",
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  // Switching away from OTP, or picking a different shipment, invalidates
  // whatever OTP progress was in flight.
  useEffect(() => {
    resetOtpFlow();
  }, [verificationMethod, selectedShipment?.trackingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setSelectedShipment(null);
    setShipmentQuery("");
    setReceiverName("");
    setDeliveryNotes("");
    setVerificationMethod("SIGNATURE");
    resetOtpFlow();
    setChecklist({});
    setSignatureDataUrl(null);
    setPhotos([]);
  };

  // (iv) Verification workflow — must be satisfied before a POD can be submitted
  const verificationSatisfied = useMemo(() => {
    if (verificationMethod === "OTP") return otpVerified;
    if (verificationMethod === "ID_CHECK") return !!checklist.identityConfirmed;
    return true; // SIGNATURE method is verified by the signature itself
  }, [verificationMethod, otpVerified, checklist]);

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
          ? "Verify the OTP code with the receiver before confirming delivery."
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

  // Builds a downloadable PDF bill from everything already on the record —
  // sender/receiver, shipment details, cost, signature, and evidence
  // photos — no extra backend call needed.
  const handleGenerateBill = async (record) => {
    setBillError("");
    setGeneratingBillId(record.id);
    try {
      await generatePodBillPdf(record);
    } catch (err) {
      console.error("Failed to generate bill PDF:", err);
      setBillError(
        `Could not generate the bill for ${record.trackingId}. Try again.`,
      );
    } finally {
      setGeneratingBillId(null);
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
        {canCreatePod && (
          <button
            className={activeTab === "new" ? "pod-tab active" : "pod-tab"}
            onClick={() => setActiveTab("new")}
          >
            New POD
          </button>
        )}
        <button
          className={activeTab === "records" ? "pod-tab active" : "pod-tab"}
          onClick={() => setActiveTab("records")}
        >
          POD Records
        </button>
      </div>

      {activeTab === "new" && canCreatePod && (
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
                {!selectedShipment && (
                  <p className="pod-muted">
                    Select a shipment above to send a verification code.
                  </p>
                )}

                {selectedShipment && !otpSent && (
                  <button
                    type="button"
                    className="pod-btn-secondary"
                    onClick={handleSendOtp}
                    disabled={otpSending}
                  >
                    {otpSending ? "Sending…" : "Send code to receiver"}
                  </button>
                )}

                {selectedShipment && otpSent && (
                  <>
                    <div>
                      {otpVerified ? (
                        <span className="pod-otp-verified">
                          <FaCheckCircle /> Code verified
                        </span>
                      ) : (
                        <span>
                          Verification code sent to the receiver on file.
                        </span>
                      )}
                      <button
                        type="button"
                        className="pod-link-btn"
                        onClick={handleSendOtp}
                        disabled={otpSending}
                      >
                        {otpSending ? "Resending…" : "Resend"}
                      </button>
                    </div>

                    <div className="pod-otp-verify-row">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter the 6-digit code from the receiver"
                        value={otpInput}
                        disabled={otpVerified}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setOtpVerified(false);
                        }}
                      />
                      <button
                        type="button"
                        className="pod-btn-secondary"
                        onClick={handleVerifyOtp}
                        disabled={otpVerified || otpVerifying || !otpInput.trim()}
                      >
                        {otpVerifying
                          ? "Verifying…"
                          : otpVerified
                            ? "Verified"
                            : "Verify code"}
                      </button>
                    </div>
                  </>
                )}

                {otpError && <p className="pod-error">{otpError}</p>}
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
          {billError && <p className="pod-error">{billError}</p>}

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
                          className="pod-link-btn"
                          disabled={generatingBillId === r.id}
                          onClick={() => handleGenerateBill(r)}
                        >
                          {generatingBillId === r.id
                            ? "Generating…"
                            : "Generate Bill"}
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
