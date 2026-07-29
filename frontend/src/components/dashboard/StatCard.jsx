function StatCard({ icon, title, value, color }) {

    return (

        <div className="stat-card">

            <div
                className="stat-icon"
                style={{
                    background: color,
                }}
            >
                <i className={`bi ${icon}`}></i>
            </div>

            <div>

                <small>{title}</small>

                <h2>{value}</h2>

            </div>

        </div>

    );

}

export default StatCard;