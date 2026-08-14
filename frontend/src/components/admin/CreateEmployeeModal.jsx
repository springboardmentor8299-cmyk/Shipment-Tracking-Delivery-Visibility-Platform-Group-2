import { useState } from "react";
import { addEmployee } from "../../services/userService";

const ROLES = [
    { value: "SUPPORT_ASSISTANT", label: "Support Assistant" },
    { value: "DELIVERY_OPERATOR", label: "Delivery Operator" },
    { value: "ADMIN", label: "Admin" },
];

function CreateEmployeeModal({ onSaved, onClose }) {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "SUPPORT_ASSISTANT",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
            setError("All fields are required.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const created = await addEmployee(formData);
            if (onSaved) onSaved(created);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Could not create employee.");
            setSaving(false);
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-person-plus me-2"></i>Add Employee
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="mb-3">
                            <label className="form-label">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g. john@shiptrack.com"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Phone *</label>
                            <input
                                type="text"
                                name="phone"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. 9876543210"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Role *</label>
                            <select
                                name="role"
                                className="form-select"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Temporary login password"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary bluebtn" onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-1"></i>Create Employee
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateEmployeeModal;
