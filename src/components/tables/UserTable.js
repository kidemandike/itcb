// components/tables/UserTable.js
import React from 'react';
import { LoadingSpinner } from '../utils/LoadingSpinner';
import { EmptyState } from '../utils/EmptyState';

const UserRoleBadge = ({ role }) => {
  const roleClasses = {
    'admin': 'bg-red-100 text-red-800',
    'teacher': 'bg-blue-100 text-blue-800',
    'student': 'bg-green-100 text-green-800',
    'engineering_staff': 'bg-indigo-100 text-indigo-800',
    'ice_staff': 'bg-orange-100 text-orange-800',
    'language_staff': 'bg-purple-100 text-purple-800',
    'default': 'bg-gray-100 text-gray-800'
  };
  const roleText = role?.replace(/_/g, ' ') || 'Unknown Role';
  const roleClass = roleClasses[role] || roleClasses.default;
  
  return (
    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium capitalize ${roleClass}`}>
      {roleText}
    </span>
  );
};

export const UserTable = ({ users, onRoleChange, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 flex justify-center items-center border border-green-200">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="User data will appear here once available."
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-green-200">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
            <tr>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={user.id} className={`${index % 2 === 0 ? 'bg-green-50' : 'bg-white'} hover:bg-green-100 transition-colors duration-200`}>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {`${user.firstName || user.first_name} ${user.lastName || user.last_name}`}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.phone || 'N/A'}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {onRoleChange && (
                    <select
                      value={user.role}
                      onChange={(e) => onRoleChange(user.id, e.target.value)}
                      className="border border-green-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher (General)</option>
                      <option value="admin">Admin</option>
                      <option value="engineering_staff">Staff (Engineering)</option>
                      <option value="ice_staff">Staff (ICE)</option>
                      <option value="language_staff">Staff (Language)</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};