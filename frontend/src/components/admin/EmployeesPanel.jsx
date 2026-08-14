import { useEffect, useState } from "react";
import { fetchEmployees, removeEmployee } from "../../services/userService";
import CreateEmployeeModal from "./CreateEmployeeModal";
import { useAuth } from "../../context/AuthContext";

const ROLE_BADGES = {
    ADMIN: "bg-primary-subtle text-primary",
    SUPPORT_ASSISTANT: "bg-secondary-subtle text-secondary",
    DELIVERY_OPERATOR: "bg-info-subtle text-info",
};

const ROLE_LABELS = {
    ADMIN: "Admin",
    SUPPORT_ASSISTANT: "Support Assistant",
    DELIVERY_OPERATOR: "Delivery Operator",
};

function EmployeesPanel({ onDataChanged }) {

    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const loadEmployees = async () => {
        try {
            const data = await fetchEmployees();
            setEmployees(data);
        } catch {
            setError("Could not load employees.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadEmployees();
    }, []);

    const handleCreated = (employee) => {
        setEmployees((prev) => [employee, ...prev]);
        setShowForm(false);
        if (onDataChanged) onDataChanged();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        setDeletingId(id);
        setError("");
        try {
            await removeEmployee(id);
            setEmployees((prev) => prev.filter((e) => e.id !== id));
            if (onDataChanged) onDataChanged();
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete employee.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="recent-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Employees</h4>
                <button className="btn btn-primary-custom bluebtn" onClick={() => setShowForm((prev) => !prev)}>
                    {showForm ? "Close" : "+ Add Employee"}
                </button>
            </div>

            {showForm && (
                <CreateEmployeeModal onSaved={handleCreated} onClose={() => setShowForm(false)} />
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <p className="text-muted">Loading employees...</p>}
            {!loading && !error && employees.length === 0 && <p className="text-muted mb-0">No employees yet.</p>}

            {!loading && !error && employees.length > 0 && (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Phone</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>
                                        <span className={`badge ${ROLE_BADGES[employee.role] || "bg-secondary-subtle text-secondary"}`}>
                                            {ROLE_LABELS[employee.role] || employee.role}
                                        </span>
                                    </td>
                                    <td>{employee.phone}</td>
                                    <td>{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "-"}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            disabled={deletingId === employee.id || (user?.id != null && user.id === employee.id)}
                                            onClick={() => handleDelete(employee.id)}
                                            title={user?.id != null && user.id === employee.id ? "You cannot delete your own account" : "Delete Employee"}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default EmployeesPanel;
