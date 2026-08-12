import { useState } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExportButtons({
    shipmentStats = {},
    userStats = {},
    monthlyTrend = [],
    metrics = {},
    reportLabel = "Report",
    reportColumns = [],
    reportRows = []
}) {

    const [exporting, setExporting] = useState(false);

    const metricRows = [

        ["Delivery Success Rate", `${Number(metrics.successRate ?? 0)}%`],
        ["Average Delivery Time", `${Number(metrics.avgDeliveryTime ?? 0)} min`],
        ["Average Delay", `${Number(metrics.avgDelay ?? 0)} min`],
        ["Failed Deliveries", Number(metrics.failedDeliveries ?? 0)]

    ];

    const reportRowValues = (row) =>
        reportColumns.map((column) => row[column.key]);

    const exportPDF = async () => {

        try {

            setExporting(true);

            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("Shipment Analytics Report", 14, 18);

            doc.setFontSize(10);
            doc.text(
                `Generated: ${new Date().toLocaleString()}`,
                14,
                26
            );

            
            autoTable(doc, {

                startY: 32,

                head: [["Metric", "Value"]],

                body: metricRows

            });

            
            if (reportRows.length > 0) {

                autoTable(doc, {

                    startY: doc.lastAutoTable.finalY + 10,

                    head: [reportColumns.map(column => column.label)],

                    body: reportRows.map(reportRowValues)

                });

            }

            
            autoTable(doc, {

                startY: doc.lastAutoTable.finalY + 10,

                head: [["Shipment Status", "Count"]],

                body: [

                    ["Created", shipmentStats.Created || 0],
                    ["Pending", shipmentStats.Pending || 0],
                    ["In Transit", shipmentStats["In Transit"] || 0],
                    ["Out For Delivery", shipmentStats["Out For Delivery"] || 0],
                    ["Delivered", shipmentStats.Delivered || 0],
                    ["Delivery Failed", shipmentStats["Delivery Failed"] || 0],
                    ["Cancelled", shipmentStats.Cancelled || 0],
                    ["Total", shipmentStats.Total || 0]

                ]

            });

            
            autoTable(doc, {

                startY: doc.lastAutoTable.finalY + 10,

                head: [["User Role", "Count"]],

                body: [

                    ["Admin", userStats.ROLE_ADMIN || 0],
                    ["Support", userStats.ROLE_SUPPORT || 0],
                    ["Customer", userStats.ROLE_CUSTOMER || 0]

                ]

            });

            
            autoTable(doc, {

                startY: doc.lastAutoTable.finalY + 10,

                head: [["Month", "Shipments"]],

                body: monthlyTrend.map(item => [

                    item.month,
                    item.count

                ])

            });

            doc.save("Shipment_Report.pdf");

            toast.success("PDF exported successfully.");

        } catch (error) {

            console.error(error);

            toast.error("Failed to export PDF.");

        } finally {

            setExporting(false);

        }

    };

    const exportCSV = async () => {

        try {

            setExporting(true);

            const rows = [

                ["Shipment Analytics Report"],

                [],

                ["Key Metrics"],

                ["Metric", "Value"]

            ];

            metricRows.forEach(row => rows.push(row));

            rows.push(

                [],

                [`${reportLabel} Report`],

                reportColumns.map(column => column.label)

            );

            reportRows.forEach(row => rows.push(reportRowValues(row)));

            rows.push(

                [],

                ["Shipment Statistics"],

                ["Status", "Count"],

                ["Created", shipmentStats.Created || 0],
                ["Pending", shipmentStats.Pending || 0],
                ["In Transit", shipmentStats["In Transit"] || 0],
                ["Out For Delivery", shipmentStats["Out For Delivery"] || 0],
                ["Delivered", shipmentStats.Delivered || 0],
                ["Delivery Failed", shipmentStats["Delivery Failed"] || 0],
                ["Cancelled", shipmentStats.Cancelled || 0],
                ["Total", shipmentStats.Total || 0],

                [],

                ["User Statistics"],

                ["Role", "Count"],

                ["Admin", userStats.ROLE_ADMIN || 0],
                ["Support", userStats.ROLE_SUPPORT || 0],
                ["Customer", userStats.ROLE_CUSTOMER || 0],

                [],

                ["Monthly Shipment Trend"],

                ["Month", "Shipments"]

            );

            monthlyTrend.forEach(item => {

                rows.push([

                    item.month,
                    item.count

                ]);

            });

            const csvContent = rows
                .map(row => row
                    .map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`)
                    .join(","))
                .join("\n");

            const blob = new Blob(

                [csvContent],

                {
                    type: "text/csv;charset=utf-8;"
                }

            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = "Shipment_Report.csv";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            toast.success("CSV exported successfully.");

        } catch (error) {

            console.error(error);

            toast.error("Failed to export CSV.");

        } finally {

            setExporting(false);

        }

    };

    const exportExcel = async () => {

        try {

            setExporting(true);

            const tableHtml = (title, headers, bodyRows) => `
                <tr><th colspan="${Math.max(headers.length, 1)}"
                    style="background:#0d6efd;color:#fff;font-weight:bold">
                    ${title}</th></tr>
                <tr>
                    ${headers.map(header => `<th style="background:#e9ecef;border:1px solid #dee2e6">${header}</th>`).join("")}
                </tr>
                ${bodyRows.map(row => `
                    <tr>
                        ${row.map(cell => `<td style="border:1px solid #dee2e6">${cell ?? ""}</td>`).join("")}
                    </tr>
                `).join("")}
            `;

            const reportHeaders = reportColumns.map(column => column.label);

            const html = `
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body>
                    <table>
                        <tr>
                            <td colspan="6" style="font-size:16px;font-weight:bold">
                                Shipment Analytics Report
                            </td>
                        </tr>
                        <tr>
                            <td colspan="6">
                                Generated: ${new Date().toLocaleString()}
                            </td>
                        </tr>
                    </table>
                    <br/>
                    <table border="1" cellspacing="0" cellpadding="4">
                        ${tableHtml(
                            "Key Metrics",
                            ["Metric", "Value"],
                            metricRows
                        )}
                    </table>
                    <br/>
                    <table border="1" cellspacing="0" cellpadding="4">
                        ${tableHtml(
                            `${reportLabel} Report`,
                            reportHeaders,
                            reportRows.map(reportRowValues)
                        )}
                    </table>
                    <br/>
                    <table border="1" cellspacing="0" cellpadding="4">
                        ${tableHtml(
                            "Shipment Statistics",
                            ["Status", "Count"],
                            [
                                ["Created", shipmentStats.Created || 0],
                                ["Pending", shipmentStats.Pending || 0],
                                ["In Transit", shipmentStats["In Transit"] || 0],
                                ["Out For Delivery", shipmentStats["Out For Delivery"] || 0],
                                ["Delivered", shipmentStats.Delivered || 0],
                                ["Delivery Failed", shipmentStats["Delivery Failed"] || 0],
                                ["Cancelled", shipmentStats.Cancelled || 0],
                                ["Total", shipmentStats.Total || 0]
                            ]
                        )}
                    </table>
                    <br/>
                    <table border="1" cellspacing="0" cellpadding="4">
                        ${tableHtml(
                            "User Statistics",
                            ["Role", "Count"],
                            [
                                ["Admin", userStats.ROLE_ADMIN || 0],
                                ["Support", userStats.ROLE_SUPPORT || 0],
                                ["Customer", userStats.ROLE_CUSTOMER || 0]
                            ]
                        )}
                    </table>
                    <br/>
                    <table border="1" cellspacing="0" cellpadding="4">
                        ${tableHtml(
                            "Monthly Shipment Trend",
                            ["Month", "Shipments"],
                            monthlyTrend.map(item => [item.month, item.count])
                        )}
                    </table>
                </body>
                </html>
            `;

            const blob = new Blob(

                [html],

                {
                    type: "application/vnd.ms-excel;charset=utf-8;"
                }

            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = "Shipment_Report.xls";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            toast.success("Excel exported successfully.");

        } catch (error) {

            console.error(error);

            toast.error("Failed to export Excel.");

        } finally {

            setExporting(false);

        }

    };

    const printReport = () => {

        window.print();

    };

    return (

        <div className="card shadow border-0 mt-4">

            <div className="card-body">

                <div className="d-flex flex-wrap justify-content-between align-items-center">

                    <div>

                        <h5 className="fw-bold mb-1">

                            Export Reports

                        </h5>

                        <small className="text-muted">

                            Download or print analytics reports.

                        </small>

                    </div>

                    <div className="mt-3 mt-md-0">

                        <button
                            className="btn btn-danger me-2"
                            onClick={exportPDF}
                            disabled={exporting}
                        >

                            <i className="bi bi-file-earmark-pdf-fill me-2"></i>

                            {exporting ? "Exporting..." : "Export PDF"}

                        </button>

                        <button
                            className="btn btn-success me-2"
                            onClick={exportExcel}
                            disabled={exporting}
                        >

                            <i className="bi bi-file-earmark-excel-fill me-2"></i>

                            {exporting ? "Exporting..." : "Export Excel"}

                        </button>

                        <button
                            className="btn btn-secondary me-2"
                            onClick={exportCSV}
                            disabled={exporting}
                        >

                            <i className="bi bi-filetype-csv me-2"></i>

                            {exporting ? "Exporting..." : "Export CSV"}

                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={printReport}
                            disabled={exporting}
                        >

                            <i className="bi bi-printer-fill me-2"></i>

                            Print

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ExportButtons;
