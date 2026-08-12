import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function PODPage() {

    const { reference } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const passedPod = location.state?.podData || null;
    const [pod, setPod] = useState(passedPod);
    const [loading, setLoading] = useState(!passedPod);
    const [error, setError] = useState("");

    const fetchPod = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            let shipmentId = reference;
            const isNumeric = /^\d+$/.test(reference || "");

            if (!isNumeric) {
                const trackingResponse = await api.get(
                    `/shipments/tracking/${reference}`,
                    config
                );
                const shipment = trackingResponse.data;
                if (!shipment || !shipment.id) {
                    throw new Error("Shipment not found for tracking number.");
                }
                shipmentId = shipment.id;
            }

            try {
                const response = await api.get(`/pod/${shipmentId}`, config);
                setPod(response.data || null);
            } catch {
                const [shipmentResponse, historyResponse] = await Promise.all([
                    api.get(`/shipments/${shipmentId}`, config).catch(() => null),
                    api.get(`/tracking/${shipmentId}`, config).catch(() => null)
                ]);

                const shipment = shipmentResponse?.data;
                if (!shipment) {
                    throw new Error(
                        "No proof of delivery found for this shipment."
                    );
                }

                const sortedHistory = (historyResponse?.data || [])
                    .slice()
                    .sort(
                        (a, b) =>
                            new Date(a?.timestamp) - new Date(b?.timestamp)
                    );

                const deliveredEntry = sortedHistory.find(
                    (entry) =>
                        String(entry?.status) === "DELIVERED"
                );

                const latestEntry =
                    sortedHistory[sortedHistory.length - 1] || null;

                setPod({
                    shipmentId: shipment.id,
                    trackingNumber: shipment.trackingNumber,
                    driverName: shipment.driver?.fullName || null,
                    customerName:
                        shipment.createdBy?.fullName ||
                        shipment.senderName ||
                        null,
                    receiverName: shipment.receiverName || null,
                    deliveryAddress:
                        shipment.destinationAddress ||
                        shipment.receiverAddress ||
                        null,
                    deliveryTime:
                        deliveredEntry?.timestamp ||
                        latestEntry?.timestamp ||
                        null,
                    signatureData: null,
                    deliveryPhoto: null,
                    remarks: null,
                    latitude: null,
                    longitude: null
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "No proof of delivery found for this shipment."
            );
        } finally {
            setLoading(false);
        }
    }, [reference]);

    useEffect(() => {
        if (passedPod) {
            return;
        }
        
        fetchPod();
    }, [fetchPod, passedPod]);

    const downloadPdf = async () => {
        if (!pod) return;
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(`/pod/download/${pod.shipmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });

            const url = URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = `POD-${pod.trackingNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            generatePodPdf();
        }
    };

    const generatePodPdf = () => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text("PROOF OF DELIVERY", 14, 18);

            doc.setFontSize(10);
            doc.text("ShipTrack - Official Delivery Document", 14, 25);

            const formatDate = (value) =>
                value ? new Date(value).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                }) : "--";

            const formatTime = (value) =>
                value ? new Date(value).toLocaleTimeString([], {
                    hour: "2-digit", minute: "2-digit"
                }) : "--";

            let startY = 32;

            autoTable(doc, {
                startY,
                head: [["Field", "Value"]],
                body: [
                    ["Tracking Number", pod?.trackingNumber || "--"],
                    ["Shipment Status", "DELIVERED"],
                    ["Driver Name", pod?.driverName || "--"],
                    ["Customer Name", pod?.customerName || "--"],
                    ["Receiver Name", pod?.receiverName || "--"],
                    ["Delivery Address", pod?.deliveryAddress || "--"],
                    ["Delivery Date", formatDate(pod?.deliveryTime)],
                    ["Delivery Time", formatTime(pod?.deliveryTime)],
                    ...(pod?.remarks
                        ? [["Delivery Remarks", pod.remarks]]
                        : [])
                ],
                columnStyles: {
                    0: { cellWidth: 55, fontStyle: "bold" }
                }
            });

            const addImageSection = (doc, title, dataUrl, emptyLabel, y, maxW, maxH) => {
                doc.setFontSize(12);
                doc.text(title, 14, y);
                const imgStartY = y + 5;
                if (
                    typeof dataUrl === "string" &&
                    dataUrl.trim().startsWith("data:")
                ) {
                    try {
                        const format = dataUrl.includes("data:image/png")
                            ? "PNG"
                            : "JPEG";
                        const props = doc.getImageProperties(dataUrl);
                        const ratio = props.height > 0
                            ? props.width / props.height
                            : 1;
                        let width = maxW;
                        let height = width / ratio;
                        if (height > maxH) {
                            height = maxH;
                            width = height * ratio;
                        }
                        doc.addImage(dataUrl, format, 14, imgStartY, width, height);
                        return imgStartY + height + 10;
                    } catch {
                        doc.setFontSize(9);
                        doc.text(emptyLabel, 14, imgStartY + 8);
                        return imgStartY + 14;
                    }
                }
                doc.setFontSize(9);
                doc.text(emptyLabel, 14, imgStartY + 8);
                return imgStartY + 14;
            };

            const { finalY } = doc.lastAutoTable;
            const y = addImageSection(
                doc, "Digital Signature", pod?.signatureData,
                "No digital signature captured.", finalY + 10, 70, 40
            );
            addImageSection(
                doc, "Delivery Photo", pod?.deliveryPhoto,
                "No delivery photo captured.", y, 120, 80
            );

            doc.save(`POD-${pod?.trackingNumber || "shipment"}.pdf`);
            toast.success("Proof of Delivery downloaded successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download the Proof of Delivery document.");
        }
    };

    const formatDate = (value) =>
        value ? new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
        }) : "--";

    const formatTime = (value) =>
        value ? new Date(value).toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit"
        }) : "--";

    return (
        <div className="container py-4 pod-page">

            <style>{`
                .pod-page .pod-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
                .pod-page .pod-sheet { max-width: 820px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
                .pod-page .pod-head { background: #0d6efd; color: #ffffff; padding: 22px 30px; text-align: center; }
                .pod-page .pod-head h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
                .pod-page .pod-head p { margin: 4px 0 0; opacity: 0.85; font-size: 13px; }
                .pod-page .pod-body { padding: 26px 30px; }
                .pod-page .pod-grid { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 14px; }
                .pod-page .pod-block { flex: 1 1 200px; border: 1px solid #e4e7eb; border-radius: 8px; padding: 12px 14px; background: #fbfcfd; }
                .pod-page .pod-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #7b8794; margin-bottom: 4px; }
                .pod-page .pod-value { font-size: 15px; font-weight: 600; }
                .pod-page .pod-section { margin: 18px 0 8px; font-size: 14px; font-weight: 700; color: #333; border-left: 4px solid #0d6efd; padding-left: 10px; }
                .pod-page .pod-divider { border: 0; border-top: 1px dashed #d4d8dd; margin: 16px 0; }
                .pod-page img.pod-img { max-width: 100%; max-height: 260px; border: 1px solid #e4e7eb; border-radius: 8px; background: #fff; }
                .pod-page .pod-remarks { white-space: pre-line; color: #333; }
                .pod-page .pod-status { display: inline-block; background: #198754; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
                .pod-page .pod-foot { background: #fbfcfd; border-top: 1px solid #e4e7eb; padding: 14px 30px; font-size: 12px; color: #7b8794; text-align: center; }
                @media print {
                    nav.navbar, .app-footer, .no-print, .toast-container, .toastify-container { display: none !important; }
                    body { background: #fff !important; }
                    .pod-page .pod-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: none !important; }
                }
            `}</style>

            <div className="pod-toolbar no-print">

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back
                </button>

                <div className="d-flex gap-2">

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={downloadPdf}
                        disabled={!pod}
                    >
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        Download PDF
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => window.print()}
                        disabled={!pod}
                    >
                        <i className="bi bi-printer me-1"></i>
                        Print POD
                    </button>

                </div>

            </div>

            {loading ? (

                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>

            ) : error ? (

                <div className="alert alert-warning text-center py-5">
                    <h5 className="mb-2">Proof of Delivery Unavailable</h5>
                    <p className="mb-0">{error}</p>
                </div>

            ) : pod && (

                <div className="pod-sheet">

                    <div className="pod-head">

                        <h1>PROOF OF DELIVERY</h1>

                        <p>
                            ShipTrack — Official Delivery Document
                        </p>

                    </div>

                    <div className="pod-body">

                        <div className="pod-grid">

                            <div className="pod-block">
                                <div className="pod-label">Tracking Number</div>
                                <div className="pod-value">{pod.trackingNumber}</div>
                            </div>

                            <div className="pod-block">
                                <div className="pod-label">Shipment Status</div>
                                <div>
                                    <span className="pod-status">DELIVERED</span>
                                </div>
                            </div>

                        </div>

                        <div className="pod-grid">

                            <div className="pod-block">
                                <div className="pod-label">Driver Name</div>
                                <div className="pod-value">{pod.driverName || "--"}</div>
                            </div>

                            <div className="pod-block">
                                <div className="pod-label">Customer Name</div>
                                <div className="pod-value">{pod.customerName || "--"}</div>
                            </div>

                        </div>

                        <div className="pod-grid">

                            <div className="pod-block">
                                <div className="pod-label">Receiver Name</div>
                                <div className="pod-value">{pod.receiverName || "--"}</div>
                            </div>

                            <div className="pod-block">
                                <div className="pod-label">Delivery Address</div>
                                <div className="pod-value">{pod.deliveryAddress || "--"}</div>
                            </div>

                        </div>

                        <div className="pod-grid">

                            <div className="pod-block">
                                <div className="pod-label">Delivery Date</div>
                                <div className="pod-value">{formatDate(pod.deliveryTime)}</div>
                            </div>

                            <div className="pod-block">
                                <div className="pod-label">Delivery Time</div>
                                <div className="pod-value">{formatTime(pod.deliveryTime)}</div>
                            </div>

                            {pod.latitude != null && pod.longitude != null && (
                                <div className="pod-block">
                                    <div className="pod-label">GPS Location</div>
                                    <div className="pod-value">
                                        {Number(pod.latitude).toFixed(5)}, {Number(pod.longitude).toFixed(5)}
                                    </div>
                                </div>
                            )}

                        </div>

                        <hr className="pod-divider" />

                        <div className="pod-section">Digital Signature</div>

                        {pod.signatureData ? (
                            <img
                                src={pod.signatureData}
                                alt="Receiver signature"
                                className="pod-img"
                                style={{ maxHeight: "160px" }}
                            />
                        ) : (
                            <p className="text-muted">No digital signature captured.</p>
                        )}

                        <hr className="pod-divider" />

                        <div className="pod-section">Delivery Photo</div>

                        {pod.deliveryPhoto ? (
                            <img
                                src={pod.deliveryPhoto}
                                alt="Delivery photo"
                                className="pod-img"
                            />
                        ) : (
                            <p className="text-muted">No delivery photo captured.</p>
                        )}

                        {pod.remarks && (
                            <>
                                <hr className="pod-divider" />

                                <div className="pod-section">Delivery Remarks</div>

                                <div className="pod-remarks">{pod.remarks}</div>
                            </>
                        )}

                    </div>

                    <div className="pod-foot">
                        This is a system-generated Proof of Delivery document.
                        Valid for shipment {pod.trackingNumber}.
                    </div>

                </div>

            )}

        </div>
    );
}

export default PODPage;
