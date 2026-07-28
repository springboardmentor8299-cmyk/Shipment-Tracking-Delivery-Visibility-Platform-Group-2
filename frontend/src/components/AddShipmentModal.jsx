import { useEffect, useState } from "react";
import "../styles/AddShipmentModal.css";

function AddShipmentModal({ show, shipment, onClose, onSave }) {
    const [shipmentData, setShipmentData] = useState({
        customerId: "",
        customerName: "",
        receiverName: "",
        noOfItems: "",
        totalWeightOfItems: "",
        shipmentCost: "",
        origin: "",
        destination: "",
        status: "CREATED",
        shipmentDate: "",
        deliveryDate: ""
    });

    useEffect(() => {
        if (shipment) {
            setShipmentData({
                trackingId: shipment.trackingId,
                customerId: shipment.customerId && typeof shipment.customerId === 'object'
                    ? shipment.customerId.id 
                    : (shipment.customerId || ""),
                customerName: shipment.customerName || "",
                receiverName: shipment.receiverName || "",
                noOfItems: shipment.noOfItems || "",
                totalWeightOfItems: shipment.totalWeightOfItems || "",
                shipmentCost: shipment.shipmentCost || "",
                origin: shipment.origin || "",
                destination: shipment.destination || "",
                status: shipment.status || "CREATED",
                shipmentDate: shipment.shipmentDate || "",
                deliveryDate: shipment.deliveryDate || ""
            });
        } else {
            setShipmentData({
                customerId: "", 
                customerName: "",
                receiverName: "",
                noOfItems: "",
                totalWeightOfItems: "",
                shipmentCost: "",
                origin: "",
                destination: "",
                status: "CREATED",
                shipmentDate: "",
                deliveryDate: ""
            });
        }
    }, [shipment]);

    if (!show) return null;

    const handleChange = (e) => {
        setShipmentData({
            ...shipmentData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...shipmentData,
            customerId: shipmentData.customerId 
                ? { id: Number(shipmentData.customerId) } 
                : null
        };

        await onSave(payload);

        if (!shipment) {
            setShipmentData({
                customerId: "",
                customerName: "",
                receiverName: "",
                noOfItems: "",
                totalWeightOfItems: "",
                shipmentCost: "",
                origin: "",
                destination: "",
                status: "CREATED",
                shipmentDate: "",
                deliveryDate: ""
            });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{shipment ? "Edit Shipment" : "Add Shipment"}</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        name="customerId"
                        placeholder="Customer Id"
                        value={shipmentData.customerId}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="customerName"
                        placeholder="Customer Username"
                        value={shipmentData.customerName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="receiverName"
                        placeholder="Receiver Name"
                        value={shipmentData.receiverName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="noOfItems"
                        placeholder="No of Items"
                        value={shipmentData.noOfItems}
                        onChange={handleChange}
                    />

                    <input
                        name="totalWeightOfItems"
                        placeholder="Total Weight (e.g., 5.5 kg)"
                        value={shipmentData.totalWeightOfItems}
                        onChange={handleChange}
                    />

                    <input
                        name="shipmentCost"
                        placeholder="Shipment Cost (e.g., ₹150)"
                        value={shipmentData.shipmentCost}
                        onChange={handleChange}
                    />

                    <input
                        name="origin"
                        placeholder="Origin"
                        value={shipmentData.origin}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="destination"
                        placeholder="Destination"
                        value={shipmentData.destination}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="status"
                        value={shipmentData.status}
                        onChange={handleChange}
                    >
                       <option value="CREATED">Created</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="FAILED_DELIVERY">Failed Delivery</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <label>Shipment Date</label>
                    <input
                        type="date"
                        name="shipmentDate"
                        value={shipmentData.shipmentDate}
                        onChange={handleChange}
                        required
                    />

                    <label>Delivery Date</label>
                    <input
                        type="date"
                        name="deliveryDate"
                        value={shipmentData.deliveryDate}
                        onChange={handleChange}
                        required
                    />

                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                        >
                            {shipment ? "Update Shipment" : "Save Shipment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddShipmentModal;