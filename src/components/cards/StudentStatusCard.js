// components/cards/StudentStatusCard.js
import React from 'react';

export const StudentStatusCard = ({ student, course, paymentStatus, approvalStatus, onApprove, className = "" }) => (
  <div className={`bg-gradient-to-br from-white to-green-50 border border-green-200 p-4 lg:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col justify-between ${className}`}>
    <div>
      <h4 className="text-base lg:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
        {`${student.firstName || student.first_name} ${student.lastName || student.last_name}`}
      </h4>
      <p className="text-gray-600 text-xs lg:text-sm mb-2">{student.email}</p>
      <p className="text-gray-500 text-xs mb-3">Phone: {student.phone}</p>
      <p className="text-sm text-green-600 mb-3">
        Course: <span className="font-medium text-gray-700">{course.title || course.course_name}</span>
      </p>
      <div className="space-y-2">
        <span className={`font-semibold text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full inline-block ${
          paymentStatus ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Payment: {paymentStatus ? 'Paid' : 'Pending'}
        </span>
        <br />
        <span className={`font-semibold text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full inline-block ${
          approvalStatus ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Approval: {approvalStatus ? 'Approved' : 'Pending'}
        </span>
      </div>
    </div>
    {paymentStatus && !approvalStatus && onApprove && (
      <button
        onClick={onApprove}
        className="mt-4 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm lg:text-base"
      >
        Approve Student
      </button>
    )}
  </div>
);