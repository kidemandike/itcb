import React, { useState, useEffect, useCallback } from 'react';
import { generatePDFReport } from './pdfReportGenerator';
import StatsGrid from './StatsGrid';
import PerformanceAnalytics from './PerformanceAnalytics';
import RevenueBreakdown from './RevenueBreakdown';

const AdminStatsOverview = ({ stats, registrations, accessToken, api, actionLoading, setActionLoading }) => {
    // 1. State for Conference Room Data
    const [conferenceRoomStats, setConferenceRoomStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        conferenceRevenue: 0,
    });

    // 2. State for Driving Applications Data
    const [drivingStats, setDrivingStats] = useState({
        totalApplications: 0,
        approvedApplications: 0,
        completedCourses: 0,
        certificateRequests: 0,
        issuedCertificates: 0,
        drivingRevenue: 0,
        totalCourses: 0,
    });

    // Ensure all stats have default values of 0
    const safeStats = {
        totalUsers: stats?.totalUsers || 0,
        students: stats?.students || 0,
        teachers: stats?.teachers || 0,
        admins: stats?.admins || 0,
        totalCourses: stats?.totalCourses || 0,
        totalRegistrations: stats?.totalRegistrations || 0,
        paidRegistrations: stats?.paidRegistrations || 0,
        pendingPayments: stats?.pendingPayments || 0,
        cancelledRegistrations: stats?.cancelledRegistrations || 0,
        totalCertRequests: stats?.totalCertRequests || 0,
        pendingCertRequests: stats?.pendingCertRequests || 0,
        readyCertRequests: stats?.readyCertRequests || 0,
        issuedCertRequests: stats?.issuedCertRequests || 0,
        totalRevenue: stats?.totalRevenue || 0,
    };

    // Total Revenue calculation - now includes driving revenue
    const totalRevenue = safeStats.totalRevenue + conferenceRoomStats.conferenceRevenue + drivingStats.drivingRevenue;

    // 2. Function to fetch and set Conference Room data
    const fetchConferenceRoomStats = useCallback(async () => {
        if (!api || !accessToken) return;
        
        try {
            const conferenceBookings = await api.getAdminAllBookings(accessToken); 
            
            const totalBookings = conferenceBookings.length || 0;
            const pendingBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'pending').length || 0;
            const approvedBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'approved').length || 0;
            const cancelledBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'cancelled').length || 0;
            const completedBookings = conferenceBookings.filter(b => b.status?.toLowerCase() === 'completed').length || 0;
            
            const conferenceRevenue = conferenceBookings
                .filter(booking => booking.status?.toLowerCase() === 'approved' || booking.status?.toLowerCase() === 'completed')
                .reduce((total, booking) => total + (parseFloat(booking.total_price) || 0), 0);

            setConferenceRoomStats({
                totalBookings,
                pendingBookings,
                approvedBookings,
                cancelledBookings,
                completedBookings,
                conferenceRevenue,
            });
        } catch (error) {
            console.error('Failed to fetch conference room bookings for display:', error);
            // Set default values on error
            setConferenceRoomStats({
                totalBookings: 0,
                pendingBookings: 0,
                approvedBookings: 0,
                cancelledBookings: 0,
                completedBookings: 0,
                conferenceRevenue: 0,
            });
        }
    }, [api, accessToken]);

    // 3. Function to fetch and set Driving Applications data
    const fetchDrivingStats = useCallback(async () => {
        if (!api || !accessToken) return;
        
        try {
            const drivingApplications = await api.getDrivingApplications(accessToken) || [];
            const drivingCourses = await api.getDrivingCourses(accessToken) || [];
            
            const totalApplications = drivingApplications.length || 0;
            const approvedApplications = drivingApplications.filter(app => app.course_status === 'Approved').length || 0;
            const completedCourses = drivingApplications.filter(app => app.course_status === 'Completed').length || 0;
            const certificateRequests = drivingApplications.filter(app => app.certificate_requested).length || 0;
            const issuedCertificates = drivingApplications.filter(app => app.certificate_issued).length || 0;
            
            // Driving revenue: Tsh 20,000 per issued certificate
            const drivingRevenue = issuedCertificates * 20000;

            setDrivingStats({
                totalApplications,
                approvedApplications,
                completedCourses,
                certificateRequests,
                issuedCertificates,
                drivingRevenue,
                totalCourses: drivingCourses.length || 0,
            });
        } catch (error) {
            console.error('Failed to fetch driving applications for display:', error);
            // Set default values on error
            setDrivingStats({
                totalApplications: 0,
                approvedApplications: 0,
                completedCourses: 0,
                certificateRequests: 0,
                issuedCertificates: 0,
                drivingRevenue: 0,
                totalCourses: 0,
            });
        }
    }, [api, accessToken]);
    
    // 3. UseEffect to fetch the data on mount
    useEffect(() => {
        fetchConferenceRoomStats();
        fetchDrivingStats();
    }, [fetchConferenceRoomStats, fetchDrivingStats]);

    // Calculate percentages for circular displays
    const roomBookingCompletionRate = conferenceRoomStats.totalBookings > 0 
        ? Math.round((conferenceRoomStats.completedBookings / conferenceRoomStats.totalBookings) * 100) 
        : 0;
    
    const certReadyRate = safeStats.totalCertRequests > 0
        ? Math.round((safeStats.readyCertRequests / safeStats.totalCertRequests) * 100)
        : 0;

    const paidRegistrationRate = safeStats.totalRegistrations > 0
        ? Math.round((safeStats.paidRegistrations / safeStats.totalRegistrations) * 100)
        : 0;

    const drivingCompletionRate = drivingStats.totalApplications > 0
        ? Math.round((drivingStats.completedCourses / drivingStats.totalApplications) * 100)
        : 0;

    const handleGeneratePDF = async () => {
        await generatePDFReport({
            stats: safeStats,
            conferenceRoomStats,
            drivingStats,
            api,
            accessToken,
            setActionLoading,
            totalRevenue
        });
    };

    return (
        <div className="admin-stats-overview bg-gray-50 min-h-screen p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
                        <p className="text-gray-600 mt-2">Comprehensive dashboard with real-time statistics and insights</p>
                    </div>
                    <button
                        onClick={handleGeneratePDF}
                        disabled={actionLoading}
                        className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl"
                    >
                        {actionLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Report...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generate PDF Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="border-t border-gray-200 my-8"></div>

            {/* Core Metrics Grid */}
            <StatsGrid 
                safeStats={safeStats}
                conferenceRoomStats={conferenceRoomStats}
                drivingStats={drivingStats}
                totalRevenue={totalRevenue}
            />

            <div className="border-t border-gray-200 my-8"></div>

            {/* Performance Analytics */}
            <PerformanceAnalytics 
                roomBookingCompletionRate={roomBookingCompletionRate}
                conferenceRoomStats={conferenceRoomStats}
                certReadyRate={certReadyRate}
                safeStats={safeStats}
                paidRegistrationRate={paidRegistrationRate}
                drivingCompletionRate={drivingCompletionRate}
                drivingStats={drivingStats}
            />

            {/* Revenue Breakdown */}
            <RevenueBreakdown 
                safeStats={safeStats}
                conferenceRoomStats={conferenceRoomStats}
                drivingStats={drivingStats}
                totalRevenue={totalRevenue}
            />

            {/* Quick Stats Footer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">System Health Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{safeStats.totalCourses}</div>
                        <div className="text-gray-600">Active Courses</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{drivingStats.totalCourses}</div>
                        <div className="text-gray-600">Driving Courses</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{conferenceRoomStats.approvedBookings}</div>
                        <div className="text-gray-600">Active Bookings</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{safeStats.readyCertRequests}</div>
                        <div className="text-gray-600">Certificates Ready</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{drivingStats.issuedCertificates}</div>
                        <div className="text-gray-600">Driving Certificates</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-gray-900">{safeStats.teachers}</div>
                        <div className="text-gray-600">Active Teachers</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStatsOverview;