import "../styles/QuickActions.css";
import { getAllShipments } from '../services/shipmentService';

function QuickActions(){

    const handleGenerateReport = async () => {
        try {
            const shipments = await getAllShipments();
            if (!shipments || shipments.length === 0) {
                alert('No shipments to include in report');
                return;
            }

            // build CSV
            const keys = ['id','trackingId','customerName','origin','destination','status','shipmentDate','deliveryDate'];
            const csvRows = [keys.join(',')];
            shipments.forEach(s => {
                const row = keys.map(k => {
                    let v = s[k];
                    if (v === null || v === undefined) return '';
                    return '"' + String(v).replace(/"/g, '""') + '"';
                }).join(',');
                csvRows.push(row);
            });

            const csv = csvRows.join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shipments_report_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            alert('Report generated and downloaded');
        } catch (err) {
            console.error(err);
            alert('Failed to generate report');
        }
    }

    return(

        <div className="action-card">

            <h3>Quick Actions</h3>

            <button onClick={handleGenerateReport}>Generate Report</button>

        </div>

    );

}

export default QuickActions;