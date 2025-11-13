import React, { useState } from 'react';

/**
 * CertificateRequestTable Component
 * Displays and allows management of student certificate requests.
 * @param {object} props
 * @param {Array<object>} props.requests - List of certificate request objects (expected to have a staff_status and control_number).
 * @param {function} props.onApprove - Handler for staff approval (maps to approveCertificateApplication).
 * @param {function} props.onSetControlNumber - Handler for setting the control number (maps to setCertificateControlNumber).
 * @param {function} props.onGeneratePDF - Handler for final PDF generation.
 * @param {boolean} props.loading - Global loading state for actions.
 */
const CertificateRequestTable = ({ 
    requests, 
    onApprove, 
    onSetControlNumber, 
    onGeneratePDF = () => {}, // Retaining default for safety
    loading 
}) => {
    // State to manage inline input for control number
    const [editId, setEditId] = useState(null);
    const [controlNumberInput, setControlNumberInput] = useState('');

    // Helper to determine status color based on backend 'staff_status'
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Approved':
                return 'bg-indigo-100 text-indigo-800'; 
            case 'Control_Set':
                return 'bg-green-100 text-green-800'; 
            case 'Rejected':
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Handler to save the control number
    const handleSaveControlNumber = (id) => {
        if (controlNumberInput.trim()) {
            onSetControlNumber(id, controlNumberInput.trim());
            setEditId(null);
            setControlNumberInput('');
        }
    };

    if (requests.length === 0) {
        return (
            <div className="bg-white shadow-lg rounded-lg p-6 text-center text-gray-500">
                <p className="text-xl font-medium">No Certificate Requests Found</p>
                <p className="mt-2">Waiting for students to submit requests.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden relative">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Request ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name / Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Certificate Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Control Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                            <tr key={request.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {request.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="text-gray-900">{request.user_name}</div>
                                    <div className="text-xs text-gray-500">{request.user_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {request.certificate_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.staff_status)}`}>
                                        {request.staff_status}
                                    </span>
                                </td>
                                {/* Control Number Field with inline edit */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {editId === request.id ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                defaultValue={request.control_number || ''}
                                                onChange={(e) => setControlNumberInput(e.target.value)}
                                                className="border border-gray-300 rounded-md p-1 w-32 text-xs"
                                                placeholder="e.g., LSC-2025-001"
                                                disabled={loading}
                                            />
                                            <button 
                                                onClick={() => handleSaveControlNumber(request.id)}
                                                disabled={loading || !controlNumberInput.trim()} 
                                                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs disabled:bg-gray-400 disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button 
                                                onClick={() => setEditId(null)}
                                                disabled={loading}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-1 rounded text-xs disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <span>{request.control_number || 'N/A'}</span>
                                            {/* Only allow setting if status is approved and control number is missing (Admin action) */}
                                            {request.staff_status === 'Approved' && !request.control_number && (
                                                <button
                                                    onClick={() => { setEditId(request.id); setControlNumberInput(request.control_number || ''); }}
                                                    disabled={loading}
                                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-medium disabled:opacity-50"
                                                >
                                                    Set Number
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2 items-center">
                                        {/* Staff Approval Button */}
                                        {request.staff_status === 'Pending' && (
                                            <button
                                                onClick={() => onApprove(request.id)}
                                                disabled={loading}
                                                className="py-1 px-3 rounded-md text-white text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        
                                        {/* Final Certificate Action Button */}
                                        {(request.control_number) && (
                                            <button
                                                // ✅ ACTION RESTORED: Calling the onGeneratePDF prop function
                                                onClick={() => onGeneratePDF(request.id)} 
                                                disabled={loading}
                                                className={`py-1 px-3 rounded-md text-white text-xs font-semibold transition-colors 
                                                    ${request.control_number ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                            >
                                                Generate PDF
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                    <p className="text-indigo-600 text-lg flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Applying action...
                    </p>
                </div>
            )}
        </div>
    );
};

export default CertificateRequestTable;