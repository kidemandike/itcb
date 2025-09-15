// api.js

// Connect with .env file
const API_BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8000";

const api = {
    // --- Auth & User Management ---
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            console.log("Login API Response:", data);
            return data;
        } catch (error) {
            console.error("Login API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            console.log("Register API Response:", data);
            return data;
        } catch (error) {
            console.error("Register API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async getUserProfile(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            console.log("User Profile API Response:", data);
            return data;
        } catch (error) {
            console.error("User Profile API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    // --- Student Dashboard ---
    async getAllCourses(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch courses');
            }
            return response.json();
        } catch (error) {
            console.error("Get All Courses API Error:", error);
            return { detail: error.message || "Network error or server unavailable." };
        }
    },

    async getMyRegistrations(token, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/registrations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.json();
        } catch (error) {
            console.error("Get My Registrations API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async registerForCourse(token, registrationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // This header is correctly included here. The issue is likely
                    // on the client side, where this function is called with an invalid token or payload.
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(registrationData),
            });
            return response.json();
        } catch (error) {
            console.error("Register for Course API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },
    

    // --- Admin Dashboard ---
    async getAdminAllUsers(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.json();
        } catch (error) {
            console.error("Get Admin All Users API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async getAdminAllRegistrations(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/registrations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.json();
        } catch (error) {
            console.error("Get Admin All Registrations API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async updateRegistrationPaymentStatus(token, registrationId, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/registrations/${registrationId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ payment_status: status }),
            });
            return response.json();
        } catch (error) {
            console.error("Update Payment Status API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async updateRegistrationControlNo(token, registrationId, controlNo) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/registrations/${registrationId}/control_no`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ control_no: controlNo }),
            });
            return response.json();
        } catch (error) {
            console.error("Update Control No API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async updateUserRole(token, userId, role) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role }),
            });
            return response.json();
        } catch (error) {
            console.error("Update User Role API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    // --- Teacher Dashboard ---
    async getTeacherCourses(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/teacher/my-courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.json();
        } catch (error) {
            console.error("Get Teacher Courses API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    async getTeacherCourseRegistrations(token, courseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}/registrations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.json();
        } catch (error) {
            console.error("Get Teacher Course Registrations API Error:", error);
            return { detail: "Network error or server unavailable." };
        }
    },

    // --- Course Creation ---
    async createCourse(accessToken, courseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/teacher/courses/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(courseData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error('Course creation failed');
                error.response = { status: response.status, data: errorData };
                console.error("Backend Error Details:", errorData);
                throw error;
            }
            
            const data = await response.json();
            console.log("Create Course API Response:", data);
            return data;
        } catch (error) {
            console.error("Create Course API Error:", error);
            if (error.response) {
                console.error("Full Error Response from Backend:", error.response.data);
                throw error;
            }
            return { detail: "Network error or server unavailable." };
        }
    },
};

export default api;