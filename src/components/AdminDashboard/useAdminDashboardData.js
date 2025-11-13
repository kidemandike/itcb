// src/components/AdminDashboard/useAdminDashboardData.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api';

const useAdminDashboardData = (accessToken) => {
    const [users, setUsers] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [certificateRequests, setCertificateRequests] = useState([]);
    const [drivingApplications, setDrivingApplications] = useState([]);
    const [drivingCourses, setDrivingCourses] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Success message handler
    const showSuccess = useCallback((message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    }, []);

    // --- Data Fetching Functions ---
    const fetchUsers = useCallback(async () => {
        try {
            const usersData = await api.getAdminAllUsers(accessToken);
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setError(`Failed to load users: ${error.message}`);
        }
    }, [accessToken]);

    const fetchRegistrations = useCallback(async () => {
        try {
            const registrationsData = await api.getAdminAllRegistrations(accessToken);
            setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
            setError(`Failed to load registrations: ${error.message}`);
        }
    }, [accessToken]);

    const fetchCourses = useCallback(async () => {
        try {
            const coursesData = await api.getAllCourses(accessToken);
            setCourses(Array.isArray(coursesData) ? coursesData : []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setError(`Failed to load courses: ${error.message}`);
        }
    }, [accessToken]);

    const fetchCertificateRequests = useCallback(async () => {
        try {
            const requestsData = await api.getCertificateApplications(accessToken);
            setCertificateRequests(Array.isArray(requestsData) ? requestsData : []);
        } catch (error) {
            console.error('Failed to fetch certificate requests:', error);
            setError(`Failed to load certificate requests: ${error.message}`);
        }
    }, [accessToken]);

    const fetchDrivingApplications = useCallback(async () => {
        try {
            const drivingAppsData = await api.getDrivingApplications(accessToken);
            setDrivingApplications(Array.isArray(drivingAppsData) ? drivingAppsData : []);
        } catch (error) {
            console.error('Failed to fetch driving applications:', error);
            setError(`Failed to load driving applications: ${error.message}`);
        }
    }, [accessToken]);

    const fetchDrivingCourses = useCallback(async () => {
        try {
            const drivingCoursesData = await api.getDrivingCourses(accessToken);
            setDrivingCourses(Array.isArray(drivingCoursesData) ? drivingCoursesData : []);
        } catch (error) {
            console.error('Failed to fetch driving courses:', error);
            setError(`Failed to load driving courses: ${error.message}`);
        }
    }, [accessToken]);

    // Initial data loading
    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchUsers(),
                fetchRegistrations(),
                fetchCourses(),
                fetchCertificateRequests(),
                fetchDrivingApplications(),
                fetchDrivingCourses()
            ]);
        } catch (e) {
            console.error('Error loading dashboard data:', e);
            setError('Failed to load dashboard data. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [fetchUsers, fetchRegistrations, fetchCourses, fetchCertificateRequests, fetchDrivingApplications, fetchDrivingCourses]);

    useEffect(() => {
        if (accessToken) {
            loadAllData();
        }
    }, [accessToken, loadAllData]);

    // --- Action Handlers ---

    // Admin: Manual control number assignment for registration
    const handleAssignRegistrationControlNumber = useCallback(async (applicationId, controlNumber) => {
        setActionLoading(true);

        const controlData = {
            controlNumber: controlNumber,
            autoGenerate: false,
            amount: 150000
        };

        try {
            await api.assignRegistrationControlNumber(accessToken, applicationId, controlData);

            setDrivingApplications(prev =>
                prev.map(app => app.id === applicationId ? {
                    ...app,
                    registration_control_number: controlNumber,
                    registration_fee_amount: 150000,
                    registration_payment_status: 'Control No Assigned'
                } : app)
            );

            showSuccess('Registration control number assigned successfully! Fee: Tsh 150,000');
            setError(null);

        } catch (error) {
            console.error('Failed to assign registration control number:', error);
            setError(`Failed to assign registration control number: ${error.message}`);

        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    // Admin: Manual control number assignment for certificate
    const handleAssignCertificateControlNumber = useCallback(async (applicationId, controlNumber) => {
        const controlData = {
            controlNumber: controlNumber,
            autoGenerate: false,
            amount: 20000,
        };

        setActionLoading(true);
        try {
            await api.assignCertificateControlNumber(
                accessToken,
                applicationId,
                controlData
            );

            setDrivingApplications(prev =>
                prev.map(app => app.id === applicationId ? {
                    ...app,
                    certificate_control_number: controlNumber,
                    certificate_fee_amount: 20000,
                    certificate_payment_status: 'Control No Assigned'
                } : app)
            );
            showSuccess('Certificate control number assigned successfully! Fee: Tsh 20,000');
            setError(null);


        } catch (error) {
            console.error("Failed to assign certificate control number:", error);
            setError(`Failed to assign certificate control number: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);


    const handleStartCourse = useCallback(async (applicationId) => {
        setActionLoading(true);
        try {
            await api.updateDrivingCourseStatus(accessToken, applicationId, 'Started');

            setDrivingApplications(prev =>
                prev.map(app => app.id === applicationId ? {
                    ...app,
                    course_status: 'Started',
                    course_started_at: new Date().toISOString()
                } : app)
            );

            showSuccess('Course marked as started successfully!');
            setError(null);

        } catch (error) {
            console.error('Failed to start course:', error);
            setError(`Failed to start course: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleCompleteCourse = useCallback(async (applicationId) => {
        setActionLoading(true);
        try {
            await api.updateDrivingCourseStatus(accessToken, applicationId, 'Completed');

            setDrivingApplications(prev =>
                prev.map(app => app.id === applicationId ? {
                    ...app,
                    course_status: 'Completed',
                    course_completed_at: new Date().toISOString()
                } : app)
            );

            showSuccess('Course marked as completed successfully!');
            setError(null);

        } catch (error) {
            console.error('Failed to complete course:', error);
            setError(`Failed to complete course: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleApproveCertificateRequest = useCallback(async (applicationId) => {
        setActionLoading(true);
        try {
            await api.approveCertificateRequest(accessToken, applicationId);

            setDrivingApplications(prev =>
                prev.map(app => app.id === applicationId ? {
                    ...app,
                    certificate_approved: true,
                    certificate_approval_date: new Date().toISOString()
                } : app)
            );
            showSuccess('Certificate request approved successfully!');
            setError(null);
        } catch (error) {
            console.error('Failed to approve certificate request:', error);
            setError(`Failed to approve certificate request: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleRequestCertificate = useCallback(async (applicationId) => {
        setActionLoading(true);
        try {
            await api.requestDrivingCertificate(accessToken, applicationId);

            setDrivingApplications(prev =>
                prev.map(app => app.id === applicationId ? {
                    ...app,
                    certificate_requested: true,
                    certificate_requested_at: new Date().toISOString()
                } : app)
            );
            showSuccess('Certificate requested successfully!');
            setError(null);
        } catch (error) {
            console.error('Failed to request certificate:', error);
            setError(`Failed to request certificate: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    // Other existing handlers remain the same...
    const handleUpdatePaymentStatus = useCallback(async (registrationId, status) => {
        setActionLoading(true);
        try {
            await api.updateRegistrationPaymentStatus(accessToken, registrationId, status);
            setRegistrations(prev =>
                prev.map(reg => reg.id === registrationId ? { ...reg, payment_status: status } : reg)
            );
            showSuccess(`Payment status for registration ${registrationId} updated to ${status}.`);
            setError(null);
        } catch (error) {
            console.error('Failed to update payment status:', error);
            setError(`Failed to update payment status: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleUpdateControlNo = useCallback(async (registrationId, controlNo) => {
        setActionLoading(true);
        try {
            await api.updateRegistrationControlNo(accessToken, registrationId, controlNo);
            setRegistrations(prev =>
                prev.map(reg => reg.id === registrationId ? { ...reg, control_no: controlNo } : reg)
            );
            showSuccess(`Control number for registration ${registrationId} updated.`);
            setError(null);
        } catch (error) {
            console.error('Failed to update control number:', error);
            setError(`Failed to update control number: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleRoleChange = useCallback(async (userId, newRole) => {
        setActionLoading(true);
        try {
            await api.updateUserRole(accessToken, userId, newRole);
            setUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
            );
            showSuccess(`User role for ${userId} updated to ${newRole}.`);
            setError(null);
        } catch (error) {
            console.error('Failed to update user role:', error);
            setError(`Failed to update user role: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleUpdateCertificateStatus = useCallback(async (requestId, newStatus) => {
        setActionLoading(true);
        try {
            if (newStatus === 'Approved') {
                await api.approveCertificateApplication(accessToken, requestId, 'Approved');
            } else {
                await api.updateCertificateApplicationStatus(accessToken, requestId, { status: newStatus });
            }

            setCertificateRequests(prev =>
                prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
            );
            showSuccess(`Certificate request ${requestId} status updated to ${newStatus}.`);
            setError(null);
        } catch (error) {
            console.error('Failed to update certificate request status:', error);
            setError(`Failed to update certificate request status: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleIssueCertificate = useCallback(async (requestId) => {
        setActionLoading(true);
        try {
            await api.issueCertificate(accessToken, requestId);

            setCertificateRequests(prev =>
                prev.map(req => req.id === requestId ? { ...req, status: 'Issued' } : req)
            );
            showSuccess(`Certificate ${requestId} successfully issued.`);
            setError(null);
        } catch (error) {
            console.error('Failed to issue certificate:', error);
            setError(`Failed to issue certificate: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    const handleSetCertificateControlNumber = useCallback(async (requestId, controlNumber) => {
        setActionLoading(true);
        try {
            await api.setCertificateControlNumber(accessToken, requestId, controlNumber);

            setCertificateRequests(prev =>
                prev.map(req => req.id === requestId ? { ...req, control_number: controlNumber } : req)
            );
            showSuccess(`Control number for certificate request ${requestId} set.`);
            setError(null);
        } catch (error) {
            console.error('Failed to set control number:', error);
            setError(`Failed to set control number: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSuccess]);

    // --- Helper Functions and Computed Values ---
    const getFilteredRegistrations = useCallback((currentRegistrations, filter) => {
        switch (filter) {
            case 'pending':
                return currentRegistrations.filter(reg => reg.payment_status?.toLowerCase() === 'pending');
            case 'paid':
                return currentRegistrations.filter(reg => reg.payment_status?.toLowerCase() === 'paid');
            case 'cancelled':
                return currentRegistrations.filter(reg => reg.payment_status?.toLowerCase() === 'cancelled');
            default:
                return currentRegistrations;
        }
    }, []);

    const filteredRegistrations = useMemo(() => getFilteredRegistrations(registrations, statusFilter), [registrations, statusFilter, getFilteredRegistrations]);

    const stats = useMemo(() => {
        const totalUsers = users.length;
        const students = users.filter(u => u.role === 'student').length;
        const teachers = users.filter(u => u.role === 'teacher').length;
        const admins = users.filter(u => u.role === 'admin').length;
        const engineeringStaff = users.filter(u => u.role === 'engineering_staff').length;
        const totalRegistrations = registrations.length;
        const pendingPayments = registrations.filter(r => r.payment_status === 'Pending').length;
        const paidRegistrations = registrations.filter(r => r.payment_status === 'Paid').length;
        const cancelledRegistrations = registrations.filter(r => r.payment_status === 'Cancelled').length;
        const totalCourses = courses.length;

        // Certificate Requests Stats
        const totalCertRequests = certificateRequests.length;
        const pendingCertRequests = certificateRequests.filter(r => r.status === 'Pending' || r.staff_status === 'Pending Review').length;
        const approvedCertRequests = certificateRequests.filter(r => r.status === 'Approved' || r.staff_status === 'Approved').length;
        const issuedCertRequests = certificateRequests.filter(r => r.control_number).length;

        // Driving Applications Stats
        const totalDrivingApplications = drivingApplications.length;
        const approvedDrivingApplications = drivingApplications.filter(app => app.application_status === 'Approved').length;
        const completedDrivingCourses = drivingApplications.filter(app => app.course_status === 'Completed').length;
        const drivingCertificateRequests = drivingApplications.filter(app => app.certificate_requested).length;
        const issuedDrivingCertificates = drivingApplications.filter(app => app.certificate_issued).length;

        const totalRevenue = registrations
            .filter(reg => reg.payment_status === 'Paid')
            .reduce((total, reg) => total + (parseFloat(reg.course_price) || 0), 0);

        const drivingRegistrationRevenue = drivingApplications
            .filter(app => app.registration_control_number)
            .reduce((total, app) => total + (app.registration_fee_amount || 150000), 0);

        const drivingCertificateRevenue = drivingApplications
            .filter(app => app.certificate_control_number)
            .reduce((total, app) => total + (app.certificate_fee_amount || 20000), 0);

        const totalDrivingRevenue = drivingRegistrationRevenue + drivingCertificateRevenue;

        return {
            totalUsers,
            students,
            teachers,
            admins,
            engineeringStaff,
            totalRegistrations,
            pendingPayments,
            paidRegistrations,
            cancelledRegistrations,
            totalCourses,
            totalRevenue,
            totalCertRequests,
            pendingCertRequests,
            approvedCertRequests,
            issuedCertRequests,
            totalDrivingApplications,
            approvedDrivingApplications,
            completedDrivingCourses,
            drivingCertificateRequests,
            issuedDrivingCertificates,
            drivingRegistrationRevenue,
            drivingCertificateRevenue,
            totalDrivingRevenue,
            totalDrivingCourses: drivingCourses.length
        };
    }, [users, registrations, courses, certificateRequests, drivingApplications, drivingCourses]);

    const handleRetry = () => {
        loadAllData();
    };


    return {
        users,
        registrations,
        courses,
        loading,
        actionLoading,
        statusFilter,
        setStatusFilter,
        certificateRequests,
        drivingApplications,
        drivingCourses,
        error,
        setError,
        successMessage,
        showSuccess,
        stats,
        filteredRegistrations,
        fetchCertificateRequests,
        fetchDrivingApplications,
        fetchDrivingCourses,
        handleAssignRegistrationControlNumber,
        handleAssignCertificateControlNumber,
        handleStartCourse,
        handleCompleteCourse,
        handleApproveCertificateRequest,
        handleRequestCertificate,
        handleUpdatePaymentStatus,
        handleUpdateControlNo,
        handleRoleChange,
        handleUpdateCertificateStatus,
        handleIssueCertificate,
        handleSetCertificateControlNumber,
        handleRetry,
    };
};

export default useAdminDashboardData;