import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getShipmentById,
    updateShipment
} from "../services/shipmentService";
import "../styles/shipment.css";

function EditShipment() {

    const { id } = useParams();

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

        // New Fields
        driverName: "",
        vehicleNumber: "",
        estimatedDelivery: ""
    });

    useEffect(() => {
        loadShipment();
    }, []);

    const loadShipment = async () => {

        try {

            const response = await getShipmentById(id);

            setShipment(response.data);

        } catch (error) {

            alert("Unable to load shipment");

        }

    };

    const handleChange = (e) => {

        setShipment({
            ...shipment,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updateShipment(id, shipment);

            alert("Shipment Updated Successfully");

            navigate("/admin-dashboard");

        } catch (error) {

            console.error(error);
            alert("Update Failed");

        }

    };

    return (

        <div className="shipment-container">

            <div className="shipment-card">

                <h2>Edit Shipment</h2>

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
                        placeholder="Pickup Address"
                        value={shipment.pickupAddress}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="deliveryAddress"
                        placeholder="Delivery Address"
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
                        placeholder="Driver Name"
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
                        value={shipment.estimatedDelivery || ""}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="status"
                        value={shipment.status}
                        onChange={handleChange}
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                    </select>

                    <button type="submit">
                        Update Shipment
                    </button>

                </form>

            </div>

        </div>

    );

}

export default EditShipment;