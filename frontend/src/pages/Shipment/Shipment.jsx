import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";

function Shipment() {

    const navigate = useNavigate();

    const [shipment, setShipment] = useState({
        senderName: "",
        receiverName: "",
        receiverEmail: "",
        source: "",
        destination: "",
        status: "",
        currentLocation: ""
    });

    const handleChange = (e) => {
        setShipment({
            ...shipment,
            [e.target.name]: e.target.value
        });
    };

    const saveShipment = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:8080/api/shipments",
                shipment,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Shipment Added Successfully!");

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            alert("Unable to Add Shipment!");

        }

    };

    return (
        <>
            <Navbar />

            <div className="container mt-5">

                <div className="card shadow">

                    <div className="card-header bg-success text-white">

                        <h3>Add Shipment</h3>

                    </div>

                    <div className="card-body">

                        <form onSubmit={saveShipment}>

                            <div className="mb-3">
                                <label>Sender Name</label>
                                <input
                                    type="text"
                                    name="senderName"
                                    className="form-control"
                                    value={shipment.senderName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label>Receiver Name</label>
                                <input
                                    type="text"
                                    name="receiverName"
                                    className="form-control"
                                    value={shipment.receiverName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="mb-3">
    <label>Receiver Email</label>
    <input
        type="email"
        name="receiverEmail"
        className="form-control"
        placeholder="Enter Receiver Email"
        value={shipment.receiverEmail}
        onChange={handleChange}
        required
    />
</div>


                            <div className="mb-3">
                                <label>Source</label>
                                <input
                                    type="text"
                                    name="source"
                                    className="form-control"
                                    value={shipment.source}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label>Destination</label>
                                <input
                                    type="text"
                                    name="destination"
                                    className="form-control"
                                    value={shipment.destination}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label>Status</label>

                                <select
                                    name="status"
                                    className="form-control"
                                    value={shipment.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="Processing">Processing</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Delivered">Delivered</option>
                                </select>

                            </div>

                            <div className="mb-3">
                                <label>Current Location</label>
                                <input
                                    type="text"
                                    name="currentLocation"
                                    className="form-control"
                                    value={shipment.currentLocation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                            >
                                Save Shipment
                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </>
    );

}

export default Shipment;