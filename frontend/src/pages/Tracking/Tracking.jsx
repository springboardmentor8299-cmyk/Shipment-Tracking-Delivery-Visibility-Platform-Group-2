import { useState } from "react";
import axios from "axios";

import Navbar from "../../components/Navbar";
import ShipmentTimeline from "../../components/ShipmentTimeline";

function Tracking() {

  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState(null);

  const searchShipment = async () => {

    if (trackingId.trim() === "") {
      alert("Please enter Tracking ID");
      return;
    }

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

      alert("Shipment Not Found!");

      setShipment(null);

    }

  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <div className="card shadow">

          <div className="card-header bg-primary text-white">
            <h3>Track Shipment</h3>
          </div>

          <div className="card-body">

            <div className="row">

              <div className="col-md-9">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />

              </div>

              <div className="col-md-3">

                <button
                  className="btn btn-primary w-100"
                  onClick={searchShipment}
                >
                  Track
                </button>

              </div>

            </div>

            {shipment && (

              <div className="mt-5">

                <h4 className="text-success mb-4">
                  Shipment Details
                </h4>

                <table className="table table-bordered">

                  <tbody>

                    <tr>
                      <th>Tracking ID</th>
                      <td>{shipment.trackingId}</td>
                    </tr>

                    <tr>
                      <th>Sender Name</th>
                      <td>{shipment.senderName}</td>
                    </tr>

                    <tr>
                      <th>Receiver Name</th>
                      <td>{shipment.receiverName}</td>
                    </tr>

                    <tr>
                      <th>Source</th>
                      <td>{shipment.source}</td>
                    </tr>

                    <tr>
                      <th>Destination</th>
                      <td>{shipment.destination}</td>
                    </tr>

                    <tr>
                      <th>Status</th>
                      <td>
                        <span
                          className={`badge ${
                            shipment.status === "Delivered"
                              ? "bg-success"
                              : shipment.status === "In Transit"
                              ? "bg-info"
                              : shipment.status === "Out for Delivery"
                              ? "bg-primary"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <th>Current Location</th>
                      <td>{shipment.currentLocation}</td>
                    </tr>

                  </tbody>

                </table>

                {/* Shipment Timeline */}

                <ShipmentTimeline status={shipment.status} />

              </div>

            )}

          </div>

        </div>

      </div>

    </>
  );

}

export default Tracking;