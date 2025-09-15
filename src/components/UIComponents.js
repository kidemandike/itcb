import React from 'react';

// Sidebar for dashboard navigation with dark-blue background
export const Sidebar = ({ links, activeTab, setActiveTab }) => (
  <div className="w-64 bg-[#003366] text-white p-6 flex flex-col items-center shadow-2xl">
    <div className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
      SUA-ITCB
    </div>
    <nav className="w-full">
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.id}>
            <button
              onClick={() => setActiveTab(link.id)}
              className={`w-full text-left px-5 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeTab === link.id
                  ? 'bg-gradient-to-r from-green-600 to-green-700 font-semibold shadow-lg shadow-green-500/50'
                  : 'hover:bg-gradient-to-r hover:from-green-700 hover:to-green-800 hover:shadow-md'
              }`}
            >
              {link.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

// Header component with enhanced styling
export const Header = ({ user, onLogout, title }) => (
  <div className="flex justify-between items-center bg-gradient-to-r from-white to-green-50 p-6 rounded-2xl shadow-xl mb-8 border border-green-100">
    <div>
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-gray-600 mt-2 text-lg">
        Welcome back, <span className="font-semibold text-green-700">{user.firstName} {user.lastName}</span>
      </p>
    </div>
    <button
      onClick={onLogout}
      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      Logout
    </button>
  </div>
);

// Reusable Input Field component with green accent
export const InputField = ({ label, name, type, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
    />
  </div>
);

// Card to display course information with white and green gradient
export const CourseCard = ({ course, onAction, actionText, status }) => (
  <div className="bg-gradient-to-br from-white to-green-50 border border-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col justify-between">
    <div>
      <h4 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
        {course.title}
      </h4>
      <p className="text-gray-700 mb-3 leading-relaxed">{course.description}</p>
      <p className="text-sm text-green-600 font-medium">
        Taught by: <span className="text-gray-700">{course.teacherName}</span>
      </p>
    </div>
    {status && (
      <div className="mt-4 space-y-2">
        <p className={`font-semibold text-sm px-3 py-1 rounded-full inline-block ${
          status.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Payment: {status.payment ? 'Paid' : 'Pending'}
        </p>
        <br />
        <p className={`font-semibold text-sm px-3 py-1 rounded-full inline-block ${
          status.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Approval: {status.approved ? 'Approved' : 'Pending'}
        </p>
      </div>
    )}
    {onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        {actionText}
      </button>
    )}
  </div>
);

// Teacher Course Card with white and green design
export const TeacherCourseCard = ({ course, onViewRegistrations, showCourseName = false }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
                <h3 className="text-xl font-bold text-indigo-700 mb-2">
                    {showCourseName ? course.course_name : course.course_id}
                </h3>
                <p className="text-sm text-gray-500 mb-4">Instructor: {course.instructor_name}</p>
                <p className="text-gray-600 mb-2">Duration: {course.course_duration}</p>
                <p className="text-gray-800 font-bold mb-4">Price: Tsh{course.course_price}</p>
                <button
                    onClick={onViewRegistrations}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                    View Registrations
                </button>
            </div>
        </div>
    );
};

// Student Status Card with white and green design
export const StudentStatusCard = ({ student, course, paymentStatus, approvalStatus, onApprove }) => (
  <div className="bg-gradient-to-br from-white to-green-50 border border-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col justify-between">
    <div>
      <h4 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
        {`${student.firstName} ${student.lastName}`}
      </h4>
      <p className="text-gray-600 text-sm mb-2">{student.email}</p>
      <p className="text-sm text-green-600 mb-3">
        Course: <span className="font-medium text-gray-700">{course.title}</span>
      </p>
      <div className="space-y-2">
        <p className={`font-semibold text-sm px-3 py-1 rounded-full inline-block ${
          paymentStatus ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Payment: {paymentStatus ? 'Paid' : 'Pending'}
        </p>
        <br />
        <p className={`font-semibold text-sm px-3 py-1 rounded-full inline-block ${
          approvalStatus ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          Approval: {approvalStatus ? 'Approved' : 'Pending'}
        </p>
      </div>
    </div>
    {paymentStatus && !approvalStatus && (
      <button
        onClick={onApprove}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        Approve Student
      </button>
    )}
  </div>
);

// User Card with white and green design
export const UserCard = ({ user }) => (
  <div className="bg-gradient-to-br from-white to-green-50 border border-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col">
    <h4 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
      {`${user.firstName} ${user.lastName}`}
    </h4>
    <p className="text-gray-600 text-sm mb-1">{user.email}</p>
    <p className="text-gray-500 text-xs">Phone: {user.phone}</p>
  </div>
);

// Enhanced User Table with green styling
export const UserTable = ({ users, onRoleChange }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
    <table className="min-w-full divide-y divide-green-200">
      <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
        <tr>
          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
            Name
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
            Email
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
            Role
          </th>
          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((user, index) => (
          <tr key={user.id} className={`${index % 2 === 0 ? 'bg-green-50' : 'bg-white'} hover:bg-green-100 transition-colors duration-200`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {`${user.firstName} ${user.lastName}`}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <select
                value={user.role}
                onChange={(e) => onRoleChange(user.id, e.target.value)}
                className="border border-green-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent px-3 py-2 text-sm"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Enhanced Student Table with green styling
export const StudentTable = ({ registrations }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-green-200">
        <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
              Student Name
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
              Registration Date
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
              Payment Status
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
              Approval Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {registrations && registrations.length > 0 ? (
            registrations.map((registration, index) => (
              <tr key={registration.registration_id || index} 
                  className={`${index % 2 === 0 ? 'bg-green-50' : 'bg-white'} hover:bg-green-100 transition-colors duration-200`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {registration.firstName && registration.lastName 
                    ? `${registration.firstName} ${registration.lastName}`
                    : registration.studentName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {registration.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {registration.registrationDate 
                    ? new Date(registration.registrationDate).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    registration.paymentStatus || registration.payment_status
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(registration.paymentStatus || registration.payment_status) ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    registration.approvalStatus || registration.approval_status
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(registration.approvalStatus || registration.approval_status) ? 'Approved' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">No registrations yet</p>
                  <p className="text-gray-500">Student registrations will appear here once available.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);