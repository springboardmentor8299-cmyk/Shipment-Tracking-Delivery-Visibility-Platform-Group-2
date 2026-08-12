function AdminStatsCards({ userAnalytics, shipmentAnalytics }) {

    const totalShipments = shipmentAnalytics?.Total || 0;

    const cards = [
        {
            title: "Admin Users",
            value: userAnalytics?.ROLE_ADMIN || 0,
            icon: "bi-people-fill",
            iconClass: "primary"
        },
        {
            title: "Customer Users",
            value: userAnalytics?.ROLE_CUSTOMER || 0,
            icon: "bi-person-heart",
            iconClass: "success"
        },
        {
            title: "Support Users",
            value: userAnalytics?.ROLE_SUPPORT || 0,
            icon: "bi-headset",
            iconClass: "info"
        },
        {
            title: "Total Shipments",
            value: totalShipments,
            icon: "bi-box-seam",
            iconClass: "dark"
        },
        {
            title: "Active Shipments",
            value: shipmentAnalytics?.Active || 0,
            icon: "bi-lightning-charge-fill",
            iconClass: "warning"
        },
        {
            title: "Active Drivers",
            value: shipmentAnalytics?.["Active Drivers"] || 0,
            icon: "bi-person-check-fill",
            iconClass: "success"
        },
        {
            title: "Delivered",
            value: shipmentAnalytics?.Delivered || 0,
            icon: "bi-check-circle-fill",
            iconClass: "success"
        },
        {
            title: "Deliveries Today",
            value: shipmentAnalytics?.["Deliveries Today"] || 0,
            icon: "bi-calendar-check-fill",
            iconClass: "success"
        },
        {
            title: "Delivery Success Rate",
            value: shipmentAnalytics?.["Delivery Success Rate"] != null
                ? `${shipmentAnalytics["Delivery Success Rate"]}%`
                : "0%",
            icon: "bi-graph-up-arrow",
            iconClass: "info"
        },
        {
            title: "In Transit",
            value: shipmentAnalytics?.["In Transit"] || 0,
            icon: "bi-truck",
            iconClass: "warning"
        },
        {
            title: "Pending",
            value: shipmentAnalytics?.Pending || 0,
            icon: "bi-hourglass-split",
            iconClass: "secondary"
        },
        {
            title: "Created",
            value: shipmentAnalytics?.Created || 0,
            icon: "bi-plus-circle-fill",
            iconClass: "primary"
        },
        {
            title: "Out For Delivery",
            value: shipmentAnalytics?.["Out For Delivery"] || 0,
            icon: "bi-bicycle",
            iconClass: "info"
        },
        {
            title: "Cancelled",
            value: shipmentAnalytics?.Cancelled || 0,
            icon: "bi-x-circle-fill",
            iconClass: "danger"
        },
        {
            title: "Delayed Shipments",
            value: shipmentAnalytics?.Delayed || 0,
            icon: "bi-exclamation-triangle-fill",
            iconClass: "warning"
        }
    ];

    return (

        <>

            <h4 className="dashboard-section-title mb-4">
                Platform Overview
            </h4>

            <div className="row g-4">

                {cards.map((card, index) => (

                    <div
                        className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12"
                        key={index}
                    >

                        <div className="dashboard-card stats-card h-100">

                            <div className="card-body p-4">

                                <div className="d-flex justify-content-between align-items-center">

                                    <div>

                                        <h6 className="card-title mb-2">
                                            {card.title}
                                        </h6>

                                        <h2 className="card-value mb-0">
                                            {card.value}
                                        </h2>

                                    </div>

                                    <div className={`stats-icon bg-${card.iconClass}-subtle`}>

                                        <i
                                            className={`bi ${card.icon} text-${card.iconClass}`}
                                        ></i>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </>

    );

}

export default AdminStatsCards;
