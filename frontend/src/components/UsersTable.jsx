import "../styles/ShipmentTable.css";
import { useEffect, useState, useMemo } from "react";
import { getAllUsers } from "../services/userService";

// Helper to format role names cleanly (e.g., LOGISTICS_OPERATOR -> Logistics Operator)
const formatRoleLabel = (role) => {
    if (!role) return "User";
    return role
        .toLowerCase()
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Reusable DataTable component for ultimate clean structure
function UserDataTable({ title, subtitle, data, searchVal, setSearchVal, currentPage, setCurrentPage, loading, itemsPerPage = 7 }) {
    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = data.slice(indexOfFirst, indexOfLast);

    return (
        <div className="table-card">
            <div className="table-header">
                <div>
                    <div className="table-title-group">
                        <h2>{title}</h2>
                        <span className="count-badge">{data.length}</span>
                    </div>
                    <p className="table-subtitle">{subtitle}</p>
                </div>

                <div className="table-actions">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="table-search-input"
                            placeholder="Search accounts..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Details</th>
                            <th>Username / Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="table-state-cell">
                                    <div className="loader-spinner"></div> Loading accounts...
                                </td>
                            </tr>
                        ) : currentItems.length > 0 ? (
                            currentItems.map(u => {
                                const initials = u.name ? u.name.charAt(0).toUpperCase() : "?";
                                return (
                                    <tr key={u.id}>
                                        <td className="font-mono">#{u.id}</td>
                                        <td>
                                            <div className="user-profile-cell">
                                                <div className="user-avatar">{initials}</div>
                                                <span className="font-medium">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted">{u.username}</td>
                                        <td>
                                            <span className={`role-badge role-${u.role?.toLowerCase().replace(/_/g, '-')}`}>
                                                {formatRoleLabel(u.role)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="table-state-cell">
                                    No accounts match your search query.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-container">
                <span className="pagination-info">
                    Showing <strong>{data.length > 0 ? indexOfFirst + 1 : 0}</strong> to{" "}
                    <strong>{Math.min(indexOfLast, data.length)}</strong> of{" "}
                    <strong>{data.length}</strong> entries
                </span>

                <div className="pagination-controls">
                    <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                        disabled={currentPage === 1 || loading}
                    >
                        Previous
                    </button>

                    <div className="pagination-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`pagination-number ${page === currentPage ? "active" : ""}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button 
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                        disabled={currentPage === totalPages || loading}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

function UsersTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [customerSearch, setCustomerSearch] = useState("");
    const [staffSearch, setStaffSearch] = useState("");

    const [customerPage, setCustomerPage] = useState(1);
    const [staffPage, setStaffPage] = useState(1);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data || []);
        } catch (err) {
            console.error("Failed to load users:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter Customers vs Staff
    const filteredCustomers = useMemo(() => {
        const query = customerSearch.trim().toLowerCase();
        return users.filter(u => u.role?.toUpperCase() === "CUSTOMER").filter(u => 
            !query ||
            u.name?.toLowerCase().includes(query) ||
            u.username?.toLowerCase().includes(query) ||
            String(u.id).includes(query)
        );
    }, [users, customerSearch]);

    const filteredStaff = useMemo(() => {
        const query = staffSearch.trim().toLowerCase();
        return users.filter(u => u.role?.toUpperCase() !== "CUSTOMER").filter(u => 
            !query ||
            u.name?.toLowerCase().includes(query) ||
            u.username?.toLowerCase().includes(query) ||
            u.role?.toLowerCase().includes(query) ||
            String(u.id).includes(query)
        );
    }, [users, staffSearch]);

    useEffect(() => { setCustomerPage(1); }, [customerSearch]);
    useEffect(() => { setStaffPage(1); }, [staffSearch]);

    return (
        <div className="users-tables-container">
            <UserDataTable
                title="Customers"
                subtitle="Registered client accounts using platform tracking"
                data={filteredCustomers}
                searchVal={customerSearch}
                setSearchVal={setCustomerSearch}
                currentPage={customerPage}
                setCurrentPage={setCustomerPage}
                loading={loading}
            />

            <UserDataTable
                title="Staff & Operations"
                subtitle="Logistics operators, support agents, business clients, and administrators"
                data={filteredStaff}
                searchVal={staffSearch}
                setSearchVal={setStaffSearch}
                currentPage={staffPage}
                setCurrentPage={setStaffPage}
                loading={loading}
            />
        </div>
    );
}

export default UsersTable;