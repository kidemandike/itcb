// src/api/teacher.js - Teacher Dashboard Endpoints

import { fetchApi } from './core';

const teacherApi = {
    // --- Teacher Dashboard ---
    getTeacherCourses: (token) => fetchApi("/teacher/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    getTeacherCourseRegistrations: (token, courseId) => fetchApi(`/teacher/courses/${courseId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    createCourse: (token, courseData) => fetchApi("/teacher/courses/", {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseData)
    }),
};

export default teacherApi;