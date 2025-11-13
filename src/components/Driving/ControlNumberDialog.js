// components/ControlNumberDialog.js
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Alert,
    Box,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Divider,
} from '@mui/material';
import { generateControlNumber } from '../utils/controlNumberUtils';

export const ControlNumberDialog = ({ 
    open, 
    onClose, 
    onAssign, 
    application, 
    loading,
    type = "registration" // "registration" or "certificate"
}) => {
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [controlNumber, setControlNumber] = useState('');
    const [error, setError] = useState('');
    const [amount, setAmount] = useState(0);
    const [generatedPreview, setGeneratedPreview] = useState('');

    const isCertificate = type === "certificate";

    // Configuration based on type
    const config = {
        registration: {
            title: "Assign Registration Control Number",
            description: "Registration control number for course fee payment (Tsh 150,000)",
            prefix: "DRV",
            amount: 150000,
            length: 12,
            formatInfo: "Format: DRV + 9 digits (e.g., DRV123456789)"
        },
        certificate: {
            title: "Assign Certificate Control Number", 
            description: "Certificate control number for certificate fee payment (Tsh 20,000)",
            prefix: "CERT",
            amount: 20000,
            length: 12,
            formatInfo: "Format: CERT + 8 digits (e.g., CERT12345678)"
        }
    };

    const currentConfig = config[type];

    useEffect(() => {
        if (open) {
            setAutoGenerate(true);
            setControlNumber('');
            setError('');
            setAmount(currentConfig.amount);
            
            // Generate preview
            const preview = generateControlNumber(type);
            setGeneratedPreview(preview);
        }
    }, [open, type, currentConfig.amount]);

    const handleSubmit = () => {
        if (!autoGenerate && !controlNumber) {
            setError(`Please enter a ${isCertificate ? 'certificate' : 'registration'} control number`);
            return;
        }

        if (!autoGenerate && controlNumber.length !== currentConfig.length) {
            setError(`Control number must be exactly ${currentConfig.length} characters`);
            return;
        }

        // Validate format for manual entry
        if (!autoGenerate && !controlNumber.startsWith(currentConfig.prefix)) {
            setError(`Control number must start with ${currentConfig.prefix}`);
            return;
        }

        const finalControlNumber = autoGenerate ? generateControlNumber(type) : controlNumber;
        
        const controlData = {
            control_number: finalControlNumber,
            amount: currentConfig.amount,
            auto_generated: autoGenerate,
            type: type
        };

        onAssign(controlData);
    };

    const handleControlNumberChange = (value) => {
        const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setControlNumber(formatted);
        if (error) setError('');
    };

    const handleRegenerate = () => {
        const newNumber = generateControlNumber(type);
        setGeneratedPreview(newNumber);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {currentConfig.title}
            </DialogTitle>
            <DialogContent>
                {/* Application Information */}
                {application && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Student Information
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Chip 
                                    label={`Name: ${application.student_full_name}`} 
                                    variant="outlined" 
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Chip 
                                    label={`Course: ${application.course_name || application.course_type}`} 
                                    variant="outlined" 
                                    size="small"
                                />
                            </Grid>
                            {isCertificate && application.registration_control_number && (
                                <Grid item xs={12}>
                                    <Chip 
                                        label={`Reg. Control: ${application.registration_control_number}`} 
                                        color="primary" 
                                        size="small"
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Payment Information */}
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Payment Required: Tsh {currentConfig.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                        {currentConfig.description}
                    </Typography>
                </Alert>

                {/* Control Number Generation Options */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={autoGenerate}
                            onChange={(e) => setAutoGenerate(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={`Auto-generate control number`}
                />

                {autoGenerate ? (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="success">
                            <Typography variant="subtitle2" gutterBottom>
                                Auto-generated Control Number Preview:
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                mt: 1 
                            }}>
                                <Typography 
                                    variant="h6" 
                                    fontFamily="monospace"
                                    color="primary"
                                >
                                    {generatedPreview}
                                </Typography>
                                <Button 
                                    size="small" 
                                    onClick={handleRegenerate}
                                    disabled={loading}
                                >
                                    Regenerate
                                </Button>
                            </Box>
                        </Alert>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {currentConfig.formatInfo}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label={`${type.charAt(0).toUpperCase() + type.slice(1)} Control Number`}
                            value={controlNumber}
                            onChange={(e) => handleControlNumberChange(e.target.value)}
                            fullWidth
                            required
                            placeholder={`Enter ${currentConfig.length}-digit control number`}
                            error={!!error}
                            helperText={error || `${currentConfig.length} characters required`}
                            inputProps={{ 
                                maxLength: currentConfig.length,
                                style: { 
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold'
                                }
                            }}
                        />
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                                {currentConfig.formatInfo}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="primary">
                                Must start with: <strong>{currentConfig.prefix}</strong>
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Validation Rules */}
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                        <strong>Important:</strong> This control number will be used for payment processing. 
                        Ensure it follows the correct format and is unique.
                    </Typography>
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Assigning...' : `Assign Control Number`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};