import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Navbar from "../../components/Navbar";
import ShipmentMap from "../../components/ShipmentMap";


function ShipmentDetails() {


    const { trackingId } = useParams();


    const [shipment, setShipment] = useState(null);

    const [signature, setSignature] = useState("");
    const [routeHistory, setRouteHistory] = useState([]);



    useEffect(() => {

        loadShipment();
    
        loadRouteHistory();
    
    }, []);




    const loadShipment = async () => {


        try {


            const token = localStorage.getItem("token");


            const response = await axios.get(

                `http://localhost:8080/api/shipments/${trackingId}`,

                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }

            );


            setShipment(response.data);



        } catch(error) {


            console.error(error);

            alert("Unable to load shipment details.");


        }


    };


    const loadRouteHistory = async () => {

        try {
    
            const token = localStorage.getItem("token");
    
    
            const response = await axios.get(
    
                `http://localhost:8080/api/shipments/${trackingId}/history`,
    
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
    
            );
    
    
            setRouteHistory(response.data);
    
    
            console.log("Route History:", response.data);
    
    
        } catch(error) {
    
            console.error(error);
    
        }
    
    };





    return (

        <>


        <Navbar />



        <div className="container mt-5">


            <div className="card shadow">


                <div className="card-header bg-primary text-white">


                    <h3>
                        Shipment Details
                    </h3>


                </div>





                <div className="card-body">


                    {

shipment ? (

    <>

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
                    <th>Receiver Email</th>
                    <td>{shipment.receiverEmail}</td>
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
                    <td>{shipment.status}</td>
                </tr>

                <tr>
                    <th>Current Location</th>
                    <td>{shipment.currentLocation}</td>
                </tr>


<tr>
    <th>Latitude</th>
    <td>{shipment.latitude}</td>
</tr>

<tr>
    <th>Longitude</th>
    <td>{shipment.longitude}</td>
</tr>


                <tr>
                    <th>ETA</th>
                    <td>
                        {shipment.etaHours
                            ? `${shipment.etaHours} hours`
                            : "Not available"}
                    </td>
                </tr>

                <tr>
                    <th>Expected Delivery</th>

                    <td>
                        {shipment.etaHours
                            ? new Date(
                                  Date.now() +
                                      shipment.etaHours *
                                          60 *
                                          60 *
                                          1000
                              ).toLocaleString()
                            : "Not available"}
                    </td>
                </tr>

                <tr>
                    <th>Delivery Status</th>

                    <td>
                        <span
                            className={
                                shipment.status === "Delivered"
                                    ? "badge bg-success"
                                    : "badge bg-primary"
                            }
                        >
                            {shipment.status === "Delivered"
                                ? "Delivered"
                                : "On Time"}
                        </span>
                    </td>
                </tr>

            </tbody>

        </table>

        <hr />

        <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter receiver signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
        />

        <button
            className="btn btn-success mb-3"
            onClick={async () => {

                const token = localStorage.getItem("token");

                await axios.put(

                    `http://localhost:8080/api/shipments/${trackingId}/deliver`,

                    {},

                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }

                );

                alert("Shipment Delivered!");

                loadShipment();

            }}
        >
            Confirm Delivery
        </button>

        <h4 className="mt-4 mb-3">
            Live Shipment Location
        </h4>



        {shipment.latitude && shipment.longitude ? (

            <ShipmentMap
                latitude={shipment.latitude}
                longitude={shipment.longitude}
                location={shipment.currentLocation}
            />

        ) : (

            <p>Location not available</p>

        )}
        <hr />

<h4 className="mt-4">
    Route History
</h4>


{
    routeHistory.length > 0 ? (

        <ul className="list-group">

            {
                routeHistory.map((route,index)=>(

                    <li 
                    className="list-group-item"
                    key={index}
                    >

                        <b>Location:</b> {route.location}
                        <br/>

                        <b>Status:</b> {route.status}
                        <br/>

                        <b>Time:</b> {route.timestamp}

                    </li>

                ))
            }

        </ul>


    ) : (

        <p>
            No route history available
        </p>

    )
}

    </>

) : (

                        <h5 className="text-center">
                            Loading shipment details...
                        </h5>

                    )


                    }



                </div>



            </div>



        </div>



        </>

    );

}


export default ShipmentDetails;