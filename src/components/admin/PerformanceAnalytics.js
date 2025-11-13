import React from 'react';

const PerformanceAnalytics = ({
    roomBookingCompletionRate,
    conferenceRoomStats,
    certReadyRate,
    safeStats,
    paidRegistrationRate,
    drivingCompletionRate,
    drivingStats
}) => {
    return (
        <div className="mb-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-3">📊</span>
                Performance Analytics
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Room Booking Completion */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-green-700 flex items-center">
                        <span className="bg-green-100 p-2 rounded-lg mr-3">🏨</span>
                        Room Booking Completion
                    </h4>
                    
                    <div className="relative flex items-center justify-center">
                        <div className="flex items-center justify-center h-32 w-32 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="3"
                                    strokeDasharray={`${roomBookingCompletionRate}, 100`}
                                />
                                <text x="18" y="20.5" textAnchor="middle" fill="#10B981" fontSize="8" fontWeight="bold">
                                    {roomBookingCompletionRate}%
                                </text>
                            </svg>
                        </div>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {conferenceRoomStats.completedBookings} completed out of {conferenceRoomStats.totalBookings} total bookings
                        </p>
                    </div>
                </div>

                {/* Certificate Ready Rate */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-purple-700 flex items-center">
                        <span className="bg-purple-100 p-2 rounded-lg mr-3">🏆</span>
                        Certificate Ready Rate
                    </h4>
                    
                    <div className="relative flex items-center justify-center">
                        <div className="flex items-center justify-center h-32 w-32 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#9333EA"
                                    strokeWidth="3"
                                    strokeDasharray={`${certReadyRate}, 100`}
                                />
                                <text x="18" y="20.5" textAnchor="middle" fill="#9333EA" fontSize="8" fontWeight="bold">
                                    {certReadyRate}%
                                </text>
                            </svg>
                        </div>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {safeStats.readyCertRequests} ready out of {safeStats.totalCertRequests} total requests
                        </p>
                    </div>
                </div>

                {/* Registration Status */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-blue-700 flex items-center">
                        <span className="bg-blue-100 p-2 rounded-lg mr-3">📈</span>
                        Registration Status
                    </h4>
                    
                    <div className="relative flex items-center justify-center">
                        <div className="flex items-center justify-center h-32 w-32 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="3"
                                    strokeDasharray={`${paidRegistrationRate}, 100`}
                                />
                                <text x="18" y="20.5" textAnchor="middle" fill="#3B82F6" fontSize="8" fontWeight="bold">
                                    {paidRegistrationRate}%
                                </text>
                            </svg>
                        </div>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {safeStats.paidRegistrations} paid registrations
                        </p>
                    </div>
                </div>

                {/* Driving Course Completion */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-red-700 flex items-center">
                        <span className="bg-red-100 p-2 rounded-lg mr-3">🚗</span>
                        Driving Course Completion
                    </h4>
                    
                    <div className="relative flex items-center justify-center">
                        <div className="flex items-center justify-center h-32 w-32 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#8B0000"
                                    strokeWidth="3"
                                    strokeDasharray={`${drivingCompletionRate}, 100`}
                                />
                                <text x="18" y="20.5" textAnchor="middle" fill="#8B0000" fontSize="8" fontWeight="bold">
                                    {drivingCompletionRate}%
                                </text>
                            </svg>
                        </div>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {drivingStats.completedCourses} completed out of {drivingStats.totalApplications} applications
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;