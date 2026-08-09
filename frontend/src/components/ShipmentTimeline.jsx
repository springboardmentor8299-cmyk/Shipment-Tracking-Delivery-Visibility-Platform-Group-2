function ShipmentTimeline({ status }) {

    const steps = [
        "Order Created",
        "Processing",
        "In Transit",
        "Out for Delivery",
        "Delivered"
    ];

    const getCurrentStep = () => {

        switch (status) {

            case "Processing":
                return 1;

            case "In Transit":
                return 2;

            case "Out for Delivery":
                return 3;

            case "Delivered":
                return 4;

            default:
                return 0;
        }

    };

    const currentStep = getCurrentStep();

    return (

        <div className="card shadow mt-4">

            <div className="card-header bg-secondary text-white">

                <h5 className="mb-0">
                    🚚 Shipment Progress
                </h5>

            </div>

            <div className="card-body">

                {

                    steps.map((step, index) => (

                        <div
                            key={index}
                            className="d-flex align-items-center mb-3"
                        >

                            <div
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                        index <= currentStep
                                            ? "#198754"
                                            : "#dee2e6",
                                    color: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontWeight: "bold"
                                }}
                            >

                                {index + 1}

                            </div>

                            <div className="ms-3">

                                <strong>{step}</strong>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default ShipmentTimeline;