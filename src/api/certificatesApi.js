// certificateApi.js

import { fetchApi } from './core';

const certificateApi = {
    // =================================================================================
    // --- Language Studies Certificate Application Functions (ENHANCED) ---
    // =================================================================================
    getCertificateApplications: (token) => fetchApi("/certificate-applications", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getMyCertificateApplications: (token) => fetchApi("/certificate-applications/my-requests", { 
        headers: { Authorization: `Bearer ${token}` },
    }),

    submitCertificateApplication: (token, applicationData) => fetchApi("/certificate-applications/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(applicationData),
    }),

    approveCertificateApplication: (token, applicationId, newStatus) => fetchApi(`/certificate-applications/${applicationId}/approve-staff`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staff_status: newStatus }),
    }),

    setCertificateControlNumber: (token, applicationId, controlNumber) => fetchApi(`/certificate-applications/${applicationId}/control-number`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ control_number: controlNumber }),
    }),

    generateCertificatePDF: (token, applicationId) => fetchApi(`/certificate-applications/${applicationId}/generate-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    issueCertificate: (token, applicationId) => fetchApi(`/certificate-applications/${applicationId}/issue`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }),

    getCertificateApplicationById: (token, applicationId) => fetchApi(`/certificate-applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    updateCertificateApplicationStatus: (token, applicationId, statusData) => fetchApi(`/certificate-applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(statusData),
    }),

    bulkUpdateCertificateApplications: (token, applicationIds, status) => fetchApi("/certificate-applications/bulk-update", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            application_ids: applicationIds,
            staff_status: status 
        }),
    }),

    getCertificateStatistics: (token) => fetchApi("/certificate-applications/statistics", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    searchCertificateApplications: (token, query) => fetchApi(`/certificate-applications/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    // =================================================================================
    // --- Institute for Continuing Education (ICE) / Short Courses Functions ---
    // =================================================================================
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

export default certificateApi;