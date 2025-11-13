import React from 'react';
import PropTypes from 'prop-types'; // Recommended for type checking in React components

/**
 * @typedef {object} User
 * @property {number | string} id - Unique ID for the user.
 * @property {string} full_name - The user's full name.
 * @property {string} email - The user's email address.
 * @property {string} [phone] - The user's phone number (optional).
 * @property {'admin' | 'teacher' | 'student' | 'language_staff' | 'ice_staff' | 'engineering_staff'} role - The user's role.
 * @property {boolean} is_active - Whether the user's account is active.
 * @property {string} created_at - ISO timestamp of when the user joined.
 */

/**
 * Displays a table for managing users, primarily allowing role changes.
 * This component uses Tailwind CSS classes for styling.
 * * @param {object} props
 * @param {User[]} props.users - Array of user objects to display.
 * @param {(userId: number | string, newRole: string) => void} props.onRoleChange - Callback function to handle role update.
 * @param {boolean} props.loading - Flag to disable actions during an API request.
 */
const UserManagementTable = ({ users, onRoleChange, loading }) => {
  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'language_staff': // Added based on context
        return 'bg-purple-100 text-purple-800';
      case 'ice_staff': // Added based on context
        return 'bg-orange-100 text-orange-800';
      case 'engineering_staff': // Added based on context
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <p className="text-gray-600 text-lg">No users found.</p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* User Avatar Initials */}
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-medium text-sm">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    {/* User Name and ID */}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                </td>
                {/* Role Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                  </span>
                </td>
                {/* Status Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {/* Joined Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                {/* Role Change Dropdown */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    disabled={loading}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="language_staff">Language Staff</option>
                    <option value="ice_staff">ICE Staff</option>
                    <option value="engineering_staff">Engineering Staff</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Add PropTypes for validation and documentation
UserManagementTable.propTypes = {
    users: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            full_name: PropTypes.string,
            email: PropTypes.string.isRequired,
            phone: PropTypes.string,
            role: PropTypes.string.isRequired,
            is_active: PropTypes.bool.isRequired,
            created_at: PropTypes.string.isRequired,
        })
    ).isRequired,
    onRoleChange: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

UserManagementTable.defaultProps = {
    loading: false,
};

export default UserManagementTable;