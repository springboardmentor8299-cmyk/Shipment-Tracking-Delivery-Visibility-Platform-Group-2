import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddShipment() {

    const navigate = useNavigate();

    const [shipment, setShipment] = useState({

        senderName: "",
        receiverName: "",
        receiverEmail: "",
        source: "",
        destination: "",
        status: "Processing",
        currentLocation: "",
        latitude: "",
        longitude: ""
    
    });

    const handleChange = (e) => {
        setShipment({
            ...shipment,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

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

            console.log(error);

            alert("Unable to add shipment.");

        }

    };

    return (

        <div className="container mt-5">

            <div className="card shadow">

                <div className="card-header bg-success text-white">

                    <h3>Add Shipment</h3>

                </div>

                <div className="card-body">

                    <form onSubmit={handleSubmit}>

                        

                        <div className="mb-3">

                            <label>Sender Name</label>

                            <input
                                className="form-control"
                                name="senderName"
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="mb-3">

                            <label>Receiver Name</label>

                            <input
                                className="form-control"
                                name="receiverName"
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="mb-3">

    <label>Receiver Email</label>

    <input
        type="email"
        className="form-control"
        name="receiverEmail"
        onChange={handleChange}
        required
    />

</div>





                        <div className="mb-3">

                            <label>Source</label>

                            <input
                                className="form-control"
                                name="source"
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="mb-3">

                            <label>Destination</label>

                            <input
                                className="form-control"
                                name="destination"
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="mb-3">

                            <label>Status</label>

                            <select
                                className="form-control"
                                name="status"
                                value={shipment.status}
                                onChange={handleChange}
                            >

                                <option value="">Select Status</option>

                                <option>Processing</option>

                                <option>In Transit</option>

                                <option>Delayed</option>

                                <option>Delivered</option>

                            </select>

                        </div>

                        <div className="mb-3">

                            <label>Current Location</label>

                            <input
                                className="form-control"
                                name="currentLocation"
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="mb-3">

    <label>Latitude</label>

    <input
        type="number"
        step="any"
        className="form-control"
        name="latitude"
        value={shipment.latitude}
        onChange={handleChange}
        required
    />

</div>

<div className="mb-3">

    <label>Longitude</label>

    <input
        type="number"
        step="any"
        className="form-control"
        name="longitude"
        value={shipment.longitude}
        onChange={handleChange}
        required
    />

</div>

<button className="btn btn-success w-100">
    Save Shipment
</button>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default AddShipment;