// components/tables/CertificateManagementTable.js
import React from 'react';
import { LoadingSpinner } from '../utils/LoadingSpinner';
import { EmptyState } from '../utils/EmptyState';
import { StatusBadge } from '../utils/StatusBadge';

export const CertificateManagementTable = ({ applications, onApprove, onSetControlNumber, loading = false, userRole }) => {
  if (loading) return <LoadingSpinner size="lg" className="mx-auto" />;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-200">
          <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <tr>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Applicant Name
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Reg. No.
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Staff Approval
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Control Number
              </th>
              <th scope="col" className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications && applications.length > 0 ? (
              applications.map((app, index) => (
                <tr key={app.id || index} className={`${index % 2 === 0 ? 'bg-purple-50' : 'bg-white'} hover:bg-purple-100 transition-colors duration-200`}>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.fullName}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.registrationNumber}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <StatusBadge status={app.isApprovedByStaff} type="approval" />
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.controlNumber || 'N/A'}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {/* Staff Approval Action */}
                    {userRole === 'language_staff' && !app.isApprovedByStaff && (
                      <button 
                        onClick={() => onApprove(app.id)}
                        className="px-2 lg:px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                    )}
                    
                    {/* Admin Control Number Action */}
                    {userRole === 'admin' && app.isApprovedByStaff && !app.controlNumber && (
                      <button 
                        onClick={() => onSetControlNumber(app.id)}
                        className="px-2 lg:px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition"
                      >
                        Set Control No.
                      </button>
                    )}
                    
                    {/* Display status if no action is needed */}
                    {(!app.isApprovedByStaff && userRole === 'admin') && <span className="text-xs text-yellow-600">Pending Staff Approval</span>}
                    {app.controlNumber && <span className="text-xs text-green-600">Payment Ready</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-sm text-gray-500 text-center">
                  <EmptyState
                    title="No certificate applications found"
                    description="Certificate applications will appear here once submitted."
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