import jsPDF from 'jspdf';

// Enhanced PDF Helper Functions
const drawStatBox = (doc, x, y, width, height, title, mainValue, subtitle, color, details = []) => {
    // Box background with subtle shadow effect
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 5, 5, 'F');
    
    // Border with theme color
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.8);
    doc.roundedRect(x, y, width, height, 5, 5, 'S');
    
    // Colored accent bar at top
    doc.setFillColor(color);
    doc.roundedRect(x, y, width, 4, 2, 2, 'F');
    
    // Title
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 12, y + 16);
    
    // Main value
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    doc.text(mainValue.toString(), x + 12, y + 30);
    
    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, x + 12, y + 36);
    
    // Details
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    details.forEach((detail, index) => {
        doc.text(detail, x + 12, y + 44 + (index * 5));
    });
};

const drawRevenueBox = (doc, x, y, width, height, title, value, color) => {
    // Premium box design
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 6, 6, 'F');
    
    // Gradient-like colored left border
    doc.setFillColor(color);
    doc.roundedRect(x, y, 6, height, 3, 3, 'F');
    
    // Title with icon placeholder
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'bold');
    doc.text('💰 ' + title, x + 12, y + 12);
    
    // Value with currency styling
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    
    const valueLines = doc.splitTextToSize(value, width - 24);
    valueLines.forEach((line, index) => {
        doc.text(line, x + 12, y + 26 + (index * 8));
    });
};

// Enhanced PDF Generation Logic
export const generatePDFReport = async ({
    stats,
    conferenceRoomStats,
    drivingStats,
    api,
    accessToken,
    setActionLoading,
    totalRevenue
}) => {
    setActionLoading(true);
    try {
        // Data fetch/recalculation for PDF accuracy
        let conferenceBookings = [];
        let currentConferenceRevenue = conferenceRoomStats.conferenceRevenue;
        let totalBookings = conferenceRoomStats.totalBookings;
        let pendingBookings = conferenceRoomStats.pendingBookings;
        let approvedBookings = conferenceRoomStats.approvedBookings;
        let cancelledBookings = conferenceRoomStats.cancelledBookings;
        let completedBookings = conferenceRoomStats.completedBookings;

        // Fetch driving data for PDF
        let currentDrivingStats = { ...drivingStats };

        try {
            // Fetch conference room data
            conferenceBookings = await api.getAdminAllBookings(accessToken);
            totalBookings = conferenceBookings.length || 0;
            pendingBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'pending').length || 0;
            approvedBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'approved').length || 0;
            cancelledBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'cancelled').length || 0;
            completedBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'completed').length || 0;
            currentConferenceRevenue = conferenceBookings
                .filter(booking => booking.status?.toLowerCase() === 'approved' || booking.status?.toLowerCase() === 'completed')
                .reduce((total, booking) => total + (parseFloat(booking.total_price) || 0), 0);

            // Fetch driving data
            const drivingApplications = await api.getDrivingApplications(accessToken) || [];
            const drivingCourses = await api.getDrivingCourses(accessToken) || [];
            
            currentDrivingStats = {
                totalApplications: drivingApplications.length || 0,
                approvedApplications: drivingApplications.filter(app => app.course_status === 'Approved').length || 0,
                completedCourses: drivingApplications.filter(app => app.course_status === 'Completed').length || 0,
                certificateRequests: drivingApplications.filter(app => app.certificate_requested).length || 0,
                issuedCertificates: drivingApplications.filter(app => app.certificate_issued).length || 0,
                drivingRevenue: (drivingApplications.filter(app => app.certificate_issued).length || 0) * 20000,
                totalCourses: drivingCourses.length || 0,
            };

        } catch (error) {
            console.error('Failed to fetch data for PDF, using state data:', error);
        }
        
        const pdfTotalRevenue = stats.totalRevenue + currentConferenceRevenue + currentDrivingStats.drivingRevenue;

        // Create PDF with enhanced layout
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPosition = margin;
        
        // Premium background gradient effect
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Enhanced Header with gradient
        doc.setFillColor(0, 83, 78);
        doc.rect(0, 0, pageWidth, 70, 'F');
        
        // Institution branding
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('SUA-ITCB TRAINING CENTER', pageWidth / 2, 30, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('COMPREHENSIVE SYSTEM REPORT', pageWidth / 2, 48, { align: 'center' });
        
        // Report metadata with improved styling
        yPosition = 80;
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}`, pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 20;
        
        // MAIN STATISTICS SECTION - Enhanced grid layout
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('📊 SYSTEM OVERVIEW STATISTICS', margin, yPosition);
        yPosition += 15;
        
        // Statistics Grid - 2 columns with improved spacing
        const boxWidth = (pageWidth - (margin * 3)) / 2;
        const boxHeight = 50;
        
        // Row 1
        drawStatBox(doc, margin, yPosition, boxWidth, boxHeight, 
            '👥 USERS', stats.totalUsers, 'Total System Users', '#4F46E5', 
            [`Students: ${stats.students}`, `Teachers: ${stats.teachers}`, `Admins: ${stats.admins}`]
        );
        
        drawStatBox(doc, margin * 2 + boxWidth, yPosition, boxWidth, boxHeight, 
            '📚 COURSES', stats.totalCourses, 'Available Courses', '#DC2626', 
            [`Registrations: ${stats.totalRegistrations}`]
        );
        
        yPosition += boxHeight + 15;
        
        // Row 2
        drawStatBox(doc, margin, yPosition, boxWidth, boxHeight, 
            '🎫 REGISTRATIONS', stats.totalRegistrations, 'Course Enrollments', '#EA580C', 
            [`Paid: ${stats.paidRegistrations}`, `Pending: ${stats.pendingPayments}`, `Cancelled: ${stats.cancelledRegistrations}`]
        );
        
        drawStatBox(doc, margin * 2 + boxWidth, yPosition, boxWidth, boxHeight, 
            '🚗 DRIVING COURSES', currentDrivingStats.totalApplications, 'Engineering Department', '#8B0000', 
            [`Approved: ${currentDrivingStats.approvedApplications}`, `Completed: ${currentDrivingStats.completedCourses}`, `Certificates: ${currentDrivingStats.issuedCertificates}`]
        );

        // Row 3: Certificate Requests
        yPosition += boxHeight + 15;
        drawStatBox(doc, margin, yPosition, boxWidth, boxHeight, 
            '🏆 CERTIFICATE REQUESTS', stats.totalCertRequests, 'ELP Certificates', '#9333EA', 
            [`Pending: ${stats.pendingCertRequests}`, `Ready: ${stats.readyCertRequests}`, `Issued: ${stats.issuedCertRequests}`]
        );
        
        drawStatBox(doc, margin * 2 + boxWidth, yPosition, boxWidth, boxHeight, 
            '🏨 ROOM BOOKINGS', totalBookings, 'Conference Facilities', '#059669', 
            [`Pending: ${pendingBookings}`, `Approved: ${approvedBookings}`, `Completed: ${completedBookings}`]
        );
        
        yPosition += boxHeight + 20;
        
        // REVENUE SECTION - Premium financial breakdown
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('💰 FINANCIAL OVERVIEW', margin, yPosition);
        yPosition += 15;
        
        const revenueBoxWidth = (pageWidth - (margin * 5)) / 4;
        const revenueBoxHeight = 40;
        
        drawRevenueBox(doc, margin, yPosition, revenueBoxWidth, revenueBoxHeight,
            'COURSE REVENUE', `Tsh ${stats.totalRevenue.toLocaleString()}`, '#7C3AED'
        );
        
        drawRevenueBox(doc, margin * 2 + revenueBoxWidth, yPosition, revenueBoxWidth, revenueBoxHeight,
            'ROOM REVENUE', `Tsh ${currentConferenceRevenue.toLocaleString()}`, '#0369A1'
        );

        drawRevenueBox(doc, margin * 3 + revenueBoxWidth * 2, yPosition, revenueBoxWidth, revenueBoxHeight,
            'DRIVING REVENUE', `Tsh ${currentDrivingStats.drivingRevenue.toLocaleString()}`, '#8B0000'
        );
        
        drawRevenueBox(doc, margin * 4 + revenueBoxWidth * 3, yPosition, revenueBoxWidth, revenueBoxHeight,
            'TOTAL REVENUE', `Tsh ${pdfTotalRevenue.toLocaleString()}`, '#EA580C'
        );
        
        yPosition += 55;

        // PERFORMANCE METRICS SECTION
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('📈 PERFORMANCE METRICS', margin, yPosition);
        yPosition += 15;

        // Performance metrics in a grid
        const performanceBoxWidth = (pageWidth - (margin * 3)) / 2;
        const performanceBoxHeight = 35;

        // Calculate performance rates
        const roomBookingCompletionRate = totalBookings > 0 
            ? Math.round((completedBookings / totalBookings) * 100) 
            : 0;
        
        const certReadyRate = stats.totalCertRequests > 0
            ? Math.round((stats.readyCertRequests / stats.totalCertRequests) * 100)
            : 0;

        const paidRegistrationRate = stats.totalRegistrations > 0
            ? Math.round((stats.paidRegistrations / stats.totalRegistrations) * 100)
            : 0;

        const drivingCompletionRate = currentDrivingStats.totalApplications > 0
            ? Math.round((currentDrivingStats.completedCourses / currentDrivingStats.totalApplications) * 100)
            : 0;

        // Performance metrics row 1
        drawStatBox(doc, margin, yPosition, performanceBoxWidth, performanceBoxHeight, 
            '🏨 ROOM COMPLETION', `${roomBookingCompletionRate}%`, 'Booking Completion', '#059669', 
            [`${completedBookings} of ${totalBookings} bookings`]
        );
        
        drawStatBox(doc, margin * 2 + performanceBoxWidth, yPosition, performanceBoxWidth, performanceBoxHeight, 
            '🏆 CERTIFICATE READY', `${certReadyRate}%`, 'Certificate Status', '#9333EA', 
            [`${stats.readyCertRequests} of ${stats.totalCertRequests} ready`]
        );

        yPosition += performanceBoxHeight + 10;

        // Performance metrics row 2
        drawStatBox(doc, margin, yPosition, performanceBoxWidth, performanceBoxHeight, 
            '📈 REGISTRATION PAID', `${paidRegistrationRate}%`, 'Payment Completion', '#EA580C', 
            [`${stats.paidRegistrations} of ${stats.totalRegistrations} paid`]
        );
        
        drawStatBox(doc, margin * 2 + performanceBoxWidth, yPosition, performanceBoxWidth, performanceBoxHeight, 
            '🚗 DRIVING COMPLETION', `${drivingCompletionRate}%`, 'Course Completion', '#8B0000', 
            [`${currentDrivingStats.completedCourses} of ${currentDrivingStats.totalApplications} completed`]
        );
        
        // Save PDF
        doc.save(`sua-itcb-comprehensive-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        alert('Failed to generate PDF report.');
    } finally {
        setActionLoading(false);
    }
};