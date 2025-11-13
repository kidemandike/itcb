import React from 'react';

const RevenueBreakdown = ({ safeStats, conferenceRoomStats, drivingStats, totalRevenue }) => {
    return (
        <div className="mb-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-orange-100 text-orange-800 p-2 rounded-lg mr-3">💰</span>
                Revenue Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">COURSE REVENUE</span>
                        <span className="text-2xl">📚</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">Tsh {safeStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm opacity-90">From course registrations</p>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">ROOM REVENUE</span>
                        <span className="text-2xl">🏨</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">Tsh {conferenceRoomStats.conferenceRevenue.toLocaleString()}</p>
                    <p className="text-sm opacity-90">From conference bookings</p>
                </div>

                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">DRIVING REVENUE</span>
                        <span className="text-2xl">🚗</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">Tsh {drivingStats.drivingRevenue.toLocaleString()}</p>
                    <p className="text-sm opacity-90">From driving certificates</p>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">TOTAL REVENUE</span>
                        <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">Tsh {totalRevenue.toLocaleString()}</p>
                    <p className="text-sm opacity-90">All revenue sources</p>
                </div>
            </div>
        </div>
    );
};

export default RevenueBreakdown;