import { useState } from "react";
import { updateShipmentStatus } from "../api/shipmentService";
import "../styles/UpdateShipment.css";

function UpdateShipment() {

    const [trackingNumber, setTrackingNumber] = useState("");
    const [status, setStatus] = useState("CREATED");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updateShipmentStatus(
                trackingNumber,
                status
            );

            alert("Shipment status updated successfully.");

            setTrackingNumber("");
            setStatus("CREATED");

        } catch (error) {

            console.error(error);

            alert("Failed to update shipment.");

        }
    };

    return (

        <div className="update-container">

            <div className="update-card">

                <h1>Update Shipment Status</h1>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Tracking Number"
                        value={trackingNumber}
                        onChange={(e) =>
                            setTrackingNumber(e.target.value.toUpperCase())
                        }
                        required
                    />

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >
                        <option value="CREATED">CREATED</option>
                        <option value="IN_TRANSIT">IN_TRANSIT</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                    </select>

                    <button type="submit">
                        Update Status
                    </button>

                </form>

            </div>

        </div>

    );
}

export default UpdateShipment;