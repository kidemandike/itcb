// src/api/engineeringDriving.js - College of Engineering & Driving School Endpoints

import { fetchApi, API_BASE_URL } from './core';

const engineeringDrivingApi = {
    // --- College of Engineering (CoE) Specific Functions (Non-Driving) ---
    getEngineeringProjects: (token) => fetchApi("/engineering/projects", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    updateProjectMilestone: (token, projectId, milestoneId, status) => fetchApi(`/engineering/projects/${projectId}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
    }),

    // =================================================================================
    // --- Engineering Department - Driving School Functions ---
    // =================================================================================

    // --- Course Management ---
    getDrivingCourses: (token) => fetchApi("/engineering/driving-courses", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getAvailableDrivingCourses: (token) => fetchApi("/engineering/driving-courses/available", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getDrivingCourseById: (token, courseId) => fetchApi(`/engineering/driving-courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    announceDrivingCourse: (token, courseData) => fetchApi("/engineering/driving/courses", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseData),
    }),

    updateDrivingCourse: (token, courseId, courseData) => fetchApi(`/engineering/driving-courses/${courseId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseData),
    }),

    deleteDrivingCourse: (token, courseId) => fetchApi(`/engineering/driving-courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    }),

    // --- Application Management ---
    getDrivingApplications: (token) => fetchApi("/engineering/driving-applications", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getMyDrivingApplications: (token) => fetchApi("/engineering/driving-applications/my-applications", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getDrivingCourseApplications: (token, courseId) => fetchApi(`/engineering/driving-courses/${courseId}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    applyForDrivingCourse: (token, applicationData) => fetchApi("/engineering/driving-applications/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(applicationData),
    }),

    // --- MANUAL Course Status Management (HOD/Engineering Staff) ---
    updateDrivingCourseStatus: (token, applicationId, status) => fetchApi(`/engineering/driving-applications/${applicationId}/course-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            course_status: status,
            manual_update: true // Flag to indicate manual update
        }),
    }),
    
    // Start course manually
    startDrivingCourse: (token, applicationId) => fetchApi(`/engineering/driving-applications/${applicationId}/start-course`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    }),
    
    // Complete course manually  
    completeDrivingCourse: (token, applicationId, grade = null) => fetchApi(`/engineering/driving-applications/${applicationId}/complete-course`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grade }),
    }),

    // --- Application Approval ---
    approveDrivingApplication: (token, applicationId) => fetchApi(`/engineering/driving-applications/${applicationId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    }),

    approveAllDrivingApplications: (token, courseId) => fetchApi(`/engineering/driving-courses/${courseId}/approve-applications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }),

    bulkApproveApplications: (token, courseId) => fetchApi(`/engineering/driving-courses/${courseId}/bulk-approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }),

    // --- MANUAL Control Number Management (Admin Only) ---
    assignRegistrationControlNumber: (token, applicationId, controlData) => {
        const payload = {
            control_number: controlData.controlNumber || null,
            auto_generate: false, // Always false for manual assignment
            amount: controlData.amount || 150000,
            payment_reference: controlData.paymentReference || '',
            manual_assignment: true, // Flag for manual assignment
            assigned_by: 'admin' // Track who assigned
        };
        return fetchApi(`/engineering/driving-applications/${applicationId}/assign-control-number`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
    },

    assignCertificateControlNumber: (token, applicationId, controlData) => {
        const payload = {
            certificate_control_number: controlData.controlNumber || null,
            auto_generate: false, // Always false for manual assignment
            certificate_amount: controlData.amount || 20000,
            payment_reference: controlData.paymentReference || '',
            manual_assignment: true, // Flag for manual assignment
            assigned_by: 'admin' // Track who assigned
        };
        return fetchApi(`/engineering/driving-applications/${applicationId}/assign-certificate-control-number`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
    },

    // Generate control number (for reference)
    generateControlNumber: (token, type = "registration") => fetchApi(`/engineering/control-numbers/generate?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    // --- Certificate Workflow ---
    requestDrivingCertificate: (token, applicationId) => fetchApi(`/engineering/driving-applications/${applicationId}/request-certificate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }),

approveCertificateRequest: (token, applicationId) => fetchApi(`/engineering/driving-applications/${applicationId}/approve-certificate`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
}),

    issueDrivingCertificate: (token, applicationId) => fetchApi(`/engineering/driving-applications/${applicationId}/issue-certificate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }),

    generateDrivingCertificatePDF: (token, applicationId, certificateData) => fetchApi(`/engineering/driving-applications/${applicationId}/generate-pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(certificateData),
    }),

    // --- Payment Management ---
    updateCertificatePaymentStatus: (token, applicationId, status) => fetchApi(`/engineering/driving-applications/${applicationId}/payment-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_status: status }),
    }),

    updateRegistrationPaymentStatus: (token, applicationId, status) => fetchApi(`/engineering/driving-applications/${applicationId}/registration-payment-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_status: status }),
    }),

    // --- Bulk Operations ---
    bulkUpdateApplicationStatus: (token, applicationIds, status) => fetchApi("/engineering/driving-applications/bulk-update-status", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            application_ids: applicationIds,
            status: status 
        }),
    }),

    // --- Reports and Analytics ---
    getDrivingSchoolReports: (token, quarter = null, year = null) => {
        let url = "/engineering/driving-school/reports";
        const params = new URLSearchParams();
        
        if (quarter) params.append('quarter', quarter);
        if (year) params.append('year', year);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return fetchApi(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    getDrivingSchoolStatistics: (token) => fetchApi("/engineering/driving-school/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getPendingCertificateRequests: (token) => fetchApi("/engineering/driving-applications/pending-certificates", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getCertificateRequests: (token) => fetchApi("/engineering/driving-applications/certificate-requests", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    // --- Search and Filter ---
    searchDrivingApplications: (token, query) => fetchApi(`/engineering/driving-applications/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    filterDrivingApplications: (token, filters) => fetchApi("/engineering/driving-applications/filter", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(filters),
    }),

    // --- Student Specific ---
    getStudentDrivingApplications: (token, studentId) => fetchApi(`/engineering/driving-applications/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    // --- Application Status Management ---
    getApplicationStatus: (token, applicationId) => fetchApi(`/engineering/driving-applications/${applicationId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    updateApplicationStatus: (token, applicationId, status) => fetchApi(`/engineering/driving-applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
    }),

    // --- Certificate Status Management ---
    getCertificateStatus: (token, applicationId) => fetchApi(`/engineering/driving-applications/${applicationId}/certificate-status`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    updateCertificateStatus: (token, applicationId, status) => fetchApi(`/engineering/driving-applications/${applicationId}/certificate-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
    }),

    // --- Revenue Reports ---
    getRevenueReports: (token, startDate, endDate) => {
        let url = "/engineering/driving-school/revenue-reports";
        const params = new URLSearchParams();
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return fetchApi(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    // --- Manual Control Number Validation ---
    validateControlNumber: (token, controlNumber, type = "registration") => fetchApi(`/engineering/control-numbers/validate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            control_number: controlNumber,
            type: type 
        }),
    }),

    // --- Get Control Number Statistics ---
    getControlNumberStats: (token) => fetchApi("/engineering/control-numbers/statistics", {
        headers: { Authorization: `Bearer ${token}` },
    }),
};

export default engineeringDrivingApi;