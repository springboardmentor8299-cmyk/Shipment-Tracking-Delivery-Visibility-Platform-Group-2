import api from "./api";

// (iv) OTP verification workflow — backend generates/stores the code and
// notifies the customer; this only ever tells the backend which shipment
// to send/verify a code for.
export const sendPodOtp = async (trackingId) => {
    const response = await api.post(
        "/admin/pod/otp/send",
        null,
        { params: { trackingId } },
    );
    return response.data; // { sent, expiresInSeconds }
};

export const verifyPodOtp = async (trackingId, code) => {
    const response = await api.post(
        "/admin/pod/otp/verify",
        null,
        { params: { trackingId, code } },
    );
    return response.data; // { verified }
};
