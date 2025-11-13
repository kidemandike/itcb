// components/cards/CourseCard.js
import React from 'react';

export const CourseCard = ({ course, onAction, actionText, status, className = "" }) => (
  <div className={`bg-gradient-to-br from-white to-green-50 border border-green-200 p-4 lg:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col justify-between ${className}`}>
    <div>
      <h4 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
        {course.title || course.course_name}
      </h4>
      <p className="text-gray-700 mb-3 leading-relaxed text-sm lg:text-base">
        {course.description || course.course_description}
      </p>
      <div className="space-y-1 text-xs lg:text-sm">
        <p className="text-green-600 font-medium">
          Instructor: <span className="text-gray-700">{course.teacherName || course.instructor_name}</span>
        </p>
        {course.duration && (
          <p className="text-gray-600">
            Duration: <span className="font-medium">{course.duration}</span>
          </p>
        )}
        {course.price && (
          <p className="text-gray-800 font-bold">
            Price: <span className="text-green-600">Tsh {course.price}</span>
          </p>
        )}
        {course.department && (
          <p className="text-gray-600">
            Department: <span className={`font-semibold ${
              course.department === 'Engineering' ? 'text-blue-600' :
              course.department === 'ICE' ? 'text-orange-600' :
              'text-indigo-600'
            }`}>{course.department}</span>
          </p>
        )}
      </div>
    </div>
    
    {status && (
      <div className="mt-4 space-y-2">
        <span className={`font-semibold text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full inline-block ${
          status.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Payment: {status.payment ? 'Paid' : 'Pending'}
        </span>
        <br />
        <span className={`font-semibold text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full inline-block ${
          status.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Approval: {status.approved ? 'Approved' : 'Pending'}
        </span>
      </div>
    )}
    
    {onAction && actionText && (
      <button
        onClick={onAction}
        className="mt-4 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm lg:text-base"
      >
        {actionText}
      </button>
    )}
  </div>
);