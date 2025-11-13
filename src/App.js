import React, { useState, useEffect, useCallback } from "react";
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  CircularProgress,
  Box,
  Container,
  Alert,
  Snackbar,
  Button 
} from "@mui/material";
import LoginAndRegisterForm from "./components/LoginAndRegisterForm";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import EngineeringDashboard from "./components/Driving/EngineeringDashboard";
import ICEDashboard from "./components/departments/ICEDashboard";
import LanguageStudiesDashboard from "./components/LanguageStudies/LanguageStudiesDashboard";
import api from "./api";

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

// User roles configuration
const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  ENGINEERING_STAFF: 'engineering_staff',
  ICE_STAFF: 'ice_staff',
  LANGUAGE_STAFF: 'language_staff'
};

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // Data states
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [conferenceRooms, setConferenceRooms] = useState([]);
    const [roomBookings, setRoomBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Show snackbar notification
    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

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
                setIsDataLoaded(false);
                showSnackbar(response.message || "Login successful!", "success");
            } else {
                showSnackbar(response.detail || "Login failed. Please check your credentials.", "error");
            }
        } catch (error) {
            console.error("Login error:", error);
            showSnackbar("Login failed due to a network or server issue.", "error");
        }
    };

    const handleRegister = async (userData) => {
        try {
            const response = await api.register(userData);
            if (response.success) {
                showSnackbar("Registration successful! Please log in.", "success");
                setIsRegistering(false);
            } else {
                showSnackbar(response.message || "Registration failed.", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showSnackbar("Registration failed due to a network or server issue.", "error");
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
        setConferenceRooms([]);
        setRoomBookings([]);
        setIsDataLoaded(false);
        showSnackbar("You have been logged out.", "info");
    };

    // --- Centralized Data Loader ---
    useEffect(() => {
        const fetchDataForUser = async () => {
            if (!currentUser || !token || isDataLoaded) return;
            setLoadingData(true);
            try {
                switch (currentUser.role) {
                    case USER_ROLES.STUDENT:
                        const [allCourses, myRegistrations, allRooms, myBookings] = await Promise.all([
                            api.getAllCourses(token),
                            api.getMyRegistrations(token, currentUser.id),
                            api.getConferenceRooms(token),
                            api.getMyRoomBookings(token)
                        ]);
                        
                        setCourses(Array.isArray(allCourses) ? allCourses : []);
                        setEnrollments(Array.isArray(myRegistrations) ? myRegistrations : []);
                        setConferenceRooms(Array.isArray(allRooms) ? allRooms : []);
                        setRoomBookings(Array.isArray(myBookings) ? myBookings : []);
                        break;
                    
                    case USER_ROLES.TEACHER:
                        const teacherCourses = await api.getTeacherCourses(token);
                        setCourses(Array.isArray(teacherCourses) ? teacherCourses : []);
                        break;
                    
                    case USER_ROLES.ADMIN:
                        const [allUsers, allRegistrations, allRoomBookings] = await Promise.all([
                            api.getAdminAllUsers(token),
                            api.getAdminAllRegistrations(token),
                            api.getAdminAllBookings(token)
                        ]);
                        
                        setUsers(Array.isArray(allUsers) ? allUsers : []);
                        setEnrollments(Array.isArray(allRegistrations) ? allRegistrations : []);
                        setRoomBookings(Array.isArray(allRoomBookings) ? allRoomBookings : []);
                        break;
                    
                   case USER_ROLES.ENGINEERING_STAFF:
    
    const engineeringCourses = await api.getCoursesByDepartment(token, 'engineering');
    setCourses(Array.isArray(engineeringCourses) ? engineeringCourses : []);
    setEnrollments([]);
    break;
                    
                    case USER_ROLES.ICE_STAFF:
                        // ICE staff sees short courses and related data
                        const [iceCourses, iceRegistrations] = await Promise.all([
                            api.getCoursesByDepartment(token, 'ice'),
                            api.getRegistrationsByDepartment(token, 'ice')
                        ]);
                        setCourses(Array.isArray(iceCourses) ? iceCourses : []);
                        setEnrollments(Array.isArray(iceRegistrations) ? iceRegistrations : []);
                        break;
                    
                    case USER_ROLES.LANGUAGE_STAFF:
                        // Language staff sees certificate applications and language courses
                        const [languageCourses, certificateApplications] = await Promise.all([
                            api.getCoursesByDepartment(token, 'language'),
                            api.getCertificateApplications(token)
                        ]);
                        setCourses(Array.isArray(languageCourses) ? languageCourses : []);
                        // Store certificate applications in enrollments for now
                        setEnrollments(Array.isArray(certificateApplications) ? certificateApplications : []);
                        break;
                    
                    default:
                        console.error("Unrecognized user role:", currentUser.role);
                        break;
                }
                setIsDataLoaded(true);
            } catch (error) {
                console.error("Failed to load user-specific data:", error);
                showSnackbar("Failed to load dashboard data. Your session may have expired.", "error");
                handleLogout();
            } finally {
                setLoadingData(false);
            }
        };

        if (currentUser && token) {
            fetchDataForUser();
        }
    }, [currentUser, token, isDataLoaded]);

    const handleRegisterCourse = async (courseId, selectedSchedule, selectedLevel) => {
        if (!token || !currentUser || currentUser.role !== USER_ROLES.STUDENT) {
            showSnackbar("You must be logged in as a student to register for a course.", "error");
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
                showSnackbar(`Successfully registered for course: ${newRegistration.course_name}!`, "success");
                const myRegistrations = await api.getMyRegistrations(token, currentUser.id);
                setEnrollments(Array.isArray(myRegistrations) ? myRegistrations : []);
            } else {
                showSnackbar(newRegistration.detail || "Registration failed. Please try again.", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showSnackbar(`Registration failed. Error: ${error.message}`, "error");
        } finally {
            setLoadingData(false);
        }
    };

    // Get dashboard title based on user role
    const getDashboardTitle = () => {
        const roleTitles = {
            [USER_ROLES.ADMIN]: "Admin Dashboard",
            [USER_ROLES.TEACHER]: "Teacher Dashboard",
            [USER_ROLES.STUDENT]: "Student Dashboard",
            [USER_ROLES.ENGINEERING_STAFF]: "Engineering Department - Driving Courses",
            [USER_ROLES.ICE_STAFF]: "ICE Department - Short Courses",
            [USER_ROLES.LANGUAGE_STAFF]: "Language Studies - English Certificates"
        };
        return roleTitles[currentUser?.role] || "Dashboard";
    };

    // --- RENDER DASHBOARD BASED ON ROLE ---
    const renderDashboard = () => {
        if (loadingAuth || loadingData) {
            return (
                <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    minHeight="100vh"
                >
                    <CircularProgress size={60} />
                </Box>
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

        const commonProps = {
            user: currentUser,
            accessToken: token,
            onLogout: handleLogout,
            activeTab,
            setActiveTab,
            showSnackbar,
            dashboardTitle: getDashboardTitle(),
            userRole: currentUser.role
        };

        switch (currentUser.role) {
            case USER_ROLES.STUDENT:
                return (
                    <StudentDashboard
                        {...commonProps}
                        courses={courses}
                        enrollments={enrollments}
                        onRegisterCourse={handleRegisterCourse}
                        conferenceRooms={conferenceRooms}
                        roomBookings={roomBookings}
                    />
                );

            case USER_ROLES.TEACHER:
                return (
                    <TeacherDashboard
                        {...commonProps}
                        courses={courses}
                        enrollments={enrollments}
                        users={users}
                    />
                );

            case USER_ROLES.ADMIN:
                return (
                    <AdminDashboard
                        {...commonProps}
                        users={users}
                        enrollments={enrollments}
                        courses={courses}
                        roomBookings={roomBookings}
                    />
                );

            case USER_ROLES.ENGINEERING_STAFF:
                return (
                    <EngineeringDashboard
                        {...commonProps}
                        courses={courses}
                        enrollments={enrollments}
                        conferenceRooms={conferenceRooms}
                        roomBookings={roomBookings}
                    />
                );

            case USER_ROLES.ICE_STAFF:
                return (
                    <ICEDashboard
                        {...commonProps}
                        courses={courses}
                        enrollments={enrollments}
                        conferenceRooms={conferenceRooms}
                        roomBookings={roomBookings}
                    />
                );

            case USER_ROLES.LANGUAGE_STAFF:
                return (
                    <LanguageStudiesDashboard
                        {...commonProps}
                        courses={courses}
                        enrollments={enrollments} // This contains certificate applications for language staff
                        conferenceRooms={conferenceRooms}
                        roomBookings={roomBookings}
                    />
                );

            default:
                return (
                    <Container maxWidth="md">
                        <Box textAlign="center" mt={4}>
                            <Alert severity="error">Error: User role "{currentUser.role}" not recognized.</Alert>
                            <Button 
                                variant="contained" 
                                onClick={handleLogout}
                                sx={{ mt: 2 }}
                            >
                                Logout
                            </Button>
                        </Box>
                    </Container>
                );
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box className="min-h-screen bg-gray-100 font-sans text-gray-800">
                {renderDashboard()}
                
                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleCloseSnackbar} 
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default App;