// components/cards/TeacherCourseCard.js
import React from 'react';

export const TeacherCourseCard = ({ course, onViewRegistrations, showCourseName = false, className = "" }) => (
  <div className={`bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${className}`}>
    <div className="p-4 lg:p-6">
      <h3 className="text-lg lg:text-xl font-bold text-indigo-700 mb-2">
        {showCourseName ? (course.course_name || course.title) : (course.course_id || course.id)}
      </h3>
      <p className="text-xs lg:text-sm text-gray-500 mb-4">
        Instructor: {course.instructor_name || course.teacherName}
      </p>
      <div className="space-y-2 mb-4">
        <p className="text-gray-600 text-xs lg:text-sm">
          Duration: <span className="font-medium">{course.course_duration || course.duration}</span>
        </p>
        <p className="text-gray-800 font-bold text-xs lg:text-sm">
          Price: <span className="text-indigo-600">Tsh {course.course_price || course.price}</span>
        </p>
      </div>
      <button
        onClick={onViewRegistrations}
        className="w-full bg-indigo-600 text-white py-2 lg:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg text-sm lg:text-base"
      >
        View Registrations ({course.registrationCount || 0})
      </button>
    </div>
  </div>
);