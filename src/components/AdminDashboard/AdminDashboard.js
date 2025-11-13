// src/components/AdminDashboard/AdminDashboard.js (Main File)
import React, { useState, useEffect } from 'react';
import RegistrationManagementTable from '../admin/RegistrationManagementTable';
import UserManagementTable from '../admin/UserManagementTable';
import AdminStatsOverview from '../admin/AdminStatsOverview';
import CertificateRequestTable from '../admin/CertificateRequestTable';
import { Sidebar, Header } from '../UIComponents';
import AdminConferenceRooms from '../admin/AdminConferenceRooms';
import { DrivingApplicationsTable } from '../Driving/DrivingApplicationsTable';
import useAdminDashboardData from './useAdminDashboardData'; 
import SuccessNotification from '../AdminDashboard/SuccessNotification'; 
import api from '../../api'; 

const AdminDashboard = ({ user, accessToken, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Use the custom hook to manage state, data fetching, and actions
    const {
        users,
        registrations,
        courses,
        loading,
        actionLoading,
        statusFilter,
        setStatusFilter,
        certificateRequests,
        drivingApplications,
        drivingCourses,
        error,
        setError,
        successMessage,
        stats,
        filteredRegistrations,
        fetchCertificateRequests,
        fetchDrivingApplications,
        fetchDrivingCourses,
        handleAssignRegistrationControlNumber,
        handleAssignCertificateControlNumber,
        handleStartCourse,
        handleCompleteCourse,
        handleApproveCertificateRequest,
        handleRequestCertificate,
        handleUpdatePaymentStatus,
        handleUpdateControlNo,
        handleRoleChange,
        handleUpdateCertificateStatus,
        handleIssueCertificate,
        handleSetCertificateControlNumber,
        handleRetry,
    } = useAdminDashboardData(accessToken);

    // Refresh data when tab changes (kept in main file to update activeTab state)
    useEffect(() => {
        if (accessToken) {
            switch (activeTab) {
                case 'certificateRequests':
                    fetchCertificateRequests();
                    break;
                case 'drivingApplications':
                    fetchDrivingApplications();
                    fetchDrivingCourses();
                    break;
                default:
                    break;
            }
        }
    }, [activeTab, accessToken, fetchCertificateRequests, fetchDrivingApplications, fetchDrivingCourses]);

    const sidebarLinks = [
        { name: 'System Overview', id: 'overview' },
        { name: 'Registration Management', id: 'registrations' },
        { name: 'User Management', id: 'users' },
        { name: 'Certificate Requests', id: 'certificateRequests' },
        { name: 'Driving Applications', id: 'drivingApplications' },
        { name: 'Conference Rooms', id: 'conference-rooms' },
    ];

    // --- Render Content Logic ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-full min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                        <p className="mt-2 text-xs text-gray-500">Checking authentication and fetching data...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex justify-center items-center h-full min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Data</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Retry Loading Data
                        </button>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <AdminStatsOverview
                        stats={stats}
                        registrations={registrations}
                        accessToken={accessToken}
                        api={api}
                        actionLoading={actionLoading}
                        setActionLoading={setError} // Pass a setter from the hook or just use the actionLoading from the hook
                    />
                );

            case 'registrations':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Management</h2>
                        <div className="mb-4 flex space-x-4 items-center">
                            <label htmlFor="statusFilter" className="text-gray-600 font-medium">Filter by Status:</label>
                            <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={actionLoading}
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {actionLoading && (
                                <span className="text-indigo-600 text-sm flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                                    Updating...
                                </span>
                            )}
                        </div>
                        <RegistrationManagementTable
                            registrations={filteredRegistrations}
                            onUpdateStatus={handleUpdatePaymentStatus}
                            onUpdateControlNo={handleUpdateControlNo}
                            loading={actionLoading}
                        />
                    </div>
                );

            case 'users':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">User Management</h2>
                        <UserManagementTable
                            users={users}
                            onRoleChange={handleRoleChange}
                            loading={actionLoading}
                        />
                    </div>
                );

            case 'certificateRequests':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Language Certificate Request Management</h2>
                        <CertificateRequestTable
                            requests={certificateRequests}
                            onUpdateStatus={handleUpdateCertificateStatus}
                            onIssueCertificate={handleIssueCertificate}
                            onSetControlNumber={handleSetCertificateControlNumber}
                            loading={actionLoading}
                        />
                    </div>
                );

            case 'drivingApplications':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Driving Applications Management</h2>
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-700">Total Applications</h3>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalDrivingApplications}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-700">Approved</h3>
                                <p className="text-2xl font-bold text-green-600">{stats.approvedDrivingApplications}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-700">Cert. Requests</h3>
                                <p className="text-2xl font-bold text-orange-600">{stats.drivingCertificateRequests}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-700">Cert. Issued</h3>
                                <p className="text-2xl font-bold text-purple-600">{stats.issuedDrivingCertificates}</p>
                            </div>
                        </div>

                        {/* Admin/Head of Engineering Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Admin/Head of Engineering Management Roles</h3>
                            <ul className="text-blue-700 text-sm mt-2 list-disc list-inside space-y-1">
                                <li><strong className="text-blue-900">Admin Role:</strong> Responsible for manually assigning **Registration** (Tsh 150,000) and **Certificate** (Tsh 20,000) Control Numbers.</li>
                                <li><strong className="text-blue-900">Head of Engineering/Teacher Role:</strong> Responsible for manually marking the **Course Status** (Not Started, Started, Completed) after payment is confirmed.</li>
                                <li><strong className="text-blue-900">Student Role:</strong> Can request certificates after course completion.</li>
                                <li>Actions are restricted based on the current user's role: **{user?.role?.toUpperCase() || 'UNKNOWN'}**</li>
                            </ul>
                        </div>

                        <DrivingApplicationsTable
                            applications={drivingApplications}
                            onAssignRegistrationControlNumber={handleAssignRegistrationControlNumber}
                            onAssignCertificateControlNumber={handleAssignCertificateControlNumber}
                            onStartCourse={handleStartCourse}
                            onCompleteCourse={handleCompleteCourse}
                            onRequestCertificate={handleRequestCertificate}
                            onApproveCertificateRequest={handleApproveCertificateRequest}
                            onIssueCertificate={handleIssueCertificate}
                            loading={actionLoading}
                            userRole={user.role}
                        />
                    </div>
                );

            case 'conference-rooms':
                return (
                    <AdminConferenceRooms accessToken={accessToken} api={api} />
                );

            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Select a tab from the sidebar to manage system data.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                links={sidebarLinks}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={user.role}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={onLogout} title="Admin Dashboard" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
            <SuccessNotification successMessage={successMessage} />
        </div>
    );
};

export default AdminDashboard;