import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../api/adminService";
import "./ManageUsers.css";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error(error);
      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        user.fullName?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue) ||
        user.phone?.toLowerCase().includes(searchValue) ||
        user.role?.toLowerCase().includes(searchValue);

      const matchesRole =
        selectedRole === "ALL" || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const userCounts = useMemo(() => {
    return {
      total: users.length,
      customers: users.filter((user) => user.role === "CUSTOMER").length,
      logistics: users.filter(
        (user) => user.role === "LOGISTICS_OPERATOR"
      ).length,
      support: users.filter((user) => user.role === "SUPPORT_AGENT").length,
    };
  }, [users]);

  const formatRole = (role) => {
    if (!role) {
      return "Unknown";
    }

    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="manage-users-page">
      <div className="users-background-glow users-glow-one"></div>
      <div className="users-background-glow users-glow-two"></div>

      <header className="users-topbar">
        <Link to="/admin" className="users-brand">
          <div className="users-brand-icon">🚚</div>

          <div>
            <strong>
              ShipTrack<span>-Pro</span>
            </strong>
            <small>Administration Portal</small>
          </div>
        </Link>

        <div className="users-topbar-actions">
          <button
            type="button"
            className="users-refresh-button"
            onClick={loadUsers}
            disabled={loading}
          >
            <span className={loading ? "users-refreshing" : ""}>↻</span>
            Refresh
          </button>

          <Link to="/admin" className="users-back-button">
            <span>←</span>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="manage-users-main">
        <section className="users-page-header">
          <div>
            <div className="users-page-badge">
              <span></span>
              USER MANAGEMENT
            </div>

            <h1>Manage Platform Users</h1>

            <p>
              View registered users, monitor assigned roles and manage the
              people operating across ShipTrack-Pro.
            </p>
          </div>

          <Link to="/admin/create-staff" className="users-create-button">
            <span>＋</span>
            Create Staff
          </Link>
        </section>

        <section className="users-statistics-grid">
          <article className="users-stat-card users-total-card">
            <div className="users-stat-icon">👥</div>

            <div>
              <span>Total Users</span>
              <strong>{userCounts.total}</strong>
              <small>Registered accounts</small>
            </div>
          </article>

          <article className="users-stat-card users-customer-card">
            <div className="users-stat-icon">👤</div>

            <div>
              <span>Customers</span>
              <strong>{userCounts.customers}</strong>
              <small>Shipment customers</small>
            </div>
          </article>

          <article className="users-stat-card users-logistics-card">
            <div className="users-stat-icon">🚚</div>

            <div>
              <span>Logistics</span>
              <strong>{userCounts.logistics}</strong>
              <small>Operations staff</small>
            </div>
          </article>

          <article className="users-stat-card users-support-card">
            <div className="users-stat-icon">🎧</div>

            <div>
              <span>Support</span>
              <strong>{userCounts.support}</strong>
              <small>Support agents</small>
            </div>
          </article>
        </section>

        <section className="users-content-card">
          <div className="users-content-header">
            <div>
              <span className="users-section-label">USER DIRECTORY</span>
              <h2>All users</h2>
              <p>
                {filteredUsers.length} of {users.length} users displayed
              </p>
            </div>

            <div className="users-content-status">
              <span></span>
              System Active
            </div>
          </div>

          <div className="users-toolbar">
            <div className="users-search-box">
              <span className="users-search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search by name, email, phone or role..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="users-clear-search"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="users-filter-box">
              <span>Filter</span>

              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="CUSTOMER">Customer</option>
                <option value="BUSINESS_CLIENT">Business Client</option>
                <option value="LOGISTICS_OPERATOR">
                  Logistics Operator
                </option>
                <option value="SUPPORT_AGENT">Support Agent</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="users-error-message">
              <div>!</div>

              <div>
                <strong>Unable to load users</strong>
                <p>{error}</p>
              </div>

              <button type="button" onClick={loadUsers}>
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="users-loading-state">
              <div className="users-loader"></div>
              <h3>Loading users</h3>
              <p>Please wait while user records are retrieved.</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty-state">
              <div className="users-empty-icon">👥</div>
              <h3>No users found</h3>
              <p>
                No user records match your current search and filter settings.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("ALL");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact Information</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>User ID</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="users-profile-cell">
                          <div className="users-avatar">
                            {getInitials(user.fullName)}
                          </div>

                          <div>
                            <strong>{user.fullName || "Unnamed User"}</strong>
                            <span>Platform user</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="users-email-cell">
                          <span className="users-cell-icon">✉</span>
                          <span>{user.email || "Not available"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="users-phone-cell">
                          <span className="users-cell-icon">☎</span>
                          <span>{user.phone || "Not available"}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`users-role-badge users-role-${
                            user.role?.toLowerCase() || "unknown"
                          }`}
                        >
                          <span></span>
                          {formatRole(user.role)}
                        </span>
                      </td>

                      <td>
                        <span className="users-id-badge">
                          #{String(user.id).padStart(4, "0")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredUsers.length > 0 && (
            <div className="users-table-footer">
              <p>
                Showing <strong>{filteredUsers.length}</strong> user
                {filteredUsers.length !== 1 ? "s" : ""}
              </p>

              <span>ShipTrack-Pro User Directory</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManageUsersPage;