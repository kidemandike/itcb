// src/api/ice.js - Institute for Continuing Education (ICE) / Short Courses Endpoints

import { fetchApi } from './core';

const iceApi = {
    // --- Institute for Continuing Education (ICE) / Short Courses Functions ---
    issueShortCourseCertificate: (token, registrationId) => fetchApi(`/ice/registrations/${registrationId}/issue-certificate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }),

    getIceShortCourses: (token) => fetchApi("/ice/courses", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getIceCourseParticipants: (token, courseId) => fetchApi(`/ice/courses/${courseId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
    }),
};

export default iceApi;