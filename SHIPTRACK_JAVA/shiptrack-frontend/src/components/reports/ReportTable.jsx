function ReportTable({
    title,
    subtitle,
    columns = [],
    rows = [],
    emptyMessage = "No data available."
}) {

    return (

        <div className="card shadow border-0">

            <div className="card-body">

                <h5 className="fw-bold mb-1">

                    {title}

                </h5>

                {subtitle && (
                    <small className="text-muted">

                        {subtitle}

                    </small>
                )}

                {rows.length === 0 ? (

                    <div className="text-center text-muted py-4">

                        <i
                            className="bi bi-inbox"
                            style={{ fontSize: "2.5rem" }}
                        ></i>

                        <h6 className="mt-2">

                            {emptyMessage}

                        </h6>

                    </div>

                ) : (

                    <div className="table-responsive mt-3">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>

                                    {columns.map((column) => (

                                        <th
                                            key={column.key}
                                            className={
                                                column.align === "right"
                                                    ? "text-end"
                                                    : ""
                                            }
                                        >

                                            {column.label}

                                        </th>

                                    ))}

                                </tr>

                            </thead>

                            <tbody>

                                {rows.map((row, index) => (

                                    <tr key={index}>

                                        {columns.map((column) => (

                                            <td
                                                key={column.key}
                                                className={
                                                    column.align === "right"
                                                        ? "text-end"
                                                        : ""
                                                }
                                            >

                                                {row[column.key]}

                                            </td>

                                        ))}

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}

export default ReportTable;
