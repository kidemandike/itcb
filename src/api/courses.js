// src/api/courses.js - General Course and Registration Endpoints

import { fetchApi } from './core';

const coursesApi = {
    // --- Student Dashboard (General Courses) ---
    getAllCourses: (token) => fetchApi("/courses", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getMyRegistrations: (token, userId) => fetchApi(`/users/${userId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    registerForCourse: (token, registrationData) => fetchApi("/courses/register", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(registrationData),
    }),

    // --- Departmental Dashboard (Staff) ---
    getCoursesByDepartment: (token, departmentName) => fetchApi(`/courses/department/${departmentName}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getRegistrationsByDepartment: (token, departmentName) => fetchApi(`/courses/department/${departmentName}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    // --- Admin Dashboard (Registrations Management) ---
    getAdminAllRegistrations: (token) => fetchApi("/admin/registrations", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    updateRegistrationPaymentStatus: (token, registrationId, status) => fetchApi(`/admin/registrations/${registrationId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_status: status }),
    }),

    updateRegistrationControlNo: (token, registrationId, controlNo) => fetchApi(`/admin/registrations/${registrationId}/control_no`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ control_no: controlNo }),
    }),
};

export default coursesApi;