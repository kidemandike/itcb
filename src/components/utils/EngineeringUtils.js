import { format } from 'date-fns';

// -------------------------------------------------------------------
// --- Helper Functions for UI Styling ---
// -------------------------------------------------------------------

export const getStatusColor = (status) => {
    switch (status) {
        case 'Approved':
            return 'success';
        case 'Completed':
            return 'primary';
        case 'In Progress':
            return 'info';
        case 'Pending Review':
            return 'warning';
        case 'Rejected':
        case 'Failed':
            return 'error';
        default:
            return 'default';
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
// --- Certificate Generation Logic ---
// -------------------------------------------------------------------

export const generateCertificatePDF = async (data) => {
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
                    border: 20px solid #8B0000;
                    padding: 60px 40px;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .university-header {
                    color: #8B0000;
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
                    color: #0066cc;
                    margin: 30px 0;
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
                .details {
                    text-align: left;
                    margin: 30px auto;
                    max-width: 600px;
                    padding: 20px;
                    border: 1px solid #ddd;
                    background-color: #f9f9f9;
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
                <div class="department">DEPARTMENT OF ENGINEERING - DRIVING SCHOOL</div>
                
                <div class="certificate-title">DRIVING COURSE COMPLETION CERTIFICATE</div>
                
                <div class="certificate-text">
                    This is to certify that
                </div>
                
                <div class="student-name">${data.studentName}</div>
                
                <div class="certificate-text">
                    has successfully completed the <strong>${data.courseType} Driving Course</strong>
                    and has been awarded an overall grade of <strong>${data.grade}</strong>.
                </div>
                
                <div class="details">
                    <p><strong>Certificate Number:</strong> ${data.certificateNumber}</p>
                    <p><strong>Registration Number:</strong> ${data.registrationNumber}</p>
                    <p><strong>License Class:</strong> ${data.licenseClass}</p>
                    <p><strong>Date of Issue:</strong> ${new Date(data.issueDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                    <p><strong>Course Type:</strong> ${data.courseType}</p>
                </div>
                
                <div class="certificate-text">
                    This certificate qualifies the holder to operate ${getVehicleType(data.courseType)}
                    in accordance with Tanzanian traffic regulations.
                </div>
                
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px; font-weight: bold;">Head of Engineering Department</div>
                    <div>SOKOINE UNIVERSITY OF AGRICULTURE</div>
                </div>
                
                <div class="control-number">
                    Control Number: ${data.certificateNumber}
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

const getVehicleType = (courseType) => {
    switch (courseType) {
        case 'Regular Vehicles':
            return 'light motor vehicles';
        case 'Agricultural Machinery':
            return 'agricultural machinery and equipment';
        case 'Heavy Equipment':
            return 'heavy construction equipment';
        default:
            return 'motor vehicles';
    }
};