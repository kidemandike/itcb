import React, { useState, useEffect, useCallback } from "react";
import LoginAndRegisterForm from "./components/LoginAndRegisterForm";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminDashboard from "./components/AdminDashboard";
import api from "./api"; // Your backend API helper

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Data states
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [controlNumbers, setControlNumbers] = useState({});
    const [payments, setPayments] = useState({});
    const [approvals, setApprovals] = useState({});

    // --- Initial Authentication Check on App Load ---
    useEffect(() => {
        const checkAuthStatus = () => {
            const storedToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    setToken(storedToken);
                    setCurrentUser(user);
                } catch (e) {
                    console.error("Failed to parse user data from localStorage:", e);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                }
            }
            setLoadingAuth(false);
        };

        checkAuthStatus();
    }, []);

    // --- AUTH ---
    const handleLogin = async (email, password) => {
        try {
            const response = await api.login(email, password);

            if (response && response.access_token && response.user) {
                localStorage.setItem('accessToken', response.access_token);
                localStorage.setItem('user', JSON.stringify(response.user));

                setToken(response.access_token);
                setCurrentUser(response.user);
                setIsDataLoaded(false); // Reset the flag on successful login to force data reload
                alert(response.message || "Login successful!");
            } else {
                alert(response.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed due to a network or server issue.");
        }
    };

    const handleRegister = async (userData) => {
        try {
            const response = await api.register(userData);

            if (response.success) {
                alert("Registration successful! Please log in.");
                setIsRegistering(false);
            } else {
                alert(response.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed due to a network or server issue.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        setCurrentUser(null);
        setToken(null);
        setUsers([]);
        setCourses([]);
        setEnrollments([]);
        setControlNumbers({});
        setPayments({});
        setApprovals({});
        setIsDataLoaded(false); // Reset the flag on logout
        alert("You have been logged out.");
    };

    const handleRegisterCourse = async (courseId, selectedSchedule, selectedLevel) => {
        if (!token || !currentUser || currentUser.role !== "student") {
            alert("You must be logged in as a student to register for a course.");
            return;
        }

        setLoadingData(true);
        try {
            const registrationData = {
                course_id: courseId,
                selected_schedule: selectedSchedule,
                selected_level: selectedLevel,
            };
            const newRegistration = await api.registerForCourse(token, registrationData);
            if (newRegistration && newRegistration.id) {
                alert(`Successfully registered for course: ${newRegistration.course_name}!`);
                // Refetch enrollments to update the dashboard immediately
                const myRegistrations = await api.getMyRegistrations(token, currentUser.id);
                setEnrollments(Array.isArray(myRegistrations) ? myRegistrations : []);
            } else {
                alert(newRegistration.detail || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert(`Registration failed. Error: ${error.message}`);
        } finally {
            setLoadingData(false);
        }
    };


    // --- Centralized Data Loader ---
    useEffect(() => {
        const fetchDataForUser = async () => {
            // Only fetch if a user is logged in AND data has not been loaded yet
            if (!currentUser || !token || isDataLoaded) return;

            setLoadingData(true);
            try {
                switch (currentUser.role) {
                    case "student":
                        const allCourses = await api.getAllCourses(token);
                        const myRegistrations = await api.getMyRegistrations(token, currentUser.id);

                        setCourses(Array.isArray(allCourses) ? allCourses : []);
                        setEnrollments(Array.isArray(myRegistrations) ? myRegistrations : []);
                        break;

                    case "teacher":
                        const teacherCourses = await api.getTeacherCourses(token);
                        setCourses(Array.isArray(teacherCourses) ? teacherCourses : []);
                        break;

                    case "admin":
                        const allUsers = await api.getAdminAllUsers(token);
                        const allRegistrations = await api.getAdminAllRegistrations(token);
                        setUsers(Array.isArray(allUsers) ? allUsers : []);
                        setEnrollments(Array.isArray(allRegistrations) ? allRegistrations : []);
                        break;

                    default:
                        console.error("Unrecognized user role:", currentUser.role);
                        break;
                }
                setIsDataLoaded(true); // Set the flag to true after successful fetch
            } catch (error) {
                console.error("Failed to load user-specific data:", error);
                alert("Failed to load dashboard data. Your session may have expired.");
                handleLogout();
            } finally {
                setLoadingData(false);
            }
        };

        if (currentUser && token) {
            fetchDataForUser();
        }
    }, [currentUser, token, isDataLoaded]);

    // --- RENDER DASHBOARD BASED ON ROLE ---
    const renderDashboard = () => {
        if (loadingAuth || loadingData) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <p className="text-xl text-indigo-700">Loading application...</p>
                </div>
            );
        }

        if (!currentUser) {
            return (
                <LoginAndRegisterForm
                    isRegistering={isRegistering}
                    setIsRegistering={setIsRegistering}
                    handleLogin={handleLogin}
                    handleRegister={handleRegister}
                />
            );
        }

        switch (currentUser.role) {
            case "student":
                return (
                    <StudentDashboard
                        user={currentUser}
                        accessToken={token}
                        onLogout={handleLogout}
                        courses={courses}
                        enrollments={enrollments}
                        onRegisterCourse={handleRegisterCourse}
                    />
                );

            case "teacher":
                return (
                    <TeacherDashboard
                        user={currentUser}
                        accessToken={token}
                        onLogout={handleLogout}
                        courses={courses}
                        enrollments={enrollments}
                        users={users}
                    />
                );

            case "admin":
                return (
                    <AdminDashboard
                        user={currentUser}
                        accessToken={token}
                        onLogout={handleLogout}
                        users={users}
                        enrollments={enrollments}
                        courses={courses}
                    />
                );

            default:
                return (
                    <div className="flex items-center justify-center h-screen">
                        <h1>Error: User role not recognized.</h1>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            {renderDashboard()}
        </div>
    );
};

export default App;