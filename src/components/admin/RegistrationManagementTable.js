import React, { useState } from 'react';

// Registration Management Table Component
const RegistrationManagementTable = ({ registrations, onUpdateStatus, onUpdateControlNo, loading }) => {
  const [editingControlNo, setEditingControlNo] = useState(null);
  const [controlNoInput, setControlNoInput] = useState('');

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleControlNoSave = async (registrationId) => {
    if (controlNoInput.trim()) {
      await onUpdateControlNo(registrationId, controlNoInput.trim());
      setEditingControlNo(null);
      setControlNoInput('');
    }
  };

  const startEditingControlNo = (registration) => {
    setEditingControlNo(registration.id);
    setControlNoInput(registration.control_no || '');
  };

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <p className="text-gray-600 text-lg">No registrations found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Control No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {registration.user_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.user_email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {registration.course_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Instructor: {registration.instructor_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Duration: {registration.course_duration}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {registration.selected_schedule}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Tsh{registration.course_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={registration.payment_status}
                    onChange={(e) => onUpdateStatus(registration.id, e.target.value)}
                    disabled={loading}
                    className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-indigo-500 ${getStatusColor(registration.payment_status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingControlNo === registration.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={controlNoInput}
                        onChange={(e) => setControlNoInput(e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter control number"
                      />
                      <button
                        onClick={() => handleControlNoSave(registration.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        disabled={loading}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingControlNo(null);
                          setControlNoInput('');
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900">
                        {registration.control_no || '-'}
                      </span>
                      <button
                        onClick={() => startEditingControlNo(registration)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                        disabled={loading}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(registration.registration_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationManagementTable;