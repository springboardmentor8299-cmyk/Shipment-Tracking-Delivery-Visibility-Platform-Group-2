import api from "./api";

export const submitPOD = async ({
    trackingId,
    receiverName,
    deliveryNotes,
    verificationMethod,
    verificationCode,
    verificationChecklist,
    signatureDataUrl,
    photos,
}) => {
    const formData = new FormData();
    formData.append("trackingId", trackingId);
    formData.append("receiverName", receiverName);
    formData.append("deliveryNotes", deliveryNotes || "");
    formData.append("verificationMethod", verificationMethod);
    formData.append("verificationCode", verificationCode || "");
    formData.append("verificationChecklist", JSON.stringify(verificationChecklist || {}));

    if (signatureDataUrl) {
        const signatureBlob = await (await fetch(signatureDataUrl)).blob();
        formData.append("signature", signatureBlob, "signature.png");
    }

    (photos || []).forEach((photo, index) => {
        formData.append("photos", photo.file, photo.file.name || `photo-${index}.jpg`);
    });

    // ✅ FIXED: Changed "/admin" to "/admin/pod" (or "/driver/pod")
    const response = await api.post("/admin/pod", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// (v) POD record management — list all records, newest first
export const getAllPODs = async () => {
    // ✅ FIXED: Changed "/admin" to "/admin/pod"
    const response = await api.get("/admin/pod");
    return response.data;
};

export const getPODByTrackingId = async (trackingId) => {
    const response = await api.get(`/admin/pod/${trackingId}`);
    return response.data;
};

export const deletePOD = async (id) => {
    await api.delete(`/admin/pod/${id}`);
};