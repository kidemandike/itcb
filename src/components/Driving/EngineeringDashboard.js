import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Divider,
    Alert,
    Button,
} from "@mui/material";
import { Sidebar, Header } from '../UIComponents';
import api from "../../api";
import { 
    DrivingApplicationsTable 
} from './DrivingApplicationsTable';
import CourseAnnouncementDialog from './CourseAnnouncementDialog';
import {
    getStatusColor, 
    formatDate,
} from "../utils/EngineeringUtils";

const EngineeringDashboard = ({ 
    user, 
    accessToken, 
    onLogout, 
    activeTab, 
    setActiveTab,
    showSnackbar,
    dashboardTitle,
    userRole,
    courses,
    enrollments,
    conferenceRooms,
    roomBookings
}) => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [drivingApplications, setDrivingApplications] = useState([]);
    const [drivingCourses, setDrivingCourses] = useState([]);
    const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

    const sidebarLinks = [
        { name: "Dashboard", id: "dashboard" },
        { name: "Course Announcements", id: "course-announcements" },
        { name: "Student Applications", id: "student-applications" },
        { name: "Certificate Requests", id: "certificate-requests" },
        { name: "Reports", id: "reports" },
    ];

    // --- Data Fetching Logic ---
    const fetchDrivingApplications = useCallback(async () => {
        if (!accessToken) return;
        
        setLoading(true);
        try {
            const result = await api.getDrivingApplications(accessToken);
            setDrivingApplications(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error fetching driving applications:", error);
            showSnackbar(`Failed to load applications: ${error.message}`, 'error');
            setDrivingApplications([]);
        } finally {
            setLoading(false);
        }
    }, [accessToken, showSnackbar]);

    const fetchDrivingCourses = useCallback(async () => {
        if (!accessToken) return;
        
        try {
            const result = await api.getDrivingCourses(accessToken);
            setDrivingCourses(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error fetching driving courses:", error);
            setDrivingCourses([]);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) {
            fetchDrivingApplications();
            fetchDrivingCourses();
        }
    }, [accessToken, fetchDrivingApplications, fetchDrivingCourses]);

    // --- Action Handlers with useCallback for stable references ---
    
    // Head of Department: Announce new course
    const handleAnnounceCourse = useCallback(async (courseData) => {
        setActionLoading(true);
        try {
            await api.announceDrivingCourse(accessToken, courseData);
            showSnackbar('Course announced successfully!', 'success');
            setAnnouncementDialogOpen(false);
            await fetchDrivingCourses();
        } catch (error) {
            console.error('Failed to announce course:', error);
            showSnackbar(`Failed to announce course: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar, fetchDrivingCourses]);

    // Student applies for driving course
    const handleStudentApply = useCallback(async (courseId, applicationData) => {
        setActionLoading(true);
        try {
            await api.applyForDrivingCourse(accessToken, {
                course_id: courseId,
                ...applicationData
            });
            showSnackbar('Application submitted successfully!', 'success');
            await fetchDrivingApplications();
        } catch (error) {
            console.error('Failed to submit application:', error);
            showSnackbar(`Failed to submit application: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar, fetchDrivingApplications]);

    // Head of Department: Approve individual application
    const handleApproveApplication = useCallback(async (applicationId) => {
        setActionLoading(true);
        try {
            await api.approveDrivingApplication(accessToken, applicationId);
            showSnackbar('Application approved successfully!', 'success');
            await fetchDrivingApplications();
        } catch (error) {
            console.error('Failed to approve application:', error);
            showSnackbar(`Failed to approve application: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar, fetchDrivingApplications]);

    // Head of Department: Approve certificate request
    const handleApproveCertificateRequest = useCallback(async (applicationId) => {
        setActionLoading(true);
        try {
            await api.approveCertificateRequest(accessToken, applicationId);
            showSnackbar('Certificate request approved!', 'success');
            await fetchDrivingApplications();
        } catch (error) {
            console.error('Failed to approve certificate request:', error);
            showSnackbar(`Failed to approve certificate request: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar, fetchDrivingApplications]);

    // Head of Department: Approve all applications for a course
    const handleApproveAllApplications = useCallback(async (courseId) => {
        setActionLoading(true);
        try {
            await api.approveAllDrivingApplications(accessToken, courseId);
            showSnackbar('All applications approved for this course!', 'success');
            await fetchDrivingApplications();
        } catch (error) {
            console.error('Failed to approve applications:', error);
            showSnackbar(`Failed to approve applications: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar, fetchDrivingApplications]);

    // HOD/Engineering Staff: Manual course status updates - NEW IMPLEMENTATION
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
            
            showSnackbar('Course marked as started successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to start course:', error);
            showSnackbar(`Failed to start course: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar]);

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
            
            showSnackbar('Course marked as completed successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to complete course:', error);
            showSnackbar(`Failed to complete course: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar]);

    // Student requests certificate
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
            showSnackbar('Certificate requested successfully! Payment required: Tsh 20,000', 'success');
            await fetchDrivingApplications();
        } catch (error) {
            console.error('Failed to request certificate:', error);
            showSnackbar(`Failed to request certificate: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar, fetchDrivingApplications]);

    // Head of Department: Generate certificate
    const handleGenerateCertificate = useCallback(async (certificateData, applicationId) => {
        setActionLoading(true);
        try {
            // Generate PDF certificate
            const pdfBlob = await generateCertificatePDF(certificateData);
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Driving_Certificate_${certificateData.controlNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Mark certificate as issued in database
            await api.issueCertificate(accessToken, applicationId);
            showSnackbar('Certificate generated and issued successfully!', 'success');
            await fetchDrivingApplications();
        } catch (error) {
            console.error('Failed to generate certificate:', error);
            showSnackbar(`Failed to generate certificate: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    }, [accessToken, showSnackbar, fetchDrivingApplications]);

    // Mock PDF generation function (replace with actual implementation)
    const generateCertificatePDF = async (certificateData) => {
        // This is a mock implementation - replace with actual PDF generation
        return new Blob([`Certificate PDF for ${certificateData.controlNumber}`], { type: 'application/pdf' });
    };

    // Check user permissions
    const isEngineeringStaff = userRole === 'engineering_staff' || userRole === 'teacher';
    const isStudent = userRole === 'student';
    const isAdmin = userRole === 'admin';

    // Debug useEffect to verify functions exist
    useEffect(() => {
        console.log('=== 🔍 ENGINEERING DASHBOARD DEBUG ===');
        console.log('User Role:', userRole);
        console.log('All action handlers available:', {
            handleStartCourse: !!handleStartCourse,
            handleCompleteCourse: !!handleCompleteCourse,
            handleRequestCertificate: !!handleRequestCertificate,
            handleApproveApplication: !!handleApproveApplication,
            handleApproveCertificateRequest: !!handleApproveCertificateRequest,
            handleGenerateCertificate: !!handleGenerateCertificate
        });
        console.log('=====================================');
    }, [
        userRole,
        handleStartCourse,
        handleCompleteCourse,
        handleRequestCertificate,
        handleApproveApplication,
        handleApproveCertificateRequest,
        handleGenerateCertificate
    ]);

    // --- Content Rendering ---
    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Engineering Department - Driving School
                        </Typography>
                        
                        {/* Role-based instructions */}
                        <Alert 
                            severity="info" 
                            sx={{ mb: 3 }}
                        >
                            <Typography variant="body1" fontWeight="bold">
                                Current User Role: {userRole?.toUpperCase() || 'UNKNOWN'}
                            </Typography>
                            <Typography variant="body2">
                                {isEngineeringStaff && "You can manage course announcements, approve applications, and update course status manually."}
                                {isStudent && "You can apply for courses and request certificates after course completion."}
                                {isAdmin && "You have administrative access to all functions."}
                            </Typography>
                        </Alert>
                        
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {drivingApplications.length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Total Applications
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {drivingApplications.filter(app => app.course_status === 'Completed').length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Course Completed
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {drivingApplications.filter(app => app.certificate_requested).length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Cert. Requests
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {drivingApplications.filter(app => app.certificate_issued).length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Cert. Issued
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Quick Actions based on user role */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Quick Actions
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    {/* Head of Department Actions */}
                                    {isEngineeringStaff && (
                                        <>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => setAnnouncementDialogOpen(true)}
                                            >
                                                Announce New Course
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                color="secondary"
                                                onClick={() => setActiveTab("student-applications")}
                                            >
                                                Manage Applications
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                color="info"
                                                onClick={() => setActiveTab("certificate-requests")}
                                            >
                                                Process Certificates
                                            </Button>
                                        </>
                                    )}
                                    {/* Student Actions */}
                                    {isStudent && (
                                        <>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => setActiveTab("course-announcements")}
                                            >
                                                Apply for Courses
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                color="secondary"
                                                onClick={() => setActiveTab("student-applications")}
                                            >
                                                View My Applications
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Recent Applications */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Recent Driving Applications
                                </Typography>
                                
                                {loading ? (
                                    <Box display="flex" justifyContent="center" py={3}>
                                        <CircularProgress />
                                    </Box>
                                ) : drivingApplications.length === 0 ? (
                                    <Alert severity="info">
                                        No driving applications found.
                                    </Alert>
                                ) : (
                                    <DrivingApplicationsTable
                                        applications={drivingApplications.slice(0, 5)}
                                        onStartCourse={handleStartCourse}
                                        onCompleteCourse={handleCompleteCourse}
                                        onRequestCertificate={handleRequestCertificate}
                                        onApproveApplication={handleApproveApplication}
                                        onApproveCertificateRequest={handleApproveCertificateRequest}
                                        onGenerateCertificate={handleGenerateCertificate}
                                        loading={actionLoading}
                                        userRole={userRole}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                );

            case "course-announcements":
                return (
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5">Course Announcements</Typography>
                            {isEngineeringStaff && (
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => setAnnouncementDialogOpen(true)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <CircularProgress size={20} /> : "Announce New Course"}
                                </Button>
                            )}
                        </Box>
                        
                        {drivingCourses.length === 0 ? (
                            <Alert severity="info">
                                No driving courses announced yet.
                                {isEngineeringStaff && " Click 'Announce New Course' to create the first one."}
                            </Alert>
                        ) : (
                            <Grid container spacing={3}>
                                {drivingCourses.map(course => (
                                    <Grid item xs={12} md={6} key={course.id}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    {course.course_name}
                                                </Typography>
                                                <Typography color="textSecondary" gutterBottom>
                                                    {course.course_type} • {course.duration}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Period:</strong> {formatDate(course.start_date)} to {formatDate(course.end_date)}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Registration Fee:</strong> Tsh {course.registration_fee?.toLocaleString() || '150,000'}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Certificate Fee:</strong> Tsh {course.certificate_fee?.toLocaleString() || '20,000'}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Applications:</strong> {course.application_count || 0} students
                                                </Typography>
                                                
                                                {/* Action buttons based on user role */}
                                                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {/* Student: Apply for course */}
                                                    {isStudent && (
                                                        <Button 
                                                            variant="contained" 
                                                            color="primary" 
                                                            size="small"
                                                            onClick={() => handleStudentApply(course.id, {
                                                                student_full_name: user?.name,
                                                                phone_number: user?.phone
                                                            })}
                                                            disabled={actionLoading}
                                                        >
                                                            {actionLoading ? <CircularProgress size={16} /> : "Apply for Course"}
                                                        </Button>
                                                    )}
                                                    
                                                    {/* Head of Department: Approve all applications */}
                                                    {isEngineeringStaff && (
                                                        <Button 
                                                            variant="outlined" 
                                                            color="primary" 
                                                            size="small"
                                                            onClick={() => handleApproveAllApplications(course.id)}
                                                            disabled={actionLoading}
                                                        >
                                                            {actionLoading ? <CircularProgress size={16} /> : "Approve All Applications"}
                                                        </Button>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );

            case "student-applications":
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Student Applications
                        </Typography>
                        
                        {/* Role-based instructions */}
                        {isEngineeringStaff && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2">
                                    <strong>Manual Course Status Management:</strong> You can manually update course status from "Not Started" → "Started" → "Completed" 
                                    after students have paid their registration fees and received control numbers from Admin.
                                </Typography>
                            </Alert>
                        )}
                        
                        {loading ? (
                            <Box display="flex" justifyContent="center" py={3}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <DrivingApplicationsTable
                                applications={drivingApplications}
                                onStartCourse={handleStartCourse}
                                onCompleteCourse={handleCompleteCourse}
                                onRequestCertificate={handleRequestCertificate}
                                onApproveApplication={handleApproveApplication}
                                onApproveCertificateRequest={handleApproveCertificateRequest}
                                onGenerateCertificate={handleGenerateCertificate}
                                loading={actionLoading}
                                userRole={userRole}
                            />
                        )}
                    </Box>
                );

            case "certificate-requests":
                const certificateRequests = drivingApplications.filter(app => 
                    app.certificate_requested || app.certificate_control_number || app.certificate_issued
                );
                
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Certificate Requests
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Pending Approval
                                        </Typography>
                                        <Typography variant="h4">
                                            {drivingApplications.filter(app => app.certificate_requested && !app.certificate_control_number).length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Ready for Print
                                        </Typography>
                                        <Typography variant="h4">
                                            {drivingApplications.filter(app => app.certificate_control_number && !app.certificate_issued).length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Certificates Issued
                                        </Typography>
                                        <Typography variant="h4">
                                            {drivingApplications.filter(app => app.certificate_issued).length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        
                        {certificateRequests.length === 0 ? (
                            <Alert severity="info">
                                No certificate requests found.
                            </Alert>
                        ) : (
                            <DrivingApplicationsTable
                                applications={certificateRequests}
                                onStartCourse={handleStartCourse}
                                onCompleteCourse={handleCompleteCourse}
                                onRequestCertificate={handleRequestCertificate}
                                onApproveApplication={handleApproveApplication}
                                onApproveCertificateRequest={handleApproveCertificateRequest}
                                onGenerateCertificate={handleGenerateCertificate}
                                loading={actionLoading}
                                userRole={userRole}
                            />
                        )}
                    </Box>
                );

            case "reports":
                const totalRegistrationRevenue = drivingApplications
                    .filter(app => app.registration_control_number)
                    .reduce((total, app) => total + (app.registration_fee_amount || 150000), 0);
                
                const totalCertificateRevenue = drivingApplications
                    .filter(app => app.certificate_control_number)
                    .reduce((total, app) => total + (app.certificate_fee_amount || 20000), 0);

                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Reports & Analytics
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Application Statistics
                                        </Typography>
                                        <Typography>
                                            Total Applications: {drivingApplications.length}
                                        </Typography>
                                        <Typography>
                                            Approved: {drivingApplications.filter(app => app.application_status === 'Approved').length}
                                        </Typography>
                                        <Typography>
                                            Pending: {drivingApplications.filter(app => app.application_status === 'Pending').length}
                                        </Typography>
                                        <Typography>
                                            Courses Started: {drivingApplications.filter(app => app.course_status === 'Started').length}
                                        </Typography>
                                        <Typography>
                                            Courses Completed: {drivingApplications.filter(app => app.course_status === 'Completed').length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Revenue Summary
                                        </Typography>
                                        <Typography>
                                            Registration Fees: Tsh {totalRegistrationRevenue.toLocaleString()}
                                        </Typography>
                                        <Typography>
                                            Certificate Fees: Tsh {totalCertificateRevenue.toLocaleString()}
                                        </Typography>
                                        <Typography variant="h6" sx={{ mt: 1 }}>
                                            Total Revenue: Tsh {(totalRegistrationRevenue + totalCertificateRevenue).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            {/* Course Progress Report */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Course Progress Report
                                        </Typography>
                                        {drivingCourses.map(course => {
                                            const courseApps = drivingApplications.filter(app => app.course_id === course.id);
                                            const completed = courseApps.filter(app => app.course_status === 'Completed').length;
                                            const started = courseApps.filter(app => app.course_status === 'Started').length;
                                            const notStarted = courseApps.filter(app => !app.course_status || app.course_status === 'Not Started').length;
                                            
                                            return (
                                                <Box key={course.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {course.course_name}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Total Students: {courseApps.length} | 
                                                        Completed: {completed} | 
                                                        In Progress: {started} | 
                                                        Not Started: {notStarted}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );

            default:
                return (
                    <Alert severity="info">
                        Please select a section from the sidebar.
                    </Alert>
                );
        }
    };

    return (
        <Box display="flex" minHeight="100vh" bgcolor="grey.100">
            <Sidebar
                links={sidebarLinks}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={userRole}
            />
            <Box flex={1} p={3}>
                <Header 
                    user={user} 
                    onLogout={onLogout} 
                    title={dashboardTitle}
                    userRole={userRole}
                />
                <Divider sx={{ my: 2 }} />
                {renderContent()}
            </Box>

            {/* Course Announcement Dialog */}
            <CourseAnnouncementDialog
                open={announcementDialogOpen}
                onClose={() => setAnnouncementDialogOpen(false)}
                onAnnounce={handleAnnounceCourse}
                loading={actionLoading}
                userRole={userRole}
            />
        </Box>
    );
};

export default EngineeringDashboard;