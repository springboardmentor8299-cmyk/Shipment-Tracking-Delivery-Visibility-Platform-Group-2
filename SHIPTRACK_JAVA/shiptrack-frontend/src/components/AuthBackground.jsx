function AuthBackground() {
    return (
        <div className="auth-bg" aria-hidden="true">

            <div className="auth-bg-sun" />

            <div className="auth-bg-cloud auth-bg-cloud-1" />
            <div className="auth-bg-cloud auth-bg-cloud-2" />
            <div className="auth-bg-cloud auth-bg-cloud-3" />

            <div className="auth-bg-skyline" />

            <div className="auth-bg-vehicles">
                <div className="auth-bus auth-bus-1">
                    <i className="bi bi-truck-front-fill" />
                </div>
                <div className="auth-bus auth-bus-2">
                    <i className="bi bi-bus-front-fill" />
                </div>
                <div className="auth-bus auth-bus-3">
                    <i className="bi bi-truck" />
                </div>
                <div className="auth-bus auth-bus-4">
                    <i className="bi bi-bus-front" />
                </div>
            </div>

            <div className="auth-road">
                <div className="auth-road-line" />
            </div>

        </div>
    );
}

export default AuthBackground;
