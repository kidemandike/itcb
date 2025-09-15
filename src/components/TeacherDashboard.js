import React, { useState, useEffect } from 'react';
import { Sidebar, Header, TeacherCourseCard, StudentTable } from './UIComponents';
import api from '../api';

// Course Creation Form Component
const CourseCreationForm = ({ user, accessToken, onCourseCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        course_id: '',
        course_name: '',
        course_price: '',
        course_duration: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.course_id.trim()) {
            newErrors.course_id = 'Course ID is required';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.course_id)) {
            newErrors.course_id = 'Course ID can only contain letters, numbers, hyphens, and underscores';
        }

        if (!formData.course_name.trim()) {
            newErrors.course_name = 'Course name is required';
        }

        if (!formData.course_price) {
            newErrors.course_price = 'Course price is required';
        } else if (isNaN(formData.course_price) || parseFloat(formData.course_price) <= 0) {
            newErrors.course_price = 'Course price must be a positive number';
        }

        if (!formData.course_duration.trim()) {
            newErrors.course_duration = 'Course duration is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const courseData = {
                course_id: formData.course_id.trim(),
                course_name: formData.course_name.trim(),
                course_price: parseFloat(formData.course_price),
                course_duration: formData.course_duration.trim(),
                instructor_id: user.id,
                instructor_name: user.full_name
            };

            console.log("Sending course data:", courseData);
            
            await api.createCourse(accessToken, courseData);
            alert('Course created successfully!');
            onCourseCreated();
        } catch (error) {
            console.error('Failed to create course:', error);
            if (error.response && error.response.data && error.response.data.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    const apiErrors = {};
                    error.response.data.detail.forEach(err => {
                        if (err.loc && err.loc.length > 1) {
                            const fieldName = err.loc[1];
                            apiErrors[fieldName] = err.msg;
                        } else {
                            apiErrors._general = err.msg;
                        }
                    });
                    setErrors(apiErrors);
                    alert('Please correct the highlighted errors in the form.');
                } else if (typeof error.response.data.detail === 'string') {
                    if (error.response.data.detail.includes('course_id')) {
                        setErrors(prev => ({ ...prev, course_id: error.response.data.detail }));
                    } else if (error.response.data.detail.includes('course name')) {
                        setErrors(prev => ({ ...prev, course_name: error.response.data.detail }));
                    } else {
                        alert(`Failed to create course: ${error.response.data.detail}`);
                    }
                } else {
                    alert('Failed to create course: An unexpected error occurred from the server.');
                }
            } else {
                alert('Failed to create course. Please try again. (Network or unhandled error)');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-teal-700 mb-6">Create New Course</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-2">
                        Course ID *
                    </label>
                    <input
                        type="text"
                        id="course_id"
                        name="course_id"
                        value={formData.course_id}
                        onChange={handleInputChange}
                        placeholder="e.g., intro_python, web_dev_101"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.course_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                    />
                    {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
                    <p className="text-gray-500 text-sm mt-1">
                        Unique identifier for the course (letters, numbers, hyphens, and underscores only)
                    </p>
                </div>
                <div>
                    <label htmlFor="course_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name *
                    </label>
                    <input
                        type="text"
                        id="course_name"
                        name="course_name"
                        value={formData.course_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Introduction to Python Programming"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.course_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                    />
                    {errors.course_name && <p className="text-red-500 text-sm mt-1">{errors.course_name}</p>}
                </div>
                <div>
                    <label htmlFor="course_price" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Price (Tsh) *
                    </label>
                    <input
                        type="number"
                        id="course_price"
                        name="course_price"
                        value={formData.course_price}
                        onChange={handleInputChange}
                        placeholder="299.99"
                        step="0.01"
                        min="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.course_price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                    />
                    {errors.course_price && <p className="text-red-500 text-sm mt-1">{errors.course_price}</p>}
                </div>
                <div>
                    <label htmlFor="course_duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Duration *
                    </label>
                    <input
                        type="text"
                        id="course_duration"
                        name="course_duration"
                        value={formData.course_duration}
                        onChange={handleInputChange}
                        placeholder="e.g., 8 weeks, 12 weeks, 6 months"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.course_duration ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                    />
                    {errors.course_duration && <p className="text-red-500 text-sm mt-1">{errors.course_duration}</p>}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Instructor Information</h4>
                    <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {user.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {user.email}
                    </p>
                </div>
                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        }`}
                    >
                        {loading ? 'Creating Course...' : 'Create Course'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                         className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// Custom Student Table Component for Teacher Dashboard
const TeacherStudentTable = ({ registrations }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!registrations || registrations.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">👥</div>
                <p className="text-gray-600">No students have registered for this course yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Schedule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Status
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {registration.user_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {registration.user_email || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(registration.registration_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {registration.selected_schedule}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {registration.selected_level}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    registration.payment_status === 'Paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : registration.payment_status === 'Pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {registration.payment_status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Main Teacher Dashboard Component
const TeacherDashboard = ({ user, accessToken, onLogout }) => {
    const [activeTab, setActiveTab] = useState('myCourses');
    const [courses, setCourses] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesResult = await api.getTeacherCourses(accessToken);
                setCourses(Array.isArray(coursesResult) ? coursesResult : []);
            } catch (error) {
                console.error("Failed to fetch teacher courses:", error);
                alert("Failed to load your courses.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [accessToken]);

    const handleViewRegistrations = async (courseId) => {
        setLoadingRegistrations(true);
        try {
            const registrationsResult = await api.getTeacherCourseRegistrations(accessToken, courseId);
            setRegistrations(Array.isArray(registrationsResult) ? registrationsResult : []);
            setSelectedCourse(courses.find(c => c.id === courseId));
            setActiveTab('registrations');
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
            alert("Failed to load course registrations.");
        } finally {
            setLoadingRegistrations(false);
        }
    };

    const handleCourseCreated = () => {
        setActiveTab('myCourses');
        setLoading(true);
        const fetchCourses = async () => {
            try {
                const coursesResult = await api.getTeacherCourses(accessToken);
                setCourses(Array.isArray(coursesResult) ? coursesResult : []);
            } catch (error) {
                console.error("Failed to fetch teacher courses:", error);
                alert("Failed to load your courses.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    };

    const sidebarLinks = [
        { name: 'My Courses', id: 'myCourses' },
        { name: 'Create Course', id: 'createCourse' },
    ];

    const renderContent = () => {
        if (loading && activeTab !== 'createCourse') {
            return <p className="text-center text-gray-500">Loading courses...</p>;
        }

        switch (activeTab) {
            case 'myCourses':
                return (
                    <div>
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
                            <button
                                onClick={() => setActiveTab('createCourse')}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Create New Course
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.length > 0 ? (
                                courses.map(course => (
                                    <TeacherCourseCard
                                        key={course.id}
                                        course={course}
                                        onViewRegistrations={() => handleViewRegistrations(course.id)}
                                        showCourseName={true} // This prop will make the card show course name instead of ID
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                                    <p className="text-gray-600 text-lg mb-4">You haven't created any courses yet.</p>
                                    <button
                                        onClick={() => setActiveTab('createCourse')}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        Create Course
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'createCourse':
                return (
                    <div>
                        <CourseCreationForm
                            user={user}
                            accessToken={accessToken}
                            onCourseCreated={handleCourseCreated}
                            onCancel={() => setActiveTab('myCourses')}
                        />
                    </div>
                );

            case 'registrations':
                return (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-indigo-700 mb-2">
                                    Students for: {selectedCourse?.course_name}
                                </h3>
                                <p className="text-gray-600">
                                    Total Registrations: {registrations.length}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTab('myCourses')}
                                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                Back to Courses
                            </button>
                        </div>
                        
                        {loadingRegistrations ? (
                            <p className="text-center text-gray-500">Loading registrations...</p>
                        ) : (
                            <TeacherStudentTable registrations={registrations} />
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
                <Header user={user} onLogout={onLogout} title="Teacher Dashboard" />
                {renderContent()}
            </div>
        </div>
    );
};

export default TeacherDashboard;