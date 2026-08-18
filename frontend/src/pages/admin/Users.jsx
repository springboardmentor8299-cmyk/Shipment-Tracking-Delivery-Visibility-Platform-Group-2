import { useState, useEffect, useMemo } from "react";
import { getAllShipments, getAllUsers, registerUserAccount } from "../../services/shipmentService";
import { Users as UsersIcon, Search, Mail, Package, Plus, UserPlus, X, Shield, Truck, Briefcase, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";

function Users() {
  const [usersList, setUsersList] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, CUSTOMER, LOGISTICS_OPERATOR, BUSINESS_CLIENT

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "LOGISTICS_OPERATOR"
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchData = async () => {
    try {
      const [uList, sList] = await Promise.all([
        getAllUsers(),
        getAllShipments()
      ]);
      setUsersList(uList);
      setShipments(sList);
    } catch (err) {
      console.error("Error loading users/shipments data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute combined user records with shipment counts
  const enrichedUsers = useMemo(() => {
    // Map existing users
    const map = new Map();

    usersList.forEach(u => {
      map.set(u.username.toLowerCase(), {
        id: u.id,
        name: u.username,
        email: u.email,
        role: u.role || "CUSTOMER",
        shipments: 0
      });
    });

    // Count shipments per customer / receiver / operator
    shipments.forEach(s => {
      if (s.receiverName) {
        const key = s.receiverName.toLowerCase();
        if (map.has(key)) {
          map.get(key).shipments += 1;
        } else {
          // If receiver is not in users table yet, keep track as customer
          map.set(key, {
            id: null,
            name: s.receiverName,
            email: s.receiverEmail || "-",
            role: "CUSTOMER",
            shipments: 1
          });
        }
      }
    });

    return Array.from(map.values());
  }, [usersList, shipments]);

  const filteredUsers = useMemo(() => {
    return enrichedUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(query.trim().toLowerCase()) ||
                            u.email.toLowerCase().includes(query.trim().toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeTab === "ALL") return true;
      if (activeTab === "CUSTOMER") return u.role.toUpperCase() === "CUSTOMER";
      if (activeTab === "LOGISTICS_OPERATOR") {
        return ["LOGISTICS_OPERATOR", "OPERATOR", "DRIVER"].includes(u.role.toUpperCase());
      }
      if (activeTab === "BUSINESS_CLIENT") {
        return ["BUSINESS_CLIENT", "BUSINESS"].includes(u.role.toUpperCase());
      }
      return true;
    });
  }, [enrichedUsers, query, activeTab]);

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newUser.username || !newUser.email || !newUser.password) {
      setFormError("Username, email, and password are required.");
      return;
    }

    setCreating(true);
    try {
      await registerUserAccount({
        username: newUser.username.trim(),
        name: newUser.username.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role
      });

      setFormSuccess(`Successfully created ${getRoleDisplayName(newUser.role)} account for ${newUser.username}!`);
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "LOGISTICS_OPERATOR"
      });

      await fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Failed to create user:", err);
      setFormError(err.response?.data?.message || err.message || "Failed to create user account. Email/Username may already exist.");
    } finally {
      setCreating(false);
    }
  };

  const getRoleDisplayName = (roleStr) => {
    const r = (roleStr || "").toUpperCase();
    if (r === "LOGISTICS_OPERATOR" || r === "OPERATOR" || r === "DRIVER") return "Logistic Operator";
    if (r === "BUSINESS_CLIENT" || r === "BUSINESS") return "Business Agent";
    if (r === "SUPPORT_AGENT" || r === "SUPPORT") return "Support Agent";
    if (r === "ADMINISTRATOR" || r === "ADMIN") return "System Administrator";
    return "Customer";
  };

  const getRoleBadgeStyle = (roleStr) => {
    const r = (roleStr || "").toUpperCase();
    if (r === "LOGISTICS_OPERATOR" || r === "OPERATOR" || r === "DRIVER") {
      return { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", icon: Truck };
    }
    if (r === "BUSINESS_CLIENT" || r === "BUSINESS") {
      return { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe", icon: Briefcase };
    }
    if (r === "SUPPORT_AGENT" || r === "SUPPORT") {
      return { bg: "#fff7ed", color: "#ea580c", border: "#ffedd5", icon: Shield };
    }
    if (r === "ADMINISTRATOR" || r === "ADMIN") {
      return { bg: "#f1f5f9", color: "#0f172a", border: "#cbd5e1", icon: Shield };
    }
    return { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", icon: UserCheck };
  };

  return (
    <div className="admin-dashboard" style={{ paddingBottom: 40 }}>
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>Customers & User Accounts</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>Create and manage customer accounts, logistics operators, and business agents.</p>
        </div>

        {/* Action Button: Create Logistic Operator / User */}
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
            transition: "all 0.2s"
          }}
        >
          <UserPlus size={18} />
          Create User Account
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", padding: 4, borderRadius: 12 }}>
          {[
            { id: "ALL", label: "All Accounts" },
            { id: "CUSTOMER", label: "Customers" },
            { id: "LOGISTICS_OPERATOR", label: "Logistics Operators" },
            { id: "BUSINESS_CLIENT", label: "Business Agents" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                background: activeTab === tab.id ? "#ffffff" : "transparent",
                color: activeTab === tab.id ? "#2563eb" : "#64748b",
                boxShadow: activeTab === tab.id ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ minWidth: 280, flex: "0 1 340px", position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', gap: 10, boxShadow: '0 2px 6px rgba(15,23,42,0.03)' }}>
            <Search size={18} color="#94a3b8" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user by name or email..."
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 14, color: '#0f172a' }}
            />
          </div>
        </div>
      </div>

      {/* User Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const badge = getRoleBadgeStyle(user.role);
            const RoleIcon = badge.icon;

            return (
              <div
                key={user.name + (user.id || "")}
                style={{
                  padding: 22,
                  borderRadius: 16,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justify: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          background: `linear-gradient(135deg, ${badge.color}, #3b82f6)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 19
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{user.name}</h3>
                        <span style={{ fontSize: 12, color: "#64748b" }}>ID: #{user.id || "N/A"}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        borderRadius: 20,
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      <RoleIcon size={13} />
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#475569", marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Mail size={15} color="#94a3b8" />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Package size={15} color="#94a3b8" />
                      <span>Total Shipments: <strong style={{ color: "#0f172a" }}>{user.shipments}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 40, background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", color: "#94a3b8", textAlign: "center", gridColumn: "1 / -1" }}>
            <UsersIcon size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No user accounts found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search query or tab filter.</div>
          </div>
        )}
      </div>

      {/* Modal: Create User Account (Admin can create Logistic Operator, Business Agent, Customer) */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 28,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Create User Account</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Register a new Logistic Operator, Business Agent, or Customer</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} style={{ display: "grid", gap: 16 }}>
              {/* Account Role Selection */}
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Account Type / Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: 14,
                    color: "#0f172a",
                    outline: "none",
                    fontWeight: 600
                  }}
                >
                  <option value="LOGISTICS_OPERATOR">🚚 Logistics Operator (Driver / Fleet Agent)</option>
                  <option value="BUSINESS_CLIENT">💼 Business Agent (Corporate Client)</option>
                  <option value="CUSTOMER">👤 Standard Customer Account</option>
                  <option value="SUPPORT_AGENT">🛡️ Support Agent</option>
                </select>
              </div>

              {/* Username */}
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Username / Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Operator Alex / Business Corp"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 14,
                    color: "#0f172a",
                    outline: "none"
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. operator@shiptrack.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 14,
                    color: "#0f172a",
                    outline: "none"
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 14,
                    color: "#0f172a",
                    outline: "none"
                  }}
                />
              </div>

              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", background: "#fef2f2", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", background: "#f0fdf4", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  {formSuccess}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
