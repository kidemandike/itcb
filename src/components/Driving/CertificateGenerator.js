import React, { useState } from "react";
import {
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
} from "@mui/material";
import { jsPDF } from "jspdf";
import QRCode from 'qrcode';

export const CertificateGenerator = ({ application, open, onClose, onDownload }) => {
  const defaultGrade = application?.grade || "B";
  const defaultIssueDate = application?.completion_date || new Date().toISOString().split("T")[0];

  const [grade, setGrade] = useState(defaultGrade);
  const [issueDate, setIssueDate] = useState(defaultIssueDate);
  const [loading, setLoading] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  // QR Code Generation Function
  const generateQRCode = async (text, size = 150) => {
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(text, {
        width: size,
        height: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      // Fallback to simple pattern if QR code generation fails
      return generateSimpleQRCode(size);
    }
  };

  // Fallback function if QR code library fails
  const generateSimpleQRCode = (size = 150) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = size;
      canvas.height = size;
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      // Black border
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, 2);
      ctx.fillRect(0, 0, 2, size);
      ctx.fillRect(size-2, 0, 2, size);
      ctx.fillRect(0, size-2, size, 2);
      
      // Add SUA text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SUA', size/2, size/2);
      
      resolve(canvas.toDataURL('image/png'));
    });
  };

  const handleGenerateCertificate = async () => {
    setLoading(true);
    setCertificateGenerated(false);

    try {
      const certificateData = {
        studentName: application.user_name || application.student_full_name,
        registrationNumber: application.registration_control_number,
        certificateNumber: application.certificate_control_number,
        courseType: application.course_name || application.course_type,
        grade: grade,
        issueDate: issueDate,
      };

      await generatePDF(certificateData);
      setCertificateGenerated(true);
      onDownload(certificateData);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create new PDF document - PORTRAIT orientation
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        // Set margins and center
        const margin = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const centerX = pageWidth / 2;

        // Generate QR Code for SUA website
        const qrCodeDataURL = await generateQRCode("https://www.sua.ac.tz", 150);

        // --- 1. Watermark Background ---
        pdf.saveGraphicsState();

        if (typeof pdf.setGState === 'function' && typeof jsPDF.GState === 'function') {
          pdf.setGState(new jsPDF.GState({ opacity: 0.1 }));
        }

        pdf.setTextColor(240, 240, 240);
        pdf.setFontSize(80);
        pdf.setFont('helvetica', 'bold');

        const watermarkX = pageWidth / 2;
        const watermarkY = pageHeight / 2;

        pdf.text('SUA-ENG', watermarkX, watermarkY, {
          align: 'center',
          angle: -45
        });

        pdf.restoreGraphicsState();

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
        pdf.setTextColor(0, 51, 102);
        pdf.text('SOKOINE UNIVERSITY OF AGRICULTURE', centerX, 38, { align: 'center' });

        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text('DEPARTMENT OF ENGINEERING SCIENCES AND TECHNOLOGY', centerX, 48, { align: 'center' });

        // Decorative line
        pdf.setDrawColor(0, 102, 204);
        pdf.setLineWidth(0.5);
        pdf.line(centerX - 60, 52, centerX + 60, 52);

        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 51, 102);
        pdf.text('DRIVING COURSE COMPLETION', centerX, 65, { align: 'center' });
        pdf.text('CERTIFICATE', centerX, 74, { align: 'center' });

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

      
        // Certificate description
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const descriptionLines = [
          'has successfully completed the Driving Course and has been awarded',
          `an overall grade of ${data.grade}. This certificate qualifies the holder`,
          `to operate ${getVehicleType(data.courseType)} in accordance with`,
          'Tanzanian traffic regulations.',
          '',
          `Issued this day of ${formatDate(data.issueDate)}.`
        ];

        descriptionLines.forEach((line, index) => {
          pdf.text(line, centerX, 132 + (index * 5.5), { align: 'center' });
        });

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
        pdf.text('GRADING SYSTEM', centerX, tableTop - 3, { align: 'center' });

        // Table styling
        pdf.setDrawColor(0, 51, 102);
        pdf.setLineWidth(0.5);

        // Draw table header background
        pdf.setFillColor(0, 102, 204);
        pdf.rect(tableLeft, tableTop, tableRight - tableLeft, 8, 'F');

        // Outer border
        pdf.setLineWidth(1);
        pdf.rect(tableLeft, tableTop, tableRight - tableLeft, 42);

        // Column dividers
        pdf.setLineWidth(0.5);
        pdf.line(tableLeft + col1Width, tableTop, tableLeft + col1Width, tableTop + 42);
        pdf.line(tableLeft + col1Width + col2Width, tableTop, tableLeft + col1Width + col2Width, tableTop + 42);

        // Table headers
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text('GRADE', tableLeft + col1Width / 2, tableTop + 5.5, { align: 'center' });
        pdf.text('SCORE RANGE', tableLeft + col1Width + col2Width / 2, tableTop + 5.5, { align: 'center' });
        pdf.text('DESCRIPTION', tableLeft + col1Width + col2Width + col3Width / 2, tableTop + 5.5, { align: 'center' });

        // Table rows
        const grades = [
          { grade: 'A', range: '90-100%', description: 'EXCELLENT' },
          { grade: 'B', range: '80-89%', description: 'VERY GOOD' },
          { grade: 'C', range: '70-79%', description: 'GOOD' },
          { grade: 'D', range: '60-69%', description: 'SATISFACTORY' },
          { grade: 'F', range: 'Below 60%', description: 'FAIL' }
        ];

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        grades.forEach((item, index) => {
          const rowY = tableTop + 8 + (index * 7);
          const textY = rowY + 5;

          // Alternating row background
          if (index % 2 === 0) {
            pdf.setFillColor(240, 248, 255);
            pdf.rect(tableLeft, rowY, tableRight - tableLeft, 7, 'F');
          }

          // Highlight current grade
          if (item.grade === data.grade) {
            pdf.setFillColor(255, 250, 205);
            pdf.rect(tableLeft, rowY, tableRight - tableLeft, 7, 'F');
            pdf.setFont('helvetica', 'bold');
          } else {
            pdf.setFont('helvetica', 'normal');
          }

          // Draw horizontal line between rows
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.2);
          pdf.line(tableLeft, rowY, tableRight, rowY);

          // Cell content
          pdf.setFontSize(9);
          pdf.text(item.grade, tableLeft + col1Width / 2, textY, { align: 'center' });
          pdf.text(item.range, tableLeft + col1Width + col2Width / 2, textY, { align: 'center' });
          pdf.text(item.description, tableLeft + col1Width + col2Width + col3Width / 2, textY, { align: 'center' });
        });

        // --- 6. Signature Section ---
        const signatureY = 230;

        // Left signature - Head of Department
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(centerX - 60, signatureY, centerX - 20, signatureY);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Signature', centerX - 40, signatureY + 5, { align: 'center' });

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dr. J. M. Mrosso', centerX - 40, signatureY + 12, { align: 'center' });

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('HEAD OF ENGINEERING DEPARTMENT', centerX - 40, signatureY + 17, { align: 'center' });

        // Right signature - Registrar
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(centerX + 20, signatureY, centerX + 60, signatureY);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Signature', centerX + 40, signatureY + 5, { align: 'center' });

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Prof. A. B. Mfinanga', centerX + 40, signatureY + 12, { align: 'center' });

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('UNIVERSITY REGISTRAR', centerX + 40, signatureY + 17, { align: 'center' });

        // --- 7. QR Code Section (Bottom Left) ---
        const qrCodeSize = 25;
        const qrCodeX = margin + 5;
        const qrCodeY = pageHeight - margin - qrCodeSize - 15;

        // Add QR Code to PDF
        pdf.addImage(qrCodeDataURL, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
        
       
        // --- 8. Footer ---
        const footerY = signatureY + 30;
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Official Document - Not Valid Without Official Stamp & Signatures', centerX, footerY, { align: 'center' });

        // Certificate ID footer
        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.text(
          `Certificate ID: ${data.certificateNumber} | Generated: ${new Date().toLocaleDateString('en-GB')}`,
          centerX,
          pageHeight - 8,
          { align: 'center' }
        );

        // Save PDF
        const fileName = `SUA_Driving_Certificate_${data.certificateNumber}.pdf`;
        pdf.save(fileName);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const getVehicleType = (courseType) => {
    const course = courseType?.toLowerCase() || '';
    if (course.includes('agricultural')) return 'agricultural machinery and equipment';
    if (course.includes('heavy')) return 'heavy construction equipment';
    return 'light motor vehicles';
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
      <DialogTitle>
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "bold", color: "primary.main" }}
        >
          Generate Driving Certificate
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* Success Alert */}
        {certificateGenerated && (
          <Alert
            severity="success"
            onClose={() => setCertificateGenerated(false)}
            sx={{ mb: 2 }}
          >
            ✅ Certificate successfully generated and downloaded as SUA_Driving_Certificate_{application?.certificate_control_number}.pdf!
            <br />
            <strong>Includes QR code that directs to www.sua.ac.tz when scanned</strong>
          </Alert>
        )}

        <Typography sx={{ textAlign: "center", mb: 2 }}>
          Generate Driving Course Completion Certificate for{" "}
          <strong>{application?.user_name || application?.student_full_name}</strong>
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Final Grade"
              fullWidth
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="A">A - Excellent (90-100%)</option>
              <option value="B">B - Very Good (80-89%)</option>
              <option value="C">C - Good (70-79%)</option>
              <option value="D">D - Satisfactory (60-69%)</option>
              <option value="F">F - Fail (Below 60%)</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Certificate Issue Date"
              fullWidth
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Student:</strong> {application?.user_name || application?.student_full_name}<br />
            <strong>Course:</strong> {application?.course_name || application?.course_type}<br />
            <strong>Registration No:</strong> {application?.registration_control_number || "N/A"}<br />
            <strong>Certificate No:</strong> {application?.certificate_control_number || "N/A"}<br />
            <strong>QR Code:</strong> Will be included in the bottom-left corner. When scanned, it will open www.sua.ac.tz
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateCertificate}
          disabled={loading || !application?.certificate_control_number}
          sx={{ minWidth: 180 }}
        >
          {loading ? "Generating..." : "Generate & Download PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};