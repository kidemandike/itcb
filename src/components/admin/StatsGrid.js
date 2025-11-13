import React from 'react';

const StatsGrid = ({ safeStats, conferenceRoomStats, drivingStats, totalRevenue }) => {
    return (
        <div className="mb-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">📈</span>
                Core System Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Total Revenue */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">TOTAL REVENUE</span>
                        <span className="text-orange-500 bg-orange-50 p-1 rounded-lg text-sm">💰</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{totalRevenue.toLocaleString()} Tsh</p>
                    <p className="text-xs text-orange-600 font-medium">All Revenue Sources</p>
                </div>

                {/* Total Users */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">TOTAL USERS</span>
                        <span className="text-indigo-500 bg-indigo-50 p-1 rounded-lg text-sm">👥</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{safeStats.totalUsers}</p>
                    <p className="text-xs text-indigo-600 font-medium">
                        Students: {safeStats.students}
                    </p>
                </div>

                {/* Total Registrations */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">REGISTRATIONS</span>
                        <span className="text-red-500 bg-red-50 p-1 rounded-lg text-sm">🎫</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{safeStats.totalRegistrations}</p>
                    <p className="text-xs text-red-600 font-medium">
                        Paid: {safeStats.paidRegistrations}
                    </p>
                </div>

                {/* Driving Applications */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-red-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">DRIVING APPS</span>
                        <span className="text-red-700 bg-red-50 p-1 rounded-lg text-sm">🚗</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{drivingStats.totalApplications}</p>
                    <p className="text-xs text-red-700 font-medium">
                        Approved: {drivingStats.approvedApplications}
                    </p>
                </div>

                {/* Room Bookings */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">ROOM BOOKINGS</span>
                        <span className="text-green-500 bg-green-50 p-1 rounded-lg text-sm">🏨</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{conferenceRoomStats.totalBookings}</p>
                    <p className="text-xs text-green-600 font-medium">
                        Approved: {conferenceRoomStats.approvedBookings}
                    </p>
                </div>

                {/* Certificate Requests */}
                <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">CERTIFICATES</span>
                        <span className="text-purple-500 bg-purple-50 p-1 rounded-lg text-sm">🏆</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{safeStats.totalCertRequests}</p>
                    <p className="text-xs text-purple-600 font-medium">
                        Ready: {safeStats.readyCertRequests}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;