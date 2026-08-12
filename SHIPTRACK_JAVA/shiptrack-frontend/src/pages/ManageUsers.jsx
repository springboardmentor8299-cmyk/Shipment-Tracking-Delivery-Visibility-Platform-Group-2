import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

function ManageUsers() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [roleFilter, setRoleFilter] = useState("ALL");

    const [stats, setStats] = useState({
        totalUsers: 0,
        adminUsers: 0,
        supportUsers: 0,
        customerUsers: 0
    });

    const loggedInEmail =
        localStorage.getItem("email");

    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 8;

    useEffect(() => {

        fetchUsers();

        fetchStats();

    }, []);

    const fetchUsers = async () => {

        try {

            setLoading(true);

            const token =
                localStorage.getItem("token");

            const response =
                await api.get(
                    "/users",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setUsers(response.data);

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to load users"
            );

        } finally {

            setLoading(false);

        }

    };

    const fetchStats = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response =
                await api.get(
                    "/users/stats",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setStats(response.data);

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to load statistics"
            );

        }

    };

    const deleteUser = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this user?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            const token =
                localStorage.getItem("token");

            await api.delete(

                `/users/${id}`,

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );

            toast.success(
                "User deleted successfully"
            );

            fetchUsers();

            fetchStats();

        } catch (error) {

            console.error(error);

            toast.error(

                error.response?.data?.message ||

                "Failed to delete user"

            );

        }

    };

    const updateRole = async (

        userId,

        role

    ) => {

        try {

            const token =
                localStorage.getItem("token");

            await api.put(

                `/users/${userId}/role?role=${role}`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );

            toast.success(
                "Role updated successfully"
            );

            fetchUsers();

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to update role"
            );

        }

    };

    const getRoleBadge = (role) => {

        switch (role) {

            case "ROLE_ADMIN":
                return "danger";

            case "ROLE_SUPPORT":
                return "info";

            case "ROLE_CUSTOMER":
                return "success";

            default:
                return "secondary";

        }

    };

    const filteredUsers = useMemo(() => {

        return users.filter((user) => {

            const matchesSearch =

                user.fullName
                    ?.toLowerCase()
                    .includes(search.toLowerCase())

                ||

                user.email
                    ?.toLowerCase()
                    .includes(search.toLowerCase())

                ||

                user.phone
                    ?.toLowerCase()
                    .includes(search.toLowerCase())

                ||

                user.role?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesRole =

                roleFilter === "ALL"

                ||

                user.role?.name === roleFilter;

            return matchesSearch && matchesRole;

        });

    }, [users, search, roleFilter]);

    const totalPages =
        Math.ceil(filteredUsers.length / usersPerPage);

    const paginatedUsers =
        filteredUsers.slice(

            (currentPage - 1) * usersPerPage,

            currentPage * usersPerPage

        );

    return (

        <div className="container-fluid px-4 mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        User Management
                    </h2>

                    <p className="text-muted">
                        Manage users, roles and permissions.
                    </p>

                </div>

                <span className="badge bg-primary fs-6 px-3 py-2">

                    Total Users : {filteredUsers.length}

                </span>

            </div>

            {}

            <div className="row g-4 mb-4">

                <div className="col-lg-4">

                    <div className="card shadow border-0">

                        <div className="card-body d-flex align-items-center">

                            <div
                                className="bg-primary-subtle rounded-circle p-3 me-3"
                            >

                                <i className="bi bi-people-fill text-primary fs-3"></i>

                            </div>

                            <div>

                                <h6 className="text-muted mb-1">

                                    Total Users

                                </h6>

                                <h3 className="fw-bold">

                                    {stats.totalUsers}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-lg-4">

                    <div className="card shadow border-0">

                        <div className="card-body d-flex align-items-center">

                            <div
                                className="bg-danger-subtle rounded-circle p-3 me-3"
                            >

                                <i className="bi bi-shield-lock-fill text-danger fs-3"></i>

                            </div>

                            <div>

                                <h6 className="text-muted mb-1">

                                    Admin Users

                                </h6>

                                <h3 className="fw-bold">

                                    {stats.adminUsers}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-lg-4">

                    <div className="card shadow border-0">

                        <div className="card-body d-flex align-items-center">

                            <div
                                className="bg-info-subtle rounded-circle p-3 me-3"
                            >

                                <i className="bi bi-headset text-info fs-3"></i>

                            </div>

                            <div>

                                <h6 className="text-muted mb-1">

                                    Support Users

                                </h6>

                                <h3 className="fw-bold">

                                    {stats.supportUsers}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-lg-4">

                    <div className="card shadow border-0">

                        <div className="card-body d-flex align-items-center">

                            <div
                                className="bg-success-subtle rounded-circle p-3 me-3"
                            >

                                <i className="bi bi-person-check-fill text-success fs-3"></i>

                            </div>

                            <div>

                                <h6 className="text-muted mb-1">

                                    Customers

                                </h6>

                                <h3 className="fw-bold">

                                    {stats.customerUsers}

                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {}

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="row g-3">

                        <div className="col-lg-8">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Name, Email, Phone or Role"
                                value={search}
                                onChange={(e) => {

                                    setSearch(e.target.value);

                                    setCurrentPage(1);

                                }}
                            />

                        </div>

                        <div className="col-lg-4">

                            <select
                                className="form-select"
                                value={roleFilter}
                                onChange={(e) => {

                                    setRoleFilter(e.target.value);

                                    setCurrentPage(1);

                                }}
                            >

                                <option value="ALL">

                                    All Roles

                                </option>

                                <option value="ROLE_ADMIN">

                                    Admin

                                </option>

                                <option value="ROLE_SUPPORT">

                                    Support

                                </option>

                                <option value="ROLE_CUSTOMER">

                                    Customer

                                </option>

                            </select>

                        </div>

                    </div>

                </div>

            </div>

            {loading ? (

                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p className="mt-3">

                        Loading Users...

                    </p>

                </div>

            ) : (

                <div className="table-responsive">

                    <table className="table table-hover table-bordered align-middle">

                        <thead className="table-dark">

                        <tr>

                            <th>ID</th>

                            <th>Name</th>

                            <th>Email</th>

                            <th>Phone</th>

                            <th>Role</th>

                            <th>Change Role</th>

                            <th>Action</th>

                        </tr>

                        </thead>

                        <tbody>

                        {paginatedUsers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="text-center py-5"
                                >

                                    No Users Found

                                </td>

                            </tr>

                        ) : (

                            paginatedUsers.map((user) => (

                                <tr key={user.id}>

                                    <td>

                                        {user.id}

                                    </td>

                                    <td className="fw-semibold">

                                        {user.fullName}

                                    </td>

                                    <td>

                                        {user.email}

                                    </td>

                                    <td>

                                        {user.phone}

                                    </td>

                                    <td>

                                        <span
                                            className={`badge bg-${getRoleBadge(
                                                user.role?.name
                                            )}`}
                                        >

                                            {user.role?.name}

                                        </span>

                                    </td>

                                    <td>

                                        <select
                                            className="form-select form-select-sm"
                                            value={user.role?.name}
                                            disabled={
                                                user.email ===
                                                loggedInEmail
                                            }
                                            onChange={(e) =>
                                                updateRole(
                                                    user.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="ROLE_ADMIN">

                                                ROLE_ADMIN

                                            </option>

                                            <option value="ROLE_SUPPORT">

                                                ROLE_SUPPORT

                                            </option>

                                            <option value="ROLE_CUSTOMER">

                                                ROLE_CUSTOMER

                                            </option>

                                        </select>

                                    </td>

                                    <td>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                deleteUser(user.id)
                                            }
                                        >

                                            <i className="bi bi-trash-fill me-1"></i>

                                            Delete

                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                        </tbody>

                    </table>

                </div>

            )}

            {totalPages > 1 && (

                <nav className="mt-4">

                    <ul className="pagination justify-content-center">

                        <li
                            className={`page-item ${
                                currentPage === 1
                                    ? "disabled"
                                    : ""
                            }`}
                        >

                            <button
                                className="page-link"
                                onClick={() =>
                                    setCurrentPage(currentPage - 1)
                                }
                            >

                                Previous

                            </button>

                        </li>

                        {Array.from(
                            { length: totalPages },
                            (_, index) => (

                                <li
                                    key={index}
                                    className={`page-item ${
                                        currentPage ===
                                        index + 1
                                            ? "active"
                                            : ""
                                    }`}
                                >

                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage(
                                                index + 1
                                            )
                                        }
                                    >

                                        {index + 1}

                                    </button>

                                </li>

                            )
                        )}

                        <li
                            className={`page-item ${
                                currentPage === totalPages
                                    ? "disabled"
                                    : ""
                            }`}
                        >

                            <button
                                className="page-link"
                                onClick={() =>
                                    setCurrentPage(currentPage + 1)
                                }
                            >

                                Next

                            </button>

                        </li>

                    </ul>

                </nav>

            )}

        </div>

    );

}

export default ManageUsers;
