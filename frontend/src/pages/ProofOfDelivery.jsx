import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

import api from "../services/api";

import "../styles/proofOfDelivery.css";

function ProofOfDelivery() {

    const { id } = useParams();

    const navigate = useNavigate();

    const signatureRef = useRef();

    const [receiverName, setReceiverName] = useState("");

    const [remarks, setRemarks] = useState("");

    const [photo, setPhoto] = useState(null);

    const [preview, setPreview] = useState("");

    const handlePhoto = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setPhoto(file);

        setPreview(URL.createObjectURL(file));

    };

    const clearSignature = () => {

        signatureRef.current.clear();

    };
        const handleSubmit = async () => {

        if (signatureRef.current.isEmpty()) {

            alert("Please sign before submitting.");

            return;

        }

        if (!photo) {

            alert("Please upload delivery photo.");

            return;

        }

        const signature = signatureRef.current
            .getTrimmedCanvas()
            .toDataURL("image/png");

        const formData = new FormData();

        formData.append("shipmentId", id);

        formData.append("receiverName", receiverName);

        formData.append("remarks", remarks);

        formData.append("signature", signature);

        formData.append("photo", photo);

        try {

            await api.post(

                "/proof",

                formData,

                {

                    headers: {

                        "Content-Type":

                            "multipart/form-data"

                    }

                }

            );

            alert("Proof of Delivery Saved");

            navigate("/driver-dashboard");

        }

        catch (error) {

            console.error(error);

            alert("Upload failed.");

        }

    };
        return (

        <div className="proof-container">

            <div className="proof-card">

                <h2>

                    Proof of Delivery

                </h2>

                <div className="form-row">

    <input
        type="text"
        placeholder="Receiver Name"
        value={receiverName}
        onChange={(e) => setReceiverName(e.target.value)}
    />

    <textarea
        placeholder="Delivery Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
    />

</div>
                                <h3>

                    Customer Signature

                </h3>

                <div className="signature-box">

    <SignatureCanvas
        ref={signatureRef}
        penColor="black"
        canvasProps={{
            className: "signature"
        }}
    />

</div>

                <button

                    className="clear-btn"

                    onClick={clearSignature}

                >

                    Clear Signature

                </button>

                
               <h3>Delivery Photo</h3>

<label className="upload-box">

    <input
        type="file"
        accept="image/*"
        onChange={handlePhoto}
        hidden
    />

    📷 Click here to upload delivery photo

</label>

{preview && (

    <div className="preview-container">

        <img
            src={preview}
            alt="Preview"
            className="preview"
        />

    </div>

)}

                
                                <button

                    className="submit-btn"

                    onClick={handleSubmit}

                >

                    Submit Proof

                </button>

            </div>

        </div>

    );

}

export default ProofOfDelivery;