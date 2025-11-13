// components/tables/StudentTable.js
import React from 'react';
import { LoadingSpinner } from '../utils/LoadingSpinner';
import { EmptyState } from '../utils/EmptyState';

export const StudentTable = ({ registrations, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 flex justify-center items-center border border-green-200">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-green-200">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
            <tr>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Student Name
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Registration Date
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Payment Status
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Approval Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations && registrations.length > 0 ? (
              registrations.map((registration, index) => (
                <tr key={registration.registration_id || registration.id || index} 
                    className={`${index % 2 === 0 ? 'bg-green-50' : 'bg-white'} hover:bg-green-100 transition-colors duration-200`}>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {registration.firstName && registration.lastName 
                      ? `${registration.firstName} ${registration.lastName}`
                      : registration.first_name && registration.last_name
                      ? `${registration.first_name} ${registration.last_name}`
                      : registration.studentName || registration.student_name || 'N/A'}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {registration.email || 'N/A'}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {registration.phone || 'N/A'}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {registration.registrationDate || registration.registration_date
                      ? new Date(registration.registrationDate || registration.registration_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 lg:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      registration.paymentStatus || registration.payment_status
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {(registration.paymentStatus || registration.payment_status) ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 lg:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                <td colSpan="6" className="px-6 py-12 whitespace-nowrap text-sm text-gray-500 text-center">
                  <EmptyState
                    title="No registrations yet"
                    description="Student registrations will appear here once available."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};