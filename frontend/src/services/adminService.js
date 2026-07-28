import api from "./api";

export const getDashboardStats = async () => {

    const response = await api.get("/admin/dashboard", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    return response.data;
};