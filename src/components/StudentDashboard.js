import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from './UIComponents';
import api from '../api';

// Course Card Component with teacher name
const CourseCard = ({ course, onAction, actionText }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="p-6">
                <h3 className="text-xl font-bold text-indigo-700 mb-2">{course.course_name}</h3>
                <p className="text-sm text-gray-500 mb-4">Instructor: {course.instructor_name || 'TBA'}</p>
                <p className="text-gray-600 mb-2">Duration: {course.course_duration}</p>
                <p className="text-gray-800 font-bold mb-4">Price: Tsh{course.course_price}</p>
                <button
                    onClick={onAction}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                    {actionText}
                </button>
            </div>
        </div>
    );
};

// Course Registration Modal Component
const CourseRegistrationModal = ({ course, user, onClose, onRegister, isLoading }) => {
    const [formData, setFormData] = useState({
        selected_schedule: '',
        selected_level: 'Beginner',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.selected_schedule.trim()) {
            alert('Please select a schedule');
            return;
        }
        if (!formData.selected_level.trim()) {
            alert('Please select a level');
            return;
        }

        const registrationData = {
            course_id: course.course_id, // Use course_id (string) not id (integer)
            selected_schedule: formData.selected_schedule,
            selected_level: formData.selected_level,
        };

        onRegister(registrationData);
    };

    const scheduleOptions = [
        'Monday & Wednesday 6-8 PM',
        'Tuesday & Thursday 7-9 PM',
        'Saturday 10 AM - 12 PM',
        'Sunday 2-4 PM',
        'Monday to Friday 5-6 PM',
        'Weekend Intensive'
    ];

    const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-indigo-700">Register for Course</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                            disabled={isLoading}
                        >
                            ×
                        </button>
                    </div>

                    {/* Course Details */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">{course.course_name}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Instructor:</strong> {course.instructor_name || 'TBA'}</p>
                            <p><strong>Duration:</strong> {course.course_duration}</p>
                            <p><strong>Price:</strong> Tsh{course.course_price}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Schedule Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Schedule *
                            </label>
                            <select
                                name="selected_schedule"
                                value={formData.selected_schedule}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                                disabled={isLoading}
                            >
                                <option value="">Select a schedule</option>
                                {scheduleOptions.map(schedule => (
                                    <option key={schedule} value={schedule}>{schedule}</option>
                                ))}
                            </select>
                        </div>

                        {/* Level Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Level *
                            </label>
                            <select
                                name="selected_level"
                                value={formData.selected_level}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                                disabled={isLoading}
                            >
                                {levelOptions.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Student Info Display */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2">Your Information</h4>
                            <p className="text-sm text-gray-600">
                                <strong>Name:</strong> {user.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Email:</strong> {user.email}
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                                    isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                }`}
                            >
                                {isLoading ? 'Registering...' : 'Register Now'}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Student Dashboard Component
const StudentDashboard = ({ user, accessToken, onLogout }) => {
    const [activeTab, setActiveTab] = useState('allCourses');
    const [courses, setCourses] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedCourseForRegistration, setSelectedCourseForRegistration] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);

    // Fetch all courses
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const coursesResult = await api.getAllCourses(accessToken);
            setCourses(Array.isArray(coursesResult) ? coursesResult : []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            alert("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRegistrations = async () => {
        if (!user || !user.id) return;
        setLoadingRegistrations(true);
        try {
            const registrationsResult = await api.getMyRegistrations(accessToken, user.id);
            setMyRegistrations(Array.isArray(registrationsResult) ? registrationsResult : []);
        } catch (error) {
            console.error("Failed to fetch my registrations:", error);
            alert("Failed to load your registrations.");
        } finally {
            setLoadingRegistrations(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [accessToken]);

    useEffect(() => {
        if (user && user.id && activeTab === 'myRegistrations') {
            fetchMyRegistrations();
        }
    }, [user, accessToken, activeTab]);

    const handleRegisterClick = (course) => {
        setSelectedCourseForRegistration(course);
        setShowRegistrationModal(true);
    };

    const handleCloseRegistrationModal = () => {
        setShowRegistrationModal(false);
        setSelectedCourseForRegistration(null);
    };

    const handleRegisterForCourse = async (registrationData) => {
        setIsRegistering(true);
        try {
            const result = await api.registerForCourse(accessToken, registrationData);
            if (result && result.id) {
                alert(`Successfully registered for ${result.course_name}!`);
                fetchMyRegistrations();
                handleCloseRegistrationModal();
            } else {
                alert(`Registration failed: ${result.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Registration API Error:", error);
            if (error.response && error.response.data && error.response.data.detail) {
                alert(`Registration failed: ${JSON.stringify(error.response.data.detail)}`);
            } else {
                alert("Registration failed. Please try again.");
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const sidebarLinks = [
        { name: 'All Courses', id: 'allCourses' },
        { name: 'My Registrations', id: 'myRegistrations' },
    ];

    const renderContent = () => {
        const hasCourses = Array.isArray(courses) && courses.length > 0;

        switch (activeTab) {
            case 'allCourses':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Available Courses</h2>
                        {loading ? (
                            <p className="text-center text-gray-500">Loading courses...</p>
                        ) : hasCourses ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <CourseCard
                                        key={course.course_id}
                                        course={course}
                                        onAction={() => handleRegisterClick(course)}
                                        actionText="Register"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📚</div>
                                <p className="text-gray-600 text-lg">No courses available at the moment.</p>
                            </div>
                        )}
                    </div>
                );
            case 'myRegistrations':
                return (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-indigo-700 mb-6">My Course Registrations</h2>
                        {loadingRegistrations ? (
                            <p className="text-center text-gray-500">Loading registrations...</p>
                        ) : myRegistrations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Instructor
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Schedule
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Level
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Control No.
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {myRegistrations.map(reg => (
                                            <tr key={reg.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {reg.course_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {reg.instructor_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {reg.selected_schedule}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {reg.selected_level}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    Tsh{reg.course_price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        reg.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                            reg.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                                                        {reg.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {reg.control_no || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📝</div>
                                <p className="text-gray-600 text-lg">You haven't registered for any courses yet.</p>
                                <button
                                    onClick={() => setActiveTab('allCourses')}
                                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    Browse Courses
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar links={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 p-8">
                <Header user={user} onLogout={onLogout} title="Student Dashboard" />
                {renderContent()}
            </div>
            {showRegistrationModal && (
                <CourseRegistrationModal
                    course={selectedCourseForRegistration}
                    user={user}
                    onClose={handleCloseRegistrationModal}
                    onRegister={handleRegisterForCourse}
                    isLoading={isRegistering}
                />
            )}
        </div>
    );
};

export default StudentDashboard;