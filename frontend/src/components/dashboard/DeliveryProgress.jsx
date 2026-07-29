function DeliveryProgress({ stats }) {

    const total = stats?.total || 0;

    const pct = (value) => (total > 0 ? Math.round((value / total) * 100) : 0);

    const statuses = [
        { label: "Pending",        value: stats?.created || 0,        color: "bg-warning" },
        { label: "In Transit",     value: stats?.inTransit || 0,      color: "bg-primary" },
        { label: "Out for Delivery", value: stats?.outForDelivery || 0, color: "bg-info" },
        { label: "Delivered",      value: stats?.delivered || 0,      color: "bg-success" },
        { label: "Cancelled",      value: stats?.cancelled || 0,      color: "bg-danger" },
    ];

    return (

        <div className="chart-card">

            <h4 className="mb-4">

                Delivery Progress

            </h4>

            {statuses.map((s) => {
                const percent = pct(s.value);
                return (
                    <div key={s.label} className={s.label === "Cancelled" ? "" : "mb-4"}>
                        <div className="d-flex justify-content-between">
                            <span>{s.label}</span>
                            <span>{percent}%</span>
                        </div>
                        <div className="progress">
                            <div
                                className={`progress-bar ${s.color}`}
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}

        </div>

    );

}

export default DeliveryProgress;
