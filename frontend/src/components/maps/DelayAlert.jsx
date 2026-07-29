function DelayAlert({ delay }) {
    if (!delay) return null;

    const severity = delay.probability >= 70 ? 'danger' : delay.probability >= 40 ? 'warning' : 'info';

    return (
        <div className={`alert alert-${severity} d-flex align-items-center gap-2 mb-3 rounded-4`}>
            <i className="bi bi-exclamation-triangle-fill fs-4"></i>
            <div>
                <strong className="d-block">
                    Delay Detected: ~{delay.delayMinutes} min
                </strong>
                <span className="small">
                    {delay.reason} ({delay.probability}% probability)
                </span>
            </div>
        </div>
    );
}

export default DelayAlert;
