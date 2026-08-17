import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getCoordinates } from "../services/geocodingService";
import "../styles/shipment.css";

function CreateShipment() {

    const navigate = useNavigate();

    const [shipment, setShipment] = useState({

        trackingNumber: "",
        senderName: "",
        receiverName: "",
        pickupAddress: "",
        deliveryAddress: "",
        status: "Pending",
        weight: "",
        price: "",

        driverName: "",
        vehicleNumber: "",
        estimatedDelivery: ""

    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setShipment({

            ...shipment,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const shipmentData = { ...shipment };

            // Get Pickup Coordinates
            const pickup = await getCoordinates(
                shipment.pickupAddress
            );

            // Get Destination Coordinates
            const destination = await getCoordinates(
                shipment.deliveryAddress
            );

            if (!pickup) {

                alert("Pickup location not found.");

                setLoading(false);

                return;

            }

            if (!destination) {

                alert("Delivery location not found.");

                setLoading(false);

                return;

            }

            // Pickup location (never changes)
shipmentData.pickupLatitude = pickup.latitude;
shipmentData.pickupLongitude = pickup.longitude;

// Truck starts from pickup location
shipmentData.currentLatitude = pickup.latitude;
shipmentData.currentLongitude = pickup.longitude;

// Delivery location
shipmentData.destinationLatitude = destination.latitude;
shipmentData.destinationLongitude = destination.longitude;

            await api.post("/shipments", shipmentData);

            alert("Shipment Created Successfully");

            navigate("/admin-dashboard");

        }

        catch (error) {

            console.error(error);

            alert("Unable to create shipment.");

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="shipment-container">

            <div className="shipment-card">

                <h2>Create Shipment</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="trackingNumber"
                        placeholder="Tracking Number"
                        value={shipment.trackingNumber}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="senderName"
                        placeholder="Sender Name"
                        value={shipment.senderName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="receiverName"
                        placeholder="Receiver Name"
                        value={shipment.receiverName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="pickupAddress"
                        placeholder="Pickup Address (Example: Hyderabad)"
                        value={shipment.pickupAddress}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="deliveryAddress"
                        placeholder="Delivery Address (Example: Kochi, Kerala)"
                        value={shipment.deliveryAddress}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="weight"
                        placeholder="Weight (kg)"
                        value={shipment.weight}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={shipment.price}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="driverName"
                        placeholder="Driver Email / Name"
                        value={shipment.driverName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="vehicleNumber"
                        placeholder="Vehicle Number"
                        value={shipment.vehicleNumber}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="date"
                        name="estimatedDelivery"
                        value={shipment.estimatedDelivery}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="status"
                        value={shipment.status}
                        onChange={handleChange}
                    >

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="In Transit">
                            In Transit
                        </option>

                        <option value="Delivered">
                            Delivered
                        </option>

                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {

                            loading

                                ? "Creating Shipment..."

                                : "Save Shipment"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default CreateShipment;