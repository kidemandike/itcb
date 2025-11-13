import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Paper,
    Alert,
    CircularProgress,
    Container,
} from '@mui/material';

// ⭐ IMPORTANT: REPLACE THIS URL WITH YOUR ACTUAL FASTAPI BACKEND ADDRESS
const BASE_URL = 'http://127.0.0.1:8000'; 

/**
 * Real API function to submit the certificate request to the FastAPI backend.
 * * @param {string} accessToken - The user's JWT token.
 * @param {object} data - The certificate application data.
 * @returns {Promise<object>} The created application object from the server.
 */
const submitCertificateRequest = async (accessToken, data) => {
    const url = `${BASE_URL}/certificate-applications/`;
    
    // The payload is constructed here to ensure it strictly matches the 
    // schemas.CertificateApplicationCreate Pydantic schema on the backend.
    const payload = {
        // Required by the Pydantic schema:
        certificate_type: data.certificate_type,
        purpose: data.purpose,
        application_notes: data.application_notes,
        
        // Fields that map to the model attributes:
        // NOTE: The key here MUST be 'contact_phone' as required by the backend schema.
        contact_phone: data.contact_phone, 
        department: data.department,
        graduation_year: data.graduation_year,
        registration_number: data.registration_number,
        
        // Full name is included in data but not required by the Pydantic input schema
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // CRITICAL for Authentication
            'Authorization': `Bearer ${accessToken}`, 
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // Attempt to extract the error details from the backend response
        let errorDetail = `HTTP Error ${response.status}.`;
        try {
            const errorData = await response.json();
            // This captures Pydantic validation errors (422) or other backend messages
            errorDetail = errorData.detail 
                ? JSON.stringify(errorData.detail) 
                : errorData.message || errorDetail;
        } catch (e) {
            // Handle case where response body isn't JSON
            errorDetail = `Request failed with status ${response.status}.`;
        }
        throw new Error(errorDetail);
    }

    // Return the successful response data (the created application object)
    return await response.json();
};

/**
 * CertificateRequestForm Component
 * Allows a student to submit a request for the English Language Proficiency Certificate.
 */
const CertificateRequestForm = ({ user, accessToken }) => {
    const [formData, setFormData] = useState({
        full_name: user.full_name || '', 
        registration_number: user.registration_number || user.student_id || '',
        phone_number: user.phone_number || user.phone || '', 
        department: '', 
        graduation_year: new Date().getFullYear().toString(),
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Basic client-side validation
        if (
            !formData.full_name.trim() || 
            !formData.registration_number.trim() || 
            !formData.phone_number.trim() ||
            !formData.department.trim() || 
            !formData.graduation_year.trim()
        ) {
            setError('Please enter all required fields: Full Name, Registration Number, Phone Number, Department, and Year of Graduation.');
            setLoading(false);
            return;
        }

        // Construct the data payload. 
        const requestData = {
            // Required by the Pydantic schema on the backend (422 fix)
            certificate_type: 'English Language Proficiency', 
            purpose: 'Academic Documentation for Employment/Study', 
            application_notes: '', 
            
            // ⭐ CRITICAL FIX: Map the local state 'phone_number' value 
            // to the API key 'contact_phone' as required by the backend schema.
            contact_phone: formData.phone_number, 

            // Form fields mapped directly
            department: formData.department,
            graduation_year: formData.graduation_year,
            registration_number: formData.registration_number,
            
            // User details for tracking (not part of the Pydantic input schema)
            full_name: formData.full_name,
        };

        try {
            const result = await submitCertificateRequest(accessToken, requestData);
            
            if (result && result.id) {
                setSuccess(`Certificate request submitted successfully! Tracking ID: ${result.id}.`);
                // Clear fields
                setFormData(prev => ({ 
                    ...prev, 
                    department: '',
                }));
            } else {
                setError('Submission failed: Server returned an unexpected response.');
            }
        } catch (err) {
            const message = err.message || 'An unexpected error occurred during submission.';
            // Clean up JSON strings in the error message for better display
            const cleanMessage = message.replace(/\\"/g, '"').replace(/^"|"$/g, '');
            setError(`Request Failed: ${cleanMessage}`);
            console.error("Certificate Submission Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                    Request ELP Certificate 🎓
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    Enter your details to request the English Language Proficiency Certificate.
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    {/* Full Name Field */}
                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        label="Full Name (As per University Records)"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        disabled={loading}
                        helperText="The name on the certificate will match this."
                    />

                    {/* Registration Number Field */}
                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        label="Registration Number"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleInputChange}
                        disabled={loading}
                        helperText="Pre-filled from your profile"
                    />

                    {/* Phone Number Field */}
                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        label="Phone Number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        disabled={loading}
                        helperText="Pre-filled from your profile"
                    />

                    {/* Department Field */}
                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        label="Department/College"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        disabled={loading}
                        helperText="e.g., Department of Language Studies"
                    />

                    {/* Graduation Year Field */}
                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        label="Year of Graduation"
                        name="graduation_year"
                        type="number"
                        value={formData.graduation_year}
                        onChange={handleInputChange}
                        disabled={loading}
                        helperText="e.g., 2022"
                    />

                    <Box mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {loading ? 'Submitting Request...' : 'Submit Certificate Request'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default CertificateRequestForm;