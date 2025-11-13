import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Tooltip,
} from "@mui/material";
import { CertificateGenerator } from './CertificateGenerator'; 
import { getStatusColor, formatDate } from '../utils/LanguageStudiesUtils'; 

export const CertificateApplicationsTable = ({ 
    applications, 
    onApprove, 
    onSetControlNumber, 
    onGenerateCertificate, 
    loading, 
    userRole 
}) => {
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);

    const handleGenerateClick = (application) => {
        setSelectedApplication(application);
        setCertificateDialogOpen(true);
    };

    const handleCertificateDownload = (certificateData) => {
        if (selectedApplication) {
            onGenerateCertificate(certificateData, selectedApplication.id);
        }
        setCertificateDialogOpen(false);
    };

    if (!applications || applications.length === 0) {
        return (
            <Box textAlign="center" py={5}>
                <Typography variant="h6" color="textSecondary">
                    No certificate applications found.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Applicant Name</TableCell>
                            <TableCell>Registration No.</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Graduation Year</TableCell>
                            <TableCell>Application Date</TableCell>
                            <TableCell>Staff Status</TableCell>
                            <TableCell>Control Number</TableCell>
                            <TableCell>Certificate Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {application.user_full_name || application.full_name}
                                        </Typography>
                                        {application.user_email && (
                                            <Typography variant="caption" color="textSecondary">
                                                {application.user_email}
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {application.registration_number || application.registration_no ? (
                                        <Chip 
                                            label={application.registration_number || application.registration_no}
                                            color="primary" 
                                            size="small"
                                            variant="outlined"
                                        />
                                    ) : (
                                        <Typography color="textSecondary" variant="body2">
                                            N/A
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {application.phone_number ? (
                                        <Typography variant="body2">
                                            {application.phone_number}
                                        </Typography>
                                    ) : (
                                        <Typography color="textSecondary" variant="body2">
                                            N/A
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {application.department || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {application.graduation_year || 'N/A'}
                                </TableCell>
                                <TableCell>{formatDate(application.created_at || application.application_date)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={application.staff_status || 'Pending Review'}
                                        color={getStatusColor(application.staff_status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {application.control_number ? (
                                        <Chip 
                                            label={application.control_number}
                                            color="success" 
                                            size="small"
                                            variant="outlined"
                                        />
                                    ) : (
                                        <Typography color="textSecondary" variant="body2">
                                            Not Assigned
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {application.certificate_issued || application.staff_status === 'Issued' ? (
                                        <Chip label="Issued" color="success" size="small" />
                                    ) : application.control_number ? (
                                        <Chip label="Ready for Print" color="info" size="small" />
                                    ) : (
                                        <Chip label="Not Issued" color="default" size="small" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {/* Language Staff: Approve Application */}
                                    {userRole === 'language_staff' && 
                                     (application.staff_status === 'Pending Review' || !application.staff_status) && (
                                        <Tooltip title="Approve Application (Language Staff)">
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => onApprove(application.id, 'Approved')} 
                                                disabled={loading}
                                                sx={{ mr: 1, mb: 1 }}
                                            >
                                                {loading ? <CircularProgress size={20} /> : "Approve"}
                                            </Button>
                                        </Tooltip>
                                    )}
                                    
                                    {/* Admin Control Number Assignment */}
                                    {userRole === 'admin' && 
                                     application.staff_status === 'Approved' && 
                                     !application.control_number && (
                                        <Tooltip title="Assign Control Number">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => onSetControlNumber(application.id)}
                                                disabled={loading}
                                                sx={{ mr: 1, mb: 1 }}
                                            >
                                                {loading ? <CircularProgress size={20} /> : "Set Control No."}
                                            </Button>
                                        </Tooltip>
                                    )}

                                    {/* Certificate Generation */}
                                    {application.control_number && 
                                     application.staff_status === 'Approved' && 
                                     !application.certificate_issued && (
                                        <Tooltip title="Generate Certificate PDF">
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                size="small"
                                                onClick={() => handleGenerateClick(application)}
                                                sx={{ mb: 1 }}
                                            >
                                                Generate Certificate
                                            </Button>
                                        </Tooltip>
                                    )}

                                    {/* Show assigned control numbers */}
                                    {application.control_number && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="textSecondary">
                                                Control No: {application.control_number}
                                            </Typography>
                                        </Box>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedApplication && (
                <CertificateGenerator
                    application={selectedApplication}
                    open={certificateDialogOpen}
                    onClose={() => setCertificateDialogOpen(false)}
                    onDownload={handleCertificateDownload}
                />
            )}
        </>
    );
};