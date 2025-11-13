// src/api/auth.js - Auth & User Management Endpoints

import { fetchApi } from './core';

const authApi = {
    // --- Auth & User Management (General) ---
    login: (email, password) => fetchApi("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),

    register: (userData) => fetchApi("/register", {
        method: "POST",
        body: JSON.stringify(userData),
    }),

    getUserProfile: (token) => fetchApi("/me", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    // --- Admin Dashboard (User Management) ---
    getAdminAllUsers: (token) => fetchApi("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
    }),
    
    updateUserRole: (token, userId, role) => fetchApi(`/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
    }),
};

export default authApi;