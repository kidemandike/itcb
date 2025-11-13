import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import api from '../../api'; 


const getStatusColor = (status) => {
    switch (status) {
        case 'Submitted':
        case 'Pending':
            return 'warning';
        case 'Approved':
            return 'primary';
        case 'Rejected':
            return 'error';
        case 'Control Number Set':
            return 'info'; // Signifies ready for payment
        case 'Issued':
        case 'Paid':
            return 'success';
        default:
            return 'default';
    }
};

const StudentCertificateProgress = ({ accessToken, user }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyApplications = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // This calls the new API function in api.js
            const result = await api.getMyCertificateApplications(accessToken);
            setApplications(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error("Error fetching student certificate applications:", err);
            // Optionally display an error message to the user
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyApplications();
    }, [accessToken, user.id]);

    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h5" color="primary" gutterBottom>
                My Certificate Application Progress
            </Typography>
            <Button 
                onClick={fetchMyApplications} 
                variant="outlined" 
                sx={{ mb: 2 }}
                disabled={loading}
            >
                {loading ? 'Refreshing...' : 'Refresh Status'}
            </Button>
            {loading ? (
                <CircularProgress />
            ) : applications.length === 0 ? (
                <Typography variant="body1">
                    You have not submitted any certificate applications yet.
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                <TableCell>Submission Date</TableCell>
                                <TableCell>Current Status</TableCell>
                                <TableCell>Control No. (Payment)</TableCell>
                                <TableCell>Amount Due</TableCell>
                                <TableCell>Next Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {applications.map((app) => {
                                // Determine the most relevant status to show
                                const currentStatus = app.admin_status || app.staff_status || 'Submitted';
                                const needsPayment = app.control_number && currentStatus === 'Approved';
                                
                                return (
                                    <TableRow key={app.id} hover>
                                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={currentStatus}
                                                color={getStatusColor(currentStatus)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={needsPayment ? 'bold' : 'normal'}>
                                                {app.control_number || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="bold" color={needsPayment ? 'error' : 'textSecondary'}>
                                                {needsPayment ? 'Tsh 20,000' : 'N/A'} 
                         Application DateApplication Date                   </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {needsPayment ? (
                                                <Typography color="error" fontWeight="bold">
                                                    Proceed to Payment using Control No.
                                                </Typography>
                                            ) : currentStatus === 'Rejected' ? (
                                                <Typography color="error">Rejected - Check Staff Remarks</Typography>
                                            ) : currentStatus === 'Issued' ? (
                                                <Typography color="success">Certificate Ready/Issued</Typography>
                                            ) : (
                                                <Typography color="textSecondary">Awaiting Director Review</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default StudentCertificateProgress;