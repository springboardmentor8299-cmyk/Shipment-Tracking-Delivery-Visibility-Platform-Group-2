import { useEffect, useState } from "react";
import axios from "axios";

function DeliveryReport() {

    const [report, setReport] = useState(null);


    useEffect(() => {

        loadReport();

    }, []);



    const loadReport = async () => {

        try {

            const token = localStorage.getItem("token");


            const response = await axios.get(

                "http://localhost:8080/api/reports/delivery-performance",

                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }

            );


            setReport(response.data);
            console.log("Delivery Report Data:", response.data);


        } catch(error) {

            console.error(error);

        }

    };



    if(!report){

        return (
            <h5>
                Loading Delivery Report...
            </h5>
        );

    }



    return (

        <>

        <h4 className="mt-5 mb-3">
            📊 Delivery Performance
        </h4>


        <div className="row">


            <div className="col-md-3">

                <div className="card bg-primary text-white shadow">

                    <div className="card-body text-center">

                        <h5>Total Shipments</h5>

                        <h2>
                            {report.totalShipments}
                        </h2>

                    </div>

                </div>

            </div>





            <div className="col-md-3">

                <div className="card bg-success text-white shadow">

                    <div className="card-body text-center">

                        <h5>Delivered</h5>

                        <h2>
                            {report.deliveredShipments}
                        </h2>

                    </div>

                </div>

            </div>





            <div className="col-md-3">

                <div className="card bg-warning text-dark shadow">

                    <div className="card-body text-center">

                        <h5>Processing</h5>

                        <h2>
                            {report.pendingShipments}
                        </h2>

                    </div>

                </div>

            </div>





            <div className="col-md-3">

                <div className="card bg-info text-white shadow">

                    <div className="card-body text-center">

                        <h5>Success Rate</h5>

                        <h2>
                        {report.deliverySuccessRate 
    ? report.deliverySuccessRate.toFixed(2) 
    : "0.00"
}%
                        </h2>

                    </div>

                </div>

            </div>


        </div>


        </>

    );

}


export default DeliveryReport;