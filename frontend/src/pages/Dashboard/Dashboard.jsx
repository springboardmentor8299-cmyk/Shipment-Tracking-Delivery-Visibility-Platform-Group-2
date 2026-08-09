import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { toast } from "react-toastify";
import DeliveryReport from "../../components/DeliveryReport";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

import Navbar from "../../components/Navbar";


function Dashboard() {

    const navigate = useNavigate();

    const [shipments, setShipments] = useState([]);

    const [search, setSearch] = useState("");


    const userName = localStorage.getItem("fullName");

    const role = localStorage.getItem("role");



    useEffect(() => {

        fetchShipments();

    }, []);





    // UPDATED FETCH FUNCTION

    const fetchShipments = async () => {

        try {
            const token = localStorage.getItem("token");

            console.log("Token:", token);
            console.log("Role:", localStorage.getItem("role"));
    

    
    
            const response = await axios.get(

                "http://localhost:8080/api/shipments",
            
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            
            );
    
            console.log("API Response:", response.data);
            setShipments(
                Array.isArray(response.data)
                ? response.data
                : []
            );
    
    
        } catch(error) {
    
    
            console.error(error);
    
            toast.error("Unable to fetch shipments.");
    
    
        }
    
    };





    
    
    
    const deleteShipment = async(trackingId)=>{


        const confirmDelete = window.confirm(
            "Are you sure you want to delete this shipment?"
        );


        if(!confirmDelete)
            return;



        try{


            const token = localStorage.getItem("token");



            await axios.delete(

                `http://localhost:8080/api/shipments/${trackingId}`,
            
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            
            );



            toast.error("Shipment Deleted Successfully!");

            fetchShipments();



        }
        catch(error){


            console.error(error);

            toast.error("Unable to delete shipment.");


        }


    };




    const exportPDF = () => {

        const doc = new jsPDF();
    
        doc.setFontSize(18);
        doc.text("ShipTrack Pro - Shipment Report", 14, 20);
    
        const tableColumn = [
            "Tracking ID",
            "Sender",
            "Receiver",
            "Source",
            "Destination",
            "Status",
            "Current Location"
        ];
    
        const tableRows = [];
    
        shipments.forEach((shipment) => {
    
            tableRows.push([
                shipment.trackingId,
                shipment.senderName,
                shipment.receiverName,
                shipment.source,
                shipment.destination,
                shipment.status,
                shipment.currentLocation
            ]);
    
        });
    
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30
        });
    
        doc.save("Shipments_Report.pdf");
    
    };
    











    // Data for Chart

    const chartData = [

        {
            name:"Processing",
            count:
            shipments.filter(
                s=>s.status==="Processing"
            ).length
        },


        {
            name:"In Transit",
            count:
            shipments.filter(
                s=>s.status==="In Transit"
            ).length
        },


        {
            name:"Delivered",
            count:
            shipments.filter(
                s=>s.status==="Delivered"
            ).length
        }

    ];






    return (

        <>


        <Navbar />


        <div className="container mt-5">



            <div className="d-flex justify-content-between align-items-center mb-4">


                <div>


                    <h3 className="fw-bold text-primary">
                        👋 Welcome, {userName}
                    </h3>



                    <h2 className="fw-bold">
                        ShipTrack Pro Dashboard
                    </h2>



                    <p className="text-muted">
                        Shipment Tracking & Delivery Visibility Platform
                    </p>



                </div>




                <div>

                {
role === "ADMIN" && (

<button
    className="btn btn-success me-2"
    onClick={() => navigate("/shipment")}
>
    + Add Shipment
</button>

)
}

    <button
        className="btn btn-danger"
        onClick={exportPDF}
    >
        📄 Export PDF
    </button>

</div>



            </div>






            {/* Dashboard Cards */}


            <div className="row mb-4">



                <div className="col-md-3">

                    <div className="card bg-primary text-white shadow">

                        <div className="card-body text-center">

                            <h5>Total Shipments</h5>

                            <h2>{shipments.length}</h2>

                        </div>

                    </div>

                </div>




                <div className="col-md-3">

                    <div className="card bg-warning text-dark shadow">

                        <div className="card-body text-center">

                            <h5>Processing</h5>

                            <h2>
                                {
                                shipments.filter(
                                    s=>s.status==="Processing"
                                ).length
                                }
                            </h2>

                        </div>

                    </div>

                </div>





                <div className="col-md-3">

                    <div className="card bg-info text-white shadow">


                        <div className="card-body text-center">


                            <h5>In Transit</h5>


                            <h2>
                                {
                                shipments.filter(
                                    s=>s.status==="In Transit"
                                ).length
                                }
                            </h2>


                        </div>


                    </div>


                </div>






                <div className="col-md-3">


                    <div className="card bg-success text-white shadow">


                        <div className="card-body text-center">


                            <h5>Delivered</h5>


                            <h2>
                                {
                                shipments.filter(
                                    s=>s.status==="Delivered"
                                ).length
                                }
                            </h2>


                        </div>


                    </div>


                </div>



            </div>







            








            {/* Search */}



            <div className="mb-4">


                <input

                    type="text"

                    className="form-control"

                    placeholder="🔍 Search by Tracking ID..."

                    value={search}

                    onChange={
                        e=>setSearch(e.target.value)
                    }

                />


            </div>







            {/* Shipment Table */}



            <div className="card shadow">



                <div className="card-header bg-primary text-white">


                    <h5 className="mb-0">

                        All Shipments

                    </h5>


                </div>




                <div className="card-body">



                    <table className="table table-bordered table-hover">


                    <thead className="table-light">


                    <tr>

                        <th>Tracking ID</th>

                        <th>Sender</th>

                        <th>Receiver</th>

                        <th>Source</th>

                        <th>Destination</th>

                        <th>Status</th>

                        <th>Current Location</th>

                        <th>Actions</th>


                    </tr>


                    </thead>




                    <tbody>



                    {
                    shipments

                    .filter(
                        shipment=>
                        shipment.trackingId
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )


                    .map(shipment=>(


                    <tr key={shipment.id}>


                        <td>{shipment.trackingId}</td>

                        <td>{shipment.senderName}</td>

                        <td>{shipment.receiverName}</td>

                        <td>{shipment.source}</td>

                        <td>{shipment.destination}</td>



                        <td>

                            <span className="badge bg-success">

                                {shipment.status}

                            </span>


                        </td>



                        <td>

                            {shipment.currentLocation}

                        </td>




                        <td>

<button
    className="btn btn-info btn-sm me-2"
    onClick={() =>
        navigate(
            `/shipment-details/${shipment.trackingId}`
        )
    }
>
    View
</button>

{
role === "ADMIN" && (

<>

<button
    className="btn btn-primary btn-sm me-2"
    onClick={() =>
        navigate(
            `/edit-shipment/${shipment.trackingId}`
        )
    }
>
    Edit
</button>


<button
    className="btn btn-danger btn-sm"
    onClick={() =>
        deleteShipment(
            shipment.trackingId
        )
    }
>
    Delete
</button>

</>

)
}



</td>



                    </tr>


                    ))}



                    </tbody>



                    </table>



                </div>



            </div>

            {/* Analytics Chart */}

<div className="card shadow mt-4">

<div className="card-header bg-dark text-white">

    <h5 className="mb-0">
        📊 Shipment Analytics
    </h5>

</div>


<div className="card-body">


    <ResponsiveContainer width="100%" height={300}>


        <BarChart data={chartData}>


            <CartesianGrid strokeDasharray="3 3" />


            <XAxis dataKey="name" />


            <YAxis />


            <Tooltip />


            <Bar
                dataKey="count"
                fill="#0d6efd"
            />


        </BarChart>


    </ResponsiveContainer>

    <div className="mt-5">

    <DeliveryReport />
    </div>


</div>


</div>




        </div>



        </>

    );

}


export default Dashboard;