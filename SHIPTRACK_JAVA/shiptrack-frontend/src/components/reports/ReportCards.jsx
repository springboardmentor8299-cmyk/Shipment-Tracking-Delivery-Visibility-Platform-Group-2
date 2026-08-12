function ReportCards({ shipmentStats = {}, userStats = {} }) {

    const cards = [

        {
            title: "Total Shipments",
            value: Number(shipmentStats.Total ?? 0),
            icon: "bi-box-seam-fill",
            color: "primary"
        },

        {
            title: "In Transit",
            value: Number(shipmentStats["In Transit"] ?? 0),
            icon: "bi-truck",
            color: "warning"
        },

        {
            title: "Delivered",
            value: Number(shipmentStats.Delivered ?? 0),
            icon: "bi-check-circle-fill",
            color: "success"
        },

        {
            title: "Pending",
            value: Number(shipmentStats.Pending ?? 0),
            icon: "bi-hourglass-split",
            color: "secondary"
        },

        {
            title: "Admins",
            value: Number(userStats.ROLE_ADMIN ?? 0),
            icon: "bi-shield-lock-fill",
            color: "danger"
        },

        {
            title: "Support",
            value: Number(userStats.ROLE_SUPPORT ?? 0),
            icon: "bi-headset",
            color: "primary"
        },

        {
            title: "Customers",
            value: Number(userStats.ROLE_CUSTOMER ?? 0),
            icon: "bi-people-fill",
            color: "success"
        }

    ];

    return (

        <div className="row g-4">

            {cards.map((card) => (

                <div
                    className="col-xl-3 col-lg-4 col-md-6"
                    key={card.title}
                >

                    <div
                        className="card border-0 shadow h-100 report-card"
                        aria-label={card.title}
                    >

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <small className="text-muted">

                                        {card.title}

                                    </small>

                                    <h2 className="fw-bold mt-2 mb-0">

                                        {card.value}

                                    </h2>

                                </div>

                                <div
                                    className={`bg-${card.color}-subtle rounded-circle p-3`}
                                >

                                    <i
                                        className={`bi ${card.icon} text-${card.color} fs-3`}
                                    ></i>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

}

export default ReportCards;
