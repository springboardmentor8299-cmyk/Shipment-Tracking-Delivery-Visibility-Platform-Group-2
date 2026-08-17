import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FaBoxOpen,
    FaUser,
    FaMapMarkerAlt,
    FaTruck,
    FaWeightHanging,
    FaRupeeSign,
    FaCalendarAlt,
    FaArrowLeft,
    FaEdit
} from "react-icons/fa";

import { getShipmentById } from "../services/shipmentService";
import "../styles/viewShipment.css";

function ViewShipment() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [shipment, setShipment] = useState(null);

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

    if (!shipment) {

        return (

            <div className="loading-container">

                <h2>Loading Shipment...</h2>

            </div>

        );

    }

    return (

        <div className="view-page">

            <div className="view-card">

                <h1 className="page-title">

                    📦 Shipment Details

                </h1>

                {/* Shipment */}

                <div className="section-card">

                    <h2>

                        <FaBoxOpen />

                        Shipment Information

                    </h2>

                    <div className="detail-row">

                        <span>Tracking Number</span>

                        <strong>{shipment.trackingNumber}</strong>

                    </div>

                    <div className="detail-row">

                        <span>Status</span>

                        <span
                            className={
                                shipment.status === "Delivered"
                                    ? "status delivered"
                                    : shipment.status === "In Transit"
                                    ? "status transit"
                                    : "status pending"
                            }
                        >
                            {shipment.status}
                        </span>

                    </div>

                    <div className="detail-row">

                        <span>

                            <FaWeightHanging />

                            Weight

                        </span>

                        <strong>{shipment.weight} kg</strong>

                    </div>

                    <div className="detail-row">

                        <span>

                            <FaRupeeSign />

                            Price

                        </span>

                        <strong>₹{shipment.price}</strong>

                    </div>

                </div>

                {/* Sender */}

                <div className="section-card">

                    <h2>

                        <FaUser />

                        Sender Information

                    </h2>

                    <div className="detail-row">

                        <span>Sender Name</span>

                        <strong>{shipment.senderName}</strong>

                    </div>

                    <div className="detail-row">

                        <span>Pickup Address</span>

                        <strong>{shipment.pickupAddress}</strong>

                    </div>

                </div>

                {/* Receiver */}

                <div className="section-card">

                    <h2>

                        <FaMapMarkerAlt />

                        Receiver Information

                    </h2>

                    <div className="detail-row">

                        <span>Receiver Name</span>

                        <strong>{shipment.receiverName}</strong>

                    </div>

                    <div className="detail-row">

                        <span>Delivery Address</span>

                        <strong>{shipment.deliveryAddress}</strong>

                    </div>

                </div>

                {/* Driver */}

                <div className="section-card">

                    <h2>

                        <FaTruck />

                        Driver Information

                    </h2>

                    <div className="detail-row">

                        <span>Driver Name</span>

                        <strong>{shipment.driverName}</strong>

                    </div>

                    <div className="detail-row">

                        <span>Vehicle Number</span>

                        <strong>{shipment.vehicleNumber}</strong>

                    </div>

                    <div className="detail-row">

                        <span>

                            <FaCalendarAlt />

                            Estimated Delivery

                        </span>

                        <strong>{shipment.estimatedDelivery}</strong>

                    </div>

                </div>

                <div className="button-group">

    

    <button
    className="view-back-btn"
    onClick={() => {

        const role = localStorage.getItem("role");

        if (role === "ADMIN") {

            navigate("/admin-dashboard");

        } else if (role === "DRIVER") {

            navigate("/driver-dashboard");

        } else if (role === "CUSTOMER") {

            navigate("/customer-dashboard");

        } else {

            navigate("/");

        }

    }}
>
    <FaArrowLeft />
    <span>Back</span>
</button>

    <button
        className="view-track-btn"
        onClick={() => navigate(`/track-shipment/${shipment.id}`)}
    >
        <FaMapMarkerAlt />
        <span>Track Shipment</span>
    </button>

</div>

                

            </div>

        </div>

    );

}

export default ViewShipment;