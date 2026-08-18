import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";


function ShipmentTable() {


    const [shipments, setShipments] = useState([]);



    useEffect(() => {


        api
            .get("http://localhost:8080/api/shipments", {

                headers: {

                    Authorization:
                    "Bearer YOUR_TOKEN_HERE"

                }

            })
            .then((response) => {

                setShipments(response.data);

            })
            .catch((error) => {

                console.log("Error loading shipments", error);

            });


    }, []);



    return (

        <div>


            <h2>
                Recent Shipments
            </h2>



            <table>


                <thead>

                    <tr>

                        <th>
                            Tracking ID
                        </th>

                        <th>
                            Sender
                        </th>

                        <th>
                            Receiver
                        </th>

                        <th>
                            Address
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>


                </thead>



                <tbody>


                {

                    shipments.map((shipment)=>(


                        <tr key={shipment.id}>


                            <td>
                                {shipment.trackingNumber}
                            </td>


                            <td>
                                {shipment.senderName}
                            </td>


                            <td>
                                {shipment.receiverName}
                            </td>


                            <td>
                                {shipment.deliveryAddress}
                            </td>


                            <td>
                                {shipment.status}
                            </td>


                        </tr>


                    ))

                }


                </tbody>


            </table>


        </div>

    );

}


export default ShipmentTable;