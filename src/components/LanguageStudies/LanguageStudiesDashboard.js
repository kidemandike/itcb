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
} from "@mui/material";
import { Sidebar, Header } from '../UIComponents';
import api from "../../api";
import { 
    CertificateApplicationsTable 
} from './CertificateApplicationsTable'; 
import {
    getStatusColor, 
    formatDate,
    generateCertificatePDF,
} from "../utils/LanguageStudiesUtils"; 

const LanguageStudiesDashboard = ({ 
    user, 
    accessToken, 
    onLogout, 
    activeTab, 
    setActiveTab,
    showSnackbar,
    dashboardTitle,
    userRole,
    courses, // Assuming these props come from a parent component
    // enrollments,
    // conferenceRooms,
    // roomBookings
}) => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [certificateApplications, setCertificateApplications] = useState([]);
    const [languageCourses, setLanguageCourses] = useState([]);

    const sidebarLinks = [
        { name: "Dashboard", id: "dashboard" },
        { name: "Certificate Applications", id: "certificate-applications" },
        { name: "Language Courses", id: "language-courses" },
        { name: "Reports", id: "reports" },
    ];

    // --- Data Fetching Logic ---
    const fetchCertificateApplications = useCallback(async () => {
        if (!accessToken) return;
        
        setLoading(true);
        try {
            const result = await api.getCertificateApplications(accessToken);
            // Ensure result is an array or default to empty array
            setCertificateApplications(Array.isArray(result) ? result : []); 
        } catch (error) {
            console.error("Error fetching certificate applications:", error);
            showSnackbar(`Failed to load applications: ${error.message}`, 'error');
            setCertificateApplications([]);
        } finally {
            setLoading(false);
        }
    }, [accessToken, showSnackbar]);

    useEffect(() => {
        // Fetch applications when the component mounts or the relevant tab is selected
        if (accessToken && (activeTab === "dashboard" || activeTab === "certificate-applications")) {
            fetchCertificateApplications();
        }
    }, [accessToken, activeTab, fetchCertificateApplications]);

    // Filter courses for the Language Courses tab
    useEffect(() => {
        const languageCoursesList = courses.filter(course => 
            course.department === 'Language Studies' || 
            course.type === 'language_course' ||
            course.title?.includes('Language') ||
            course.course_name?.includes('Language')
        );
        setLanguageCourses(languageCoursesList);
    }, [courses]);


    // --- Action Handlers ---

    const handleApproveApplication = async (applicationId, newStatus) => {
        setActionLoading(true);
        try {
            // FIX: Pass newStatus to the API call
            await api.approveCertificateApplication(accessToken, applicationId, newStatus);
            showSnackbar(`Certificate application set to ${newStatus}!`, 'success');
            
            // Re-fetch data to update the table
            await fetchCertificateApplications();
        } catch (error) {
            console.error('Failed to approve application:', error);
            showSnackbar(`Failed to update application status: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSetControlNumber = async (applicationId) => {
        setActionLoading(true);
        try {
            // Generate a simple control number for demonstration
            const controlNumber = `ELP-${new Date().getFullYear()}-${applicationId.toString().padStart(4, '0')}`;
            
            await api.setCertificateControlNumber(accessToken, applicationId, controlNumber);
            
            showSnackbar(`Control number ${controlNumber} set successfully!`, 'success');
            
            await fetchCertificateApplications();
        } catch (error) {
            console.error('Failed to set control number:', error);
            showSnackbar('Failed to set control number', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleGenerateCertificate = async (certificateData, applicationId) => {
        setActionLoading(true);
        try {
            // 1. Generate PDF (using the helper function)
            const pdfBlob = await generateCertificatePDF(certificateData);
            
            // 2. Trigger Download
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ELP_Certificate_${certificateData.registrationNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // 3. Update status in the backend to 'Issued'
            // The API call below issues the certificate and updates the status
            await api.issueCertificate(accessToken, applicationId);
            
            showSnackbar('Certificate generated and downloaded successfully! The status is now Issued.', 'success');
            
            await fetchCertificateApplications();
        } catch (error) {
            console.error('Failed to generate certificate:', error);
            showSnackbar(`Failed to generate certificate: ${error.message}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // --- Content Rendering ---

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Language Studies Overview
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {/* Card 1: Total Applications */}
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {certificateApplications.length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Total Applications
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {/* Card 2: Staff Approved */}
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {certificateApplications.filter(app => app.staff_status === 'Approved').length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Staff Approved
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {/* Card 3: Control No. Assigned */}
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {certificateApplications.filter(app => app.control_number).length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Control No. Assigned
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {/* Card 4: Certificates Issued */}
                            <Grid item xs={12} sm={3}>
                                <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h4" component="div">
                                            {certificateApplications.filter(app => app.control_number).length}
                                        </Typography>
                                        <Typography variant="h6">
                                            Certificates Issued
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Recent Certificate Applications
                                </Typography>
                                
                                {loading ? (
                                    <CircularProgress />
                                ) : certificateApplications.length === 0 ? (
                                    <Alert severity="info">
                                        No certificate applications found.
                                    </Alert>
                                ) : (
                                    <CertificateApplicationsTable
                                        applications={certificateApplications.slice(0, 5)} // Show only recent 5
                                        onApprove={handleApproveApplication}
                                        onSetControlNumber={handleSetControlNumber}
                                        onGenerateCertificate={handleGenerateCertificate}
                                        loading={actionLoading}
                                        userRole={userRole}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                );

            case "certificate-applications":
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            All Certificate Applications
                        </Typography>
                        
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <CertificateApplicationsTable
                                applications={certificateApplications}
                                onApprove={handleApproveApplication}
                                onSetControlNumber={handleSetControlNumber}
                                onGenerateCertificate={handleGenerateCertificate}
                                loading={actionLoading}
                                userRole={userRole}
                            />
                        )}
                    </Box>
                );

            case "language-courses":
                return (
                    <Alert severity="info">
                        Language Courses list not implemented yet. Found {languageCourses.length} courses.
                    </Alert>
                )
            
            case "reports":
                return (
                    <Alert severity="info">
                        Reports section not implemented yet.
                    </Alert>
                )

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
        </Box>
    );
};

export default LanguageStudiesDashboard;