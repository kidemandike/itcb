import { format } from 'date-fns';

// -------------------------------------------------------------------
// --- Helper Functions for UI Styling ---
// -------------------------------------------------------------------

export const getStatusColor = (status) => {
    switch (status) {
        case 'Approved':
            return 'success';
        case 'Rejected':
        case 'Issued':
            return 'success'; // 'Issued' is typically a success state
        case 'Pending Review':
        default:
            return 'warning';
    }
};

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
        return dateString;
    }
};

// -------------------------------------------------------------------
// --- PDF Generation Logic ---
// -------------------------------------------------------------------

export const generateCertificatePDF = async (data) => {
    // NOTE: This uses an HTML string to create a Blob for simple download.
    // In a real production environment, you would use a dedicated PDF library (like jsPDF 
    // or react-pdf) for better control, or preferably, call a secure backend 
    // API endpoint that generates and returns the PDF file directly.

    const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    font-family: 'Times New Roman', serif; 
                    margin: 0; 
                    padding: 40px; 
                    background-color: #f8f8f8;
                }
                .certificate-container {
                    background: white;
                    border: 20px solid #8B4513;
                    padding: 60px 40px;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .university-header {
                    color: #2E8B57;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .department {
                    font-size: 20px;
                    color: #555;
                    margin-bottom: 30px;
                }
                .certificate-title {
                    font-size: 32px;
                    font-weight: bold;
                    color: #8B0000;
                    margin: 30px 0;
                    text-decoration: underline;
                }
                .student-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2F4F4F;
                    margin: 20px 0;
                }
                .certificate-text {
                    font-size: 18px;
                    line-height: 1.6;
                    margin: 20px 0;
                    color: #333;
                }
                .grade {
                    font-size: 24px;
                    font-weight: bold;
                    color: #8B0000;
                    margin: 15px 0;
                }
                .signature-section {
                    margin-top: 60px;
                    text-align: right;
                }
                .signature-line {
                    border-top: 1px solid #000;
                    width: 300px;
                    margin-left: auto;
                    margin-top: 60px;
                }
                .signature-name {
                    margin-top: 5px;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 14px;
                    color: #666;
                }
                .control-number {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="university-header">SOKOINE UNIVERSITY OF AGRICULTURE</div>
                <div class="department">DEPARTMENT OF LANGUAGE STUDIES</div>
                
                <div class="certificate-title">ENGLISH LANGUAGE PROFICIENCY CERTIFICATION</div>
                
                <div class="certificate-text">
                    This is to certify that
                </div>
                
                <div class="student-name">${data.studentName}</div>
                
                <div class="certificate-text">
                    Has been awarded the <strong>English Language Proficiency Certification</strong>
                    after having achieved an overall grade of <span class="grade">${data.grade}</span> 
                    in the <strong>English Language Proficiency Test (ELPT)</strong>.
                </div>
                
                <div class="certificate-text">
                    The test was administered by the <strong>Department of Language Studies</strong> 
                    on <strong>${new Date(data.testDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</strong>.
                </div>
                
                <div class="certificate-text">
                    In addition, the candidate pursued her undergraduate degree programme at 
                    this University, using English as the language of instruction.
                </div>
                
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-name">Dr. Onesmo Simon Nyinondi</div>
                    <div>HEAD OF DEPARTMENT OF LANGUAGE STUDIES</div>
                </div>
                
                <div class="control-number">
                    Control Number: ${data.controlNumber}
                </div>
                
                <div class="footer">
                    Official Document - Sokoine University of Agriculture
                </div>
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([certificateHTML], { type: 'text/html' });
    return blob;
};