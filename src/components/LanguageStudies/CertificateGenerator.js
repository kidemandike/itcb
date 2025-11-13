import React, { useState } from "react";
import {
    Button,
    Typography,
    Grid,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { jsPDF } from "jspdf";

// Make sure the GState constructor is available on the jsPDF object
// This ensures compatibility if it wasn't automatically bundled.

export const CertificateGenerator = ({ application, open, onClose, onDownload }) => {
    // Fallbacks for initial state
    const defaultGrade = application?.grade || 'B';
    const defaultTestDate = application?.testDate || new Date().toISOString().split('T')[0];

    const [grade, setGrade] = useState(defaultGrade);
    const [testDate, setTestDate] = useState(defaultTestDate);
    const [loading, setLoading] = useState(false);
    // 1. NEW STATE: To track if the certificate was successfully generated
    const [certificateGenerated, setCertificateGenerated] = useState(false);

    const handleGenerateCertificate = async () => {
        setLoading(true);
        // Reset alert state before trying again
        setCertificateGenerated(false);

        try {
            const certificateData = {
                studentName: application.user_name || 'N/A',
                registrationNumber: application.registration_number || application.user_id || application.id || 'N/A',
                grade: grade,
                testDate: testDate,
            };

            await generatePDF(certificateData);

            // 2. SUCCESS ACTION: Set state to show success alert
            setCertificateGenerated(true);

            onDownload(certificateData);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Check the console for details.');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = (data) => {
        return new Promise((resolve, reject) => {
            try {
                // Create new PDF document
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                // Set margins and center
                const margin = 20;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const centerX = pageWidth / 2;

                // --- 1. Watermark Background ---
                pdf.saveGraphicsState();

                if (typeof pdf.setGState === 'function' && typeof jsPDF.GState === 'function') {
                    pdf.setGState(new jsPDF.GState({ opacity: 0.1 }));
                }

                pdf.setTextColor(240, 240, 240); // Very light gray
                pdf.setFontSize(80);
                pdf.setFont('helvetica', 'bold');

                const watermarkX = pageWidth / 2;
                const watermarkY = pageHeight / 2;

                pdf.text('DIS-SUA', watermarkX, watermarkY, {
                    align: 'center',
                    angle: -45
                });

                pdf.restoreGraphicsState(); // Restore original state

                // --- 2. Borders ---
                pdf.setDrawColor(0, 51, 102); // Dark blue
                pdf.setLineWidth(2);
                pdf.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

                // Inner border
                pdf.setDrawColor(0, 102, 204); // Lighter blue
                pdf.setLineWidth(0.5);
                pdf.rect(margin + 3, margin + 3, pageWidth - (margin * 2) - 6, pageHeight - (margin * 2) - 6);

                // --- 3. University Header ---
                pdf.setFontSize(18);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 51, 102); // Dark blue
                pdf.text('SOKOINE UNIVERSITY OF AGRICULTURE', centerX, 38, { align: 'center' });

                pdf.setFontSize(13);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
                pdf.text('DEPARTMENT OF LANGUAGE STUDIES', centerX, 48, { align: 'center' });

                // Decorative line
                pdf.setDrawColor(0, 102, 204);
                pdf.setLineWidth(0.5);
                pdf.line(centerX - 60, 52, centerX + 60, 52);

                pdf.setFontSize(18);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 51, 102);
                pdf.text('ENGLISH LANGUAGE PROFICIENCY', centerX, 65, { align: 'center' });
                pdf.text('CERTIFICATION', centerX, 74, { align: 'center' });

                // --- 4. Main Certificate Body ---
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
                pdf.text('This is to certify that', centerX, 90, { align: 'center' });

                // Student Name
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 51, 102);
                pdf.text(data.studentName.toUpperCase(), centerX, 105, { align: 'center' });

                // Registration Number
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
                pdf.text(`Registration Number: ${data.registrationNumber}`, centerX, 115, { align: 'center' });

                // Certificate description
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                const descriptionLines = [
                    'has been awarded the English Language Proficiency Certification after having',
                    `achieved an overall grade of ${data.grade} in the English Language Proficiency Test`,
                    '(ELPT). The test was administered by the Department of Language Studies',
                    `this day of ${formatDate(data.testDate)}.`,
                    '',
                    'The weighting of the test is as shown below.'
                ];

                descriptionLines.forEach((line, index) => {
                    pdf.text(line, centerX, 125 + (index * 5.5), { align: 'center' });
                });

                // Additional note
                pdf.text('In addition, the candidate pursued her undergraduate degree programme at this', centerX, 158, { align: 'center' });
                pdf.text('University, using English as the language of instruction.', centerX, 164, { align: 'center' });

                // --- 5. Grading Guide Table ---
                const tableTop = 178;
                const tableLeft = 35;
                const tableRight = pageWidth - 35;
                const col1Width = 30;
                const col2Width = 50;
                const col3Width = tableRight - tableLeft - col1Width - col2Width;

                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 51, 102);
                pdf.text('Grading Guide', centerX, tableTop - 3, { align: 'center' });

                // Table styling
                pdf.setDrawColor(0, 51, 102);
                pdf.setLineWidth(0.5);

                // Draw table header background
                pdf.setFillColor(0, 102, 204);
                pdf.rect(tableLeft, tableTop, tableRight - tableLeft, 8, 'F');

                // Outer border
                pdf.setLineWidth(1);
                pdf.rect(tableLeft, tableTop, tableRight - tableLeft, 50);

                // Column dividers
                pdf.setLineWidth(0.5);
                pdf.line(tableLeft + col1Width, tableTop, tableLeft + col1Width, tableTop + 50);
                pdf.line(tableLeft + col1Width + col2Width, tableTop, tableLeft + col1Width + col2Width, tableTop + 50);

                // Table headers
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255); // White text
                pdf.text('GRADE', tableLeft + col1Width / 2, tableTop + 5.5, { align: 'center' });
                pdf.text('PERCENTAGE', tableLeft + col1Width + col2Width / 2, tableTop + 5.5, { align: 'center' });
                pdf.text('REMARKS', tableLeft + col1Width + col2Width + col3Width / 2, tableTop + 5.5, { align: 'center' });

                // Table rows
                const grades = [
                    { grade: 'A', percentage: '80% and 100', remarks: 'Excellent' },
                    { grade: 'B+', percentage: '70 - 79%', remarks: 'Very Good' },
                    { grade: 'B', percentage: '65 - 69%', remarks: 'Good' },
                    { grade: 'C', percentage: '50 - 64%', remarks: 'Satisfactory' },
                    { grade: 'D', percentage: '40 - 49%', remarks: 'Poor' },
                    { grade: 'E', percentage: '0 - 39%', remarks: 'Very Poor' }
                ];

                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
                grades.forEach((item, index) => {
                    const rowY = tableTop + 8 + (index * 7);
                    const textY = rowY + 5;

                    // Alternating row background
                    if (index % 2 === 0) {
                        pdf.setFillColor(240, 248, 255); // Light blue
                        pdf.rect(tableLeft, rowY, tableRight - tableLeft, 7, 'F');
                    }

                    // Draw horizontal line between rows
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.2);
                    pdf.line(tableLeft, rowY, tableRight, rowY);

                    // Cell content
                    pdf.setFontSize(9);
                    pdf.text(item.grade, tableLeft + col1Width / 2, textY, { align: 'center' });
                    pdf.text(item.percentage, tableLeft + col1Width + col2Width / 2, textY, { align: 'center' });
                    pdf.text(item.remarks, tableLeft + col1Width + col2Width + col3Width / 2, textY, { align: 'center' });
                });

                // --- 6. Signature Section ---
                const signatureY = 240;

                // Signature line
                pdf.setDrawColor(0, 0, 0);
                pdf.setLineWidth(0.5);
                pdf.line(centerX - 40, signatureY, centerX + 40, signatureY);

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
                pdf.text('Signature', centerX, signatureY + 5, { align: 'center' });

                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Dr. Onesmo Simon Nyinondi', centerX, signatureY + 12, { align: 'center' });

                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.text('HEAD OF DEPARTMENT OF LANGUAGE STUDIES', centerX, signatureY + 17, { align: 'center' });

                // --- 7. Save ---
                const fileName = `ELP_Certificate_${data.registrationNumber}.pdf`;
                pdf.save(fileName);

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' }).toUpperCase();
        const year = date.getFullYear();

        // Add ordinal suffix to day
        const getOrdinal = (n) => {
            const s = ["TH", "ST", "ND", "RD"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]).toLowerCase();
        };

        return `${getOrdinal(day)} ${month} ${year}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Generate Certificate</DialogTitle>
            <DialogContent>
                {/* 3. CONDITIONAL ALERT: Display success message */}
                {certificateGenerated && (
                    <Alert
                        severity="success"
                        onClose={() => setCertificateGenerated(false)}
                        sx={{ mb: 2 }}
                    >
                        ✅ Certificate **successfully generated** and downloaded as `ELP_Certificate_{application.registration_number || application.user_id || application.id}.pdf`!
                    </Alert>
                )}

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Generate English Language Proficiency Certificate for <strong>{application?.user_name}</strong>
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            select
                            fullWidth
                            SelectProps={{ native: true }}
                        >
                            <option value="A">A (80% and 100)</option>
                            <option value="B+">B+ (70-79%)</option>
                            <option value="B">B (65-69%)</option>
                            <option value="C">C (50-64%)</option>
                            <option value="D">D (40-49%)</option>
                            <option value="E">E (0-39%)</option>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Test Date"
                            type="date"
                            value={testDate}
                            onChange={(e) => setTestDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 2 }}>
                    The certificate will include student name, registration number, and a proper grade table.
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleGenerateCertificate}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate & Download Certificate'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};