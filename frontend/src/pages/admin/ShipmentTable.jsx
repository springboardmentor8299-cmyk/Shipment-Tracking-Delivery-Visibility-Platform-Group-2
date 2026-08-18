import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";


function ShipmentTable() {


    const [shipments, setShipments] = useState([]);



    useEffect(() => {


        const loadShipments = async () => {


            try {


                const response = await api.get("/shipments");


                console.log(
                    "Shipment API Response:",
                    response.data
                );


                setShipments(
                    Array.isArray(response.data)
                    ? response.data
                    : []
                );



            } catch(error) {


                console.error(
                    "Shipment Fetch Error:",
                    error
                );


            }


        };



        loadShipments();



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


                    shipments.length === 0 ? (


                        <tr>

                            <td colSpan="5">

                                No shipments found

                            </td>

                        </tr>


                    )

                    :


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