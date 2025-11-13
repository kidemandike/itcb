// components/cards/UserCard.js
import React from 'react';

export const UserCard = ({ user, className = "" }) => {
  const roleClasses = {
    'admin': 'bg-red-100 text-red-800',
    'teacher': 'bg-blue-100 text-blue-800',
    'student': 'bg-green-100 text-green-800',
    'engineering_staff': 'bg-indigo-100 text-indigo-800', 
    'ice_staff': 'bg-orange-100 text-orange-800',         
    'language_staff': 'bg-purple-100 text-purple-800',     
    'default': 'bg-gray-100 text-gray-800'
  };
  
  const roleClass = roleClasses[user.role] || roleClasses.default;

  return (
    <div className={`bg-gradient-to-br from-white to-green-50 border border-green-200 p-4 lg:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col ${className}`}>
      <h4 className="text-base lg:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
        {`${user.firstName || user.first_name} ${user.lastName || user.last_name}`}
      </h4>
      <p className="text-gray-600 text-xs lg:text-sm mb-1">{user.email}</p>
      <p className="text-gray-500 text-xs mb-2">Phone: {user.phone}</p>
      <span className={`self-start px-2 lg:px-3 py-1 rounded-full text-xs font-medium capitalize ${roleClass}`}>
        {user.role?.replace(/_/g, ' ') || 'Unknown Role'}
      </span>
    </div>
  );
};