import React, { useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Snackbar
} from "@mui/material";
import { CertificateGenerator } from "./CertificateGenerator";

// --- Utility Functions ---
const getStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase() || 'default';
    switch (lowerStatus) {
        case 'approved':
        case 'issued':
        case 'completed':
            return 'success';
        case 'pending':
        case 'not started':
        case 'control no assigned':
            return 'warning';
        case 'started':
            return 'info';
        case 'rejected':
            return 'error';
        default:
            return 'default';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

export const DrivingApplicationsTable = ({ 
    applications = [], 
    onAssignRegistrationControlNumber = () => {},
    onAssignCertificateControlNumber = () => {},
    onStartCourse = null,
    onCompleteCourse = null,
    onRequestCertificate = null,
    onApproveCertificateRequest = null,
    onIssueCertificate = null,
    loading = false, 
    userRole = ''
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
    const [certificateControlDialogOpen, setCertificateControlDialogOpen] = useState(false);
    const [courseStatusDialogOpen, setCourseStatusDialogOpen] = useState(false);
    const [certificateGenerateDialogOpen, setCertificateGenerateDialogOpen] = useState(false);
    const [controlNumber, setControlNumber] = useState('');
    const [courseStatusToSet, setCourseStatusToSet] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Show snackbar notification
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Control Number Dialog Handlers
    const handleAssignRegistrationControl = (application) => {
        setSelectedApplication(application);
        setControlNumber(application.registration_control_number || '');
        setRegistrationDialogOpen(true);
    };

    const handleAssignCertificateControl = (application) => {
        setSelectedApplication(application);
        setControlNumber(application.certificate_control_number || '');
        setCertificateControlDialogOpen(true);
    };

    const handleApproveCertificateRequest = (applicationId) => {
        if (typeof onApproveCertificateRequest === 'function') {
            onApproveCertificateRequest(applicationId);
            showSnackbar('Certificate request approved successfully!', 'success');
        }
    };

    const handleRegistrationControlSubmit = () => {
        if (controlNumber.trim() && selectedApplication) {
            onAssignRegistrationControlNumber(selectedApplication.id, controlNumber.trim());
            setRegistrationDialogOpen(false);
            setControlNumber('');
            showSnackbar('Registration control number assigned successfully!');
        }
    };

    const handleCertificateControlSubmit = () => {
        if (controlNumber.trim() && selectedApplication) {
            onAssignCertificateControlNumber(selectedApplication.id, controlNumber.trim());
            setCertificateControlDialogOpen(false);
            setControlNumber('');
            showSnackbar('Certificate control number assigned successfully!');
        }
    };

    // Course Status Handlers - MANUAL CONTROL
    const handleCourseStatusClick = (application, status) => {
        setSelectedApplication(application);
        setCourseStatusToSet(status);
        setCourseStatusDialogOpen(true);
    };

    const handleCourseStatusSubmit = async () => {
        if (selectedApplication && courseStatusToSet) {
            try {
                if (courseStatusToSet === 'Started') {
                    if (typeof onStartCourse === 'function') {
                        await onStartCourse(selectedApplication.id);
                    }
                } else if (courseStatusToSet === 'Completed') {
                    if (typeof onCompleteCourse === 'function') {
                        await onCompleteCourse(selectedApplication.id);
                    }
                }
                
                setCourseStatusDialogOpen(false);
                setCourseStatusToSet(null);
                setSelectedApplication(null);
                
            } catch (error) {
                console.error('Error updating course status:', error);
                showSnackbar('Error updating course status', 'error');
            }
        }
    };

    // Certificate Request Handler
    const handleRequestCertificateClick = (application) => {
        setSelectedApplication(application);
        if (typeof onRequestCertificate === 'function') {
            onRequestCertificate(application.id);
            showSnackbar('Certificate request submitted successfully!', 'success');
        }
    };

    // Certificate Generation Handler
    const handleGenerateCertificate = (application) => {
        setSelectedApplication(application);
        setCertificateGenerateDialogOpen(true);
    };

    const handleCertificateDownload = async (certificateData) => {
        if (selectedApplication && typeof onIssueCertificate === 'function') {
            try {
                await onIssueCertificate(selectedApplication.id, certificateData);
                showSnackbar('Certificate issued and downloaded successfully!', 'success');
                setCertificateGenerateDialogOpen(false);
            } catch (error) {
                console.error('Error issuing certificate:', error);
                showSnackbar('Error issuing certificate', 'error');
            }
        }
    };

    // Check user permissions
    const isAdmin = userRole === 'admin';
    const isEngineeringStaff = userRole === 'engineering_staff' || userRole === 'teacher';
    const isStudent = userRole === 'student';

    if (!applications || applications.length === 0) {
        return (
            <Box textAlign="center" py={5} component={Paper} elevation={3}>
                <Typography variant="h6" color="textSecondary">
                    No driving applications found.
                </Typography>
            </Box>
        );
    }

    const tableHeaders = [
        "Student Name", "Phone", "Course", "App Date", 
        "App Status", "Reg Control No", "Course Status", 
        "Cert Control No", "Cert Status", "Actions"
    ];

    return (
        <>
            <TableContainer 
                component={Paper} 
                sx={{ 
                    maxHeight: 600, 
                    overflowY: 'auto', 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    '& .MuiTable-root': {
                        minWidth: isMobile ? 1200 : 'auto'
                    }
                }}
                elevation={2}
            >
                <Table stickyHeader aria-label="driving applications table" size={isMobile ? "small" : "medium"}>
                    <TableHead>
                        <TableRow>
                            {tableHeaders.map((header) => (
                                <TableCell 
                                    key={header}
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        backgroundColor: theme.palette.grey[100],
                                        color: theme.palette.grey[800],
                                        minWidth: header.includes('Name') ? 150 : 120,
                                        maxWidth: header === 'Actions' ? 200 : 'none',
                                        py: 1.5,
                                        px: 1,
                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((application, index) => {
                            const isApproved = application.application_status === 'Approved';
                            const hasRegistrationCN = !!application.registration_control_number;
                            const isCourseCompleted = application.course_status === 'Completed';
                            const isCourseStarted = application.course_status === 'Started';
                            const isCourseNotStarted = !application.course_status || application.course_status === 'Not Started';
                            const hasCertificateCN = !!application.certificate_control_number;
                            const isCertificateRequested = application.certificate_requested;
                            const isCertificateIssued = application.certificate_issued;
                            const isCertificateApproved = application.certificate_approved;
                            
                            const registrationPaymentStatus = application.registration_payment_status || (hasRegistrationCN ? 'Control No Assigned' : application.application_status);

                            return (
                                <TableRow 
                                    key={application.id} 
                                    hover
                                    sx={{ 
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        cursor: 'default',
                                        backgroundColor: index % 2 === 0 ? theme.palette.background.default : theme.palette.grey[50],
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover
                                        }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 'medium', py: 1.5 }}>
                                        {application.user_name || 'N/A'}
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Typography variant="body2" fontFamily="monospace">
                                            {application.user_phone || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Tooltip title={application.course_name || 'N/A'}>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                                                {application.course_name || 'N/A'}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5, whiteSpace: 'nowrap' }}>
                                        {formatDate(application.application_date)}
                                    </TableCell>

                                    {/* Application Status */}
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Chip 
                                            label={application.application_status || 'Pending'} 
                                            color={getStatusColor(application.application_status)} 
                                            size="small"
                                            sx={{ 
                                                fontWeight: 'bold',
                                                minWidth: 80
                                            }}
                                        />
                                    </TableCell>

                                    {/* Registration Control Number & Payment Status */}
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Tooltip title={`Payment Status: ${registrationPaymentStatus}`}>
                                            <Chip
                                                label={application.registration_control_number ? 
                                                    application.registration_control_number : 'N/A'}
                                                color={getStatusColor(registrationPaymentStatus)}
                                                size="small"
                                                variant={hasRegistrationCN ? "outlined" : "filled"}
                                                sx={{ 
                                                    fontFamily: 'monospace',
                                                    fontWeight: hasRegistrationCN ? 'bold' : 'normal'
                                                }}
                                            />
                                        </Tooltip>
                                    </TableCell>

                                    {/* Course Status */}
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Chip 
                                            label={application.course_status || 'Not Started'} 
                                            color={getStatusColor(application.course_status || 'Not Started')} 
                                            size="small"
                                            sx={{ 
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                        />
                                    </TableCell>

                                    {/* Certificate Control Number */}
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Chip
                                            label={application.certificate_control_number ? 
                                                application.certificate_control_number : 'N/A'}
                                            color={getStatusColor(application.certificate_control_number ? 'success' : 'default')}
                                            size="small"
                                            variant={hasCertificateCN ? "outlined" : "filled"}
                                            sx={{ 
                                                fontFamily: 'monospace',
                                                fontWeight: hasCertificateCN ? 'bold' : 'normal'
                                            }}
                                        />
                                    </TableCell>

                                    {/* Certificate Status */}
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Chip 
                                            label={
                                                application.certificate_issued ? 'Issued' : 
                                                (application.certificate_approved ? 'Approved' :
                                                (application.certificate_requested ? 'Requested' : 'Not Requested'))
                                            } 
                                            color={getStatusColor(
                                                application.certificate_issued ? 'Issued' : 
                                                (application.certificate_approved ? 'Approved' :
                                                (application.certificate_requested ? 'Pending' : 'default'))
                                            )} 
                                            size="small"
                                            sx={{ 
                                                fontWeight: 'bold',
                                                minWidth: 100
                                            }}
                                        />
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell sx={{ minWidth: 180, py: 1.5 }}>
                                        <Box display="flex" flexDirection="column" gap={0.8}>
                                            {/* ADMIN: Registration Control Number */}
                                            {isAdmin && isApproved && !hasRegistrationCN && (
                                                <Tooltip title="Assign Registration Control No. (Fee Tsh 150,000)">
                                                    <Button
                                                        onClick={() => handleAssignRegistrationControl(application)}
                                                        size="small"
                                                        color="primary"
                                                        variant="contained"
                                                        disabled={loading}
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {loading && selectedApplication?.id === application.id ? 
                                                            <CircularProgress size={16} color="inherit" /> : 'Assign Reg CN'}
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* ADMIN: Certificate Control Number */}
                                            {isAdmin && isCourseCompleted && isCertificateApproved && !hasCertificateCN && (
                                                <Tooltip title="Assign Certificate Control No. (Fee Tsh 20,000)">
                                                    <Button
                                                        onClick={() => handleAssignCertificateControl(application)}
                                                        size="small"
                                                        color="secondary"
                                                        variant="outlined"
                                                        disabled={loading}
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {loading && selectedApplication?.id === application.id ? 
                                                            <CircularProgress size={16} color="inherit" /> : 'Assign Cert CN'}
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* HOD/ENGINEERING STAFF: Approve Certificate Request */}
                                            {isEngineeringStaff && isCourseCompleted && isCertificateRequested && !isCertificateApproved && (
                                                <Tooltip title="Approve Certificate Request">
                                                    <Button
                                                        onClick={() => handleApproveCertificateRequest(application.id)}
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        disabled={loading}
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {loading && selectedApplication?.id === application.id ? 
                                                            <CircularProgress size={16} color="inherit" /> : 'Approve Cert'}
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* HOD/ENGINEERING STAFF: Generate Certificate */}
                                            {isEngineeringStaff && isCourseCompleted && isCertificateApproved && hasCertificateCN && !isCertificateIssued && (
                                                <Tooltip title="Generate and Issue Certificate">
                                                    <Button
                                                        onClick={() => handleGenerateCertificate(application)}
                                                        size="small"
                                                        color="success"
                                                        variant="contained"
                                                        disabled={loading}
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {loading && selectedApplication?.id === application.id ? 
                                                            <CircularProgress size={16} color="inherit" /> : 'Issue Certificate'}
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* STUDENT: Request Certificate */}
                                            {isStudent && isCourseCompleted && !isCertificateRequested && !isCertificateIssued && (
                                                <Tooltip title="Request driving certificate">
                                                    <Button
                                                        onClick={() => handleRequestCertificateClick(application)}
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        disabled={loading}
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {loading && selectedApplication?.id === application.id ? 
                                                            <CircularProgress size={16} color="inherit" /> : 'Request Certificate'}
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* ENGINEERING STAFF: Start Course */}
                                            {isEngineeringStaff && hasRegistrationCN && isCourseNotStarted && (
                                                <Tooltip title="Mark course as started">
                                                    <Button
                                                        onClick={() => handleCourseStatusClick(application, 'Started')}
                                                        size="small"
                                                        color="info"
                                                        variant="outlined"
                                                        disabled={loading}
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {loading && selectedApplication?.id === application.id ? 
                                                            <CircularProgress size={16} color="inherit" /> : 'Mark Started'}
                                                    </Button>
                                                </Tooltip>
                                            )}

                                            {/* ENGINEERING STAFF: Complete Course */}
                                            {isEngineeringStaff && isCourseStarted && !isCourseCompleted && (
                                                <Tooltip title="Mark course as completed">
                                                    <Button
                                                        onClick={() => handleCourseStatusClick(application, 'Completed')}
                                                        size="small"
                                                        color="success"
                                                        variant="contained"
                                                        disabled={loading}
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            py: 0.5,
                                                            minWidth: 'auto'
                                                        }}
                                                    >
                                                        {loading && selectedApplication?.id === application.id ? 
                                                            <CircularProgress size={16} color="inherit" /> : 'Mark Completed'}
                                                    </Button>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- DIALOGS --- */}

            {/* Registration Control Number Dialog */}
            <Dialog 
                open={registrationDialogOpen} 
                onClose={() => setRegistrationDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ 
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    Assign Registration Control Number
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Registration Fee: <strong>Tsh 150,000</strong>
                    </Alert>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Enter control number for <strong>{selectedApplication?.user_name}</strong>'s registration.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Control Number"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={controlNumber}
                        onChange={(e) => setControlNumber(e.target.value)}
                        disabled={loading}
                        placeholder="Enter control number..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setRegistrationDialogOpen(false)} 
                        color="inherit"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleRegistrationControlSubmit} 
                        color="primary" 
                        variant="contained" 
                        disabled={loading || !controlNumber.trim()}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                    >
                        {loading ? 'Assigning...' : 'Assign Control Number'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Certificate Control Number Dialog */}
            <Dialog 
                open={certificateControlDialogOpen} 
                onClose={() => setCertificateControlDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ 
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    Assign Certificate Control Number
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Certificate Fee: <strong>Tsh 20,000</strong>
                    </Alert>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Enter control number for <strong>{selectedApplication?.user_name}</strong>'s certificate fee.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Control Number"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={controlNumber}
                        onChange={(e) => setControlNumber(e.target.value)}
                        disabled={loading}
                        placeholder="Enter control number..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setCertificateControlDialogOpen(false)} 
                        color="inherit"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCertificateControlSubmit} 
                        color="secondary" 
                        variant="contained" 
                        disabled={loading || !controlNumber.trim()}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                    >
                        {loading ? 'Assigning...' : 'Assign Control Number'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Course Status Update Dialog */}
            <Dialog 
                open={courseStatusDialogOpen} 
                onClose={() => setCourseStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Confirm Course Status Update
                </DialogTitle>
                <DialogContent>
                    <Alert 
                        severity={courseStatusToSet === 'Completed' ? 'success' : 'info'} 
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="body1" fontWeight="bold">
                            Update course status to: {courseStatusToSet}
                        </Typography>
                        <Typography variant="body2">
                            Student: <strong>{selectedApplication?.user_name}</strong>
                        </Typography>
                        <Typography variant="body2">
                            Course: <strong>{selectedApplication?.course_name}</strong>
                        </Typography>
                    </Alert>
                    <Typography variant="body2" color="textSecondary">
                        This action will manually update the course progress status.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setCourseStatusDialogOpen(false)} 
                        color="inherit"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCourseStatusSubmit} 
                        color={courseStatusToSet === 'Completed' ? 'success' : 'info'}
                        variant="contained" 
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                    >
                        {loading ? 'Updating...' : `Confirm ${courseStatusToSet}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Certificate Generation Dialog */}
            <CertificateGenerator
                application={selectedApplication}
                open={certificateGenerateDialogOpen}
                onClose={() => setCertificateGenerateDialogOpen(false)}
                onDownload={handleCertificateDownload}
            />

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};