function KeyMetrics({ metrics = {} }) {

    const cards = [

        {
            title: "Delivery Success Rate",
            value: Number(metrics.successRate ?? 0),
            unit: "%",
            icon: "bi-emoji-smile-fill",
            color: "success"
        },

        {
            title: "Average Delivery Time",
            value: Number(metrics.avgDeliveryTime ?? 0),
            unit: "min",
            icon: "bi-stopwatch-fill",
            color: "primary"
        },

        {
            title: "Average Delay",
            value: Number(metrics.avgDelay ?? 0),
            unit: "min",
            icon: "bi-alarm-fill",
            color: "warning"
        },

        {
            title: "Failed Deliveries",
            value: Number(metrics.failedDeliveries ?? 0),
            unit: "",
            icon: "bi-x-circle-fill",
            color: "danger"
        }

    ];

    return (

        <div className="row g-4 mt-1">

            {cards.map((card) => (

                <div
                    className="col-6 col-md-4 col-xl"
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

                                        {card.unit && (
                                            <span className="fs-6 text-muted">

                                                {" "}{card.unit}

                                            </span>
                                        )}

                                    </h2>

                                    {card.subtitle && (
                                        <small className="text-muted">

                                            {card.subtitle}

                                        </small>
                                    )}

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

export default KeyMetrics;
