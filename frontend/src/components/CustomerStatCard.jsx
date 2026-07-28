import "../styles/StatCard.css";

function CustomerStatCard({ title, value, icon, color }) {

    return (

        <div
            className="stat-card"
            style={{
                borderLeft: `6px solid ${color}`
            }}
        >

            <div className="stat-info">

                <h3>{title}</h3>

                <h2>{value}</h2>

            </div>

            <div
                className="stat-icon"
                style={{
                    color: color
                }}
            >

                {icon}

            </div>

        </div>

    );

}

export default CustomerStatCard;