import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../../components/Navbar";

function EditShipment() {

  const { trackingId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState({
    trackingId: "",
    senderName: "",
    receiverName: "",
    source: "",
    destination: "",
    status: "",
    currentLocation: ""
  });

  useEffect(() => {
    loadShipment();
  }, []);

  const loadShipment = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8080/api/shipments/${trackingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShipment(response.data);

    } catch (error) {

      console.error(error);

      alert("Unable to load shipment.");

    }

  };

  const handleChange = (e) => {

    setShipment({
      ...shipment,
      [e.target.name]: e.target.value
    });

  };

  const updateShipment = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:8080/api/shipments/${trackingId}`,
        shipment,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Shipment Updated Successfully!");

      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      alert("Unable to update shipment.");

    }

  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <div className="card shadow">

          <div className="card-header bg-warning">
            <h3>Edit Shipment</h3>
          </div>

          <div className="card-body">

            <form onSubmit={updateShipment}>

              <div className="mb-3">
                <label>Tracking ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={shipment.trackingId}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label>Sender Name</label>
                <input
                  type="text"
                  name="senderName"
                  className="form-control"
                  value={shipment.senderName}
                  onChange={handleChange}
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
                />
              </div>

              <div className="mb-3">
                <label>Status</label>

                <select
                  name="status"
                  className="form-control"
                  value={shipment.status}
                  onChange={handleChange}
                >
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
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100"
              >
                Update Shipment
              </button>

            </form>

          </div>

        </div>

      </div>

    </>
  );
}

export default EditShipment;