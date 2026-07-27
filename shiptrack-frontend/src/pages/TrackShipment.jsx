import { useState } from "react";
import { getShipment } from "../api/shipmentService";
import "../styles/TrackShipment.css";

function TrackShipment() {

    const [trackingNumber, setTrackingNumber] = useState("");

    const [shipment, setShipment] = useState(null);

    const [error, setError] = useState("");

    const handleTrack = async (e) => {

        e.preventDefault();

        setError("");
        setShipment(null);

        try {

            const response = await getShipment(trackingNumber);

            setShipment(response.data);

        } catch (err) {

            console.error(err);

            setError("Shipment not found.");

        }

    };

    return (

        <div className="track-container">

            <div className="track-card">

                <h1>Track Shipment</h1>

                <p>Enter your tracking number below.</p>

                <form onSubmit={handleTrack}>

                    <input
                        type="text"
                        placeholder="Tracking Number"
                        value={trackingNumber}
                        onChange={(e) =>
                            setTrackingNumber(e.target.value.toUpperCase())
                        }
                        required
                    />

                    <button type="submit">
                        Track Shipment
                    </button>

                </form>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                {shipment && (

                    <div className="shipment-card">

                        <h2>Shipment Details</h2>

                        <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>

                        <p><strong>Sender:</strong> {shipment.senderName}</p>

                        <p><strong>Receiver:</strong> {shipment.receiverName}</p>

                        <p><strong>Source:</strong> {shipment.source}</p>

                        <p><strong>Destination:</strong> {shipment.destination}</p>

                        <p><strong>Status:</strong> {shipment.status}</p>

                        <p><strong>Created At:</strong> {shipment.createdAt}</p>

                    </div>

                )}

            </div>

        </div>

    );
}

export default TrackShipment;