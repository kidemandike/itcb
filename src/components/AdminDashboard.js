import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  Header,
  UserTable,
  InputField,
  UserCard,
  StudentStatusCard,
} from './UIComponents';
import api from '../api';
import jsPDF from 'jspdf';

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

// User Management Table Component
const UserManagementTable = ({ users, onRoleChange, loading }) => {
  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <p className="text-gray-600 text-lg">No users found.</p>
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
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
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

const AdminDashboard = ({ user, accessToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState('registrations');
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const usersData = await api.getAdminAllUsers(accessToken);
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.error('Invalid users data:', usersData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users.');
    }
  };

  // Fetch all registrations
  const fetchRegistrations = async () => {
    try {
      const registrationsData = await api.getAdminAllRegistrations(accessToken);
      if (Array.isArray(registrationsData)) {
        setRegistrations(registrationsData);
      } else {
        console.error('Invalid registrations data:', registrationsData);
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      alert('Failed to load registrations.');
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const coursesData = await api.getAllCourses(accessToken);
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      } else {
        console.error('Invalid courses data:', coursesData);
        setCourses([]);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      alert('Failed to load courses.');
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRegistrations(), fetchCourses()]);
      setLoading(false);
    };
    loadData();
  }, [accessToken]);

  // Handle payment status update
  const handleUpdatePaymentStatus = async (registrationId, status) => {
    setActionLoading(true);
    try {
      await api.updateRegistrationPaymentStatus(accessToken, registrationId, status);
      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId
            ? { ...reg, payment_status: status }
            : reg
        )
      );
      alert(`Payment status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle control number update
  const handleUpdateControlNo = async (registrationId, controlNo) => {
    setActionLoading(true);
    try {
      await api.updateRegistrationControlNo(accessToken, registrationId, controlNo);
      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId
            ? { ...reg, control_no: controlNo }
            : reg
        )
      );
      alert('Control number updated successfully');
    } catch (error) {
      console.error('Failed to update control number:', error);
      alert('Failed to update control number.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(true);
    try {
      await api.updateUserRole(accessToken, userId, newRole);
      // Update local state
      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, role: newRole }
            : u
        )
      );
      alert(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter registrations by status
  const getFilteredRegistrations = () => {
    switch (statusFilter) {
      case 'pending':
        return registrations.filter(reg => reg.payment_status.toLowerCase() === 'pending');
      case 'paid':
        return registrations.filter(reg => reg.payment_status.toLowerCase() === 'paid');
      case 'cancelled':
        return registrations.filter(reg => reg.payment_status.toLowerCase() === 'cancelled');
      default:
        return registrations;
    }
  };

  // Get statistics
  const getStats = () => {
    const totalUsers = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const totalRegistrations = registrations.length;
    const pendingPayments = registrations.filter(r => r.payment_status === 'Pending').length;
    const paidRegistrations = registrations.filter(r => r.payment_status === 'Paid').length;
    const cancelledRegistrations = registrations.filter(r => r.payment_status === 'Cancelled').length;
    const totalCourses = courses.length;

    // Calculate total revenue from paid registrations
    const totalRevenue = registrations
      .filter(reg => reg.payment_status === 'Paid')
      .reduce((total, reg) => {
        const price = parseFloat(reg.course_price) || 0;
        return total + price;
      }, 0);

    return {
      totalUsers,
      students,
      teachers,
      admins,
      totalRegistrations,
      pendingPayments,
      paidRegistrations,
      cancelledRegistrations,
      totalCourses,
      totalRevenue
    };
  };

   // Generate PDF Report with SUA branding
  const generatePDFReport = async () => {
    setActionLoading(true);
    try {
      const stats = getStats();
      
      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add light background
      doc.setFillColor(240, 245, 249);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add SUA header with logo
      try {
        // Add SUA header background
        doc.setFillColor(0, 83, 78); // SUA green color
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Add SUA logo from public folder
        const logoImg = new Image();
        logoImg.src = '/sua-logo.png';
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          setTimeout(resolve, 1000); // Fallback timeout
        });
        
        // Add logo to PDF (adjust dimensions as needed)
        doc.addImage(logoImg, 'PNG', 15, 5, 30, 30);
        
        // Add text next to logo
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('SUA-ITCB TRAINING CENTER', 55, 20);
        
      } catch (error) {
        console.log('Using text-only header:', error);
        // Fallback to text logo if image fails
        doc.setFillColor(0, 83, 78);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('SUA-ITCB TRAINING CENTER', pageWidth / 2, 25, { align: 'center' });
      }
      
      // Add report title
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, 'bold');
      doc.text('COMPREHENSIVE SYSTEM REPORT', pageWidth / 2, 55, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 65, { align: 'center' });
      
      // Add decorative line
      doc.setDrawColor(0, 83, 78);
      doc.setLineWidth(0.5);
      doc.line(20, 70, pageWidth - 20, 70);
      
      // Add statistics section
      doc.setFontSize(14);
      doc.setTextColor(0, 83, 78);
      doc.setFont(undefined, 'bold');
      doc.text('SYSTEM STATISTICS OVERVIEW', 20, 85);
      
      let yPosition = 95;
      
      // User statistics box
      doc.setFillColor(232, 245, 233);
      doc.roundedRect(20, yPosition, 85, 45, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(0, 83, 78);
      doc.setFont(undefined, 'bold');
      doc.text('USER STATISTICS', 30, yPosition + 8);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Users: ${stats.totalUsers}`, 25, yPosition + 18);
      doc.text(`Students: ${stats.students}`, 25, yPosition + 25);
      doc.text(`Teachers: ${stats.teachers}`, 25, yPosition + 32);
      doc.text(`Admins: ${stats.admins}`, 25, yPosition + 39);
      
      // Course statistics box
      doc.setFillColor(227, 242, 253);
      doc.roundedRect(110, yPosition, 45, 45, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(30, 136, 229);
      doc.setFont(undefined, 'bold');
      doc.text('COURSES', 120, yPosition + 8);
      
      doc.setFontSize(20);
      doc.setTextColor(30, 136, 229);
      doc.text(stats.totalCourses.toString(), 125, yPosition + 30);
      doc.setFontSize(10);
      doc.text('Total Courses', 125, yPosition + 38);
      
      yPosition += 55;
      
      // Registration statistics box
      doc.setFillColor(255, 243, 224);
      doc.roundedRect(20, yPosition, 135, 50, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(245, 124, 0);
      doc.setFont(undefined, 'bold');
      doc.text('REGISTRATION STATISTICS', 30, yPosition + 8);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.text(`Total: ${stats.totalRegistrations}`, 25, yPosition + 20);
      doc.text(`Paid: ${stats.paidRegistrations}`, 25, yPosition + 28);
      doc.text(`Pending: ${stats.pendingPayments}`, 25, yPosition + 36);
      doc.text(`Cancelled: ${stats.cancelledRegistrations}`, 25, yPosition + 44);
      
      // Success rate box
      const successRate = stats.totalRegistrations > 0 
        ? Math.round((stats.paidRegistrations / stats.totalRegistrations) * 100)
        : 0;
      
      doc.setFillColor(232, 245, 233);
      doc.roundedRect(160, yPosition, 35, 50, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(46, 125, 50);
      doc.setFont(undefined, 'bold');
      doc.text('SUCCESS', 165, yPosition + 8);
      doc.text('RATE', 167, yPosition + 15);
      
      doc.setFontSize(16);
      doc.text(`${successRate}%`, 168, yPosition + 35);
      
      yPosition += 55;
      
      // Revenue statistics box - NEW SECTION
      doc.setFillColor(255, 230, 245);
      doc.roundedRect(20, yPosition, 175, 30, 3, 3, 'F');
      doc.setFontSize(14);
      doc.setTextColor(156, 39, 176);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL REVENUE', 30, yPosition + 10);
      
      doc.setFontSize(18);
      doc.setTextColor(156, 39, 176);
      doc.text(`Tsh ${stats.totalRevenue.toLocaleString()}`, 30, yPosition + 25);
      
      yPosition += 45;
      
      // Add detailed course breakdown
doc.setFontSize(14);
doc.setTextColor(0, 83, 78);
doc.setFont(undefined, 'bold');
doc.text('REGISTRATIONS BY COURSE', 20, yPosition);

yPosition += 10;

// Course statistics
const courseStats = {};
registrations.forEach(reg => {
  const courseName = reg.course_name;
  courseStats[courseName] = (courseStats[courseName] || 0) + 1;
});

doc.setFontSize(10);
doc.setTextColor(0, 0, 0);
doc.setFont(undefined, 'normal'); // Reset font to normal for content

Object.entries(courseStats).forEach(([course, count]) => {
  // Check if we need a new page before adding the next line
  if (yPosition > pageHeight - 20) {
    doc.addPage();
    yPosition = 20; // Reset y position for the new page
  }
  doc.text(`${course}: ${count} students`, 25, yPosition);
  yPosition += 7; // Increment yPosition for the next line
});
      
      // Add SUA footer
      doc.setFillColor(0, 83, 78);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('Sokoine University of Agriculture - ITCB Training Center', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text('Management System Report | Confidential', pageWidth / 2, pageHeight - 8, { align: 'center' });
      
      // Add page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      // Save the PDF
      doc.save(`sua-itcb-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      alert('PDF report generated successfully with SUA branding!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report.');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = getStats();
  const filteredRegistrations = getFilteredRegistrations();

  const sidebarLinks = [
    { name: 'Registration Management', id: 'registrations' },
    { name: 'User Management', id: 'users' },
    { name: 'System Overview', id: 'overview' },
  ];

 const renderContent = () => {
  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  switch (activeTab) {
    case 'overview':
      return (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
            <p className="text-gray-600">Dashboard statistics and insights</p>

            {/* PDF Report Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={generatePDFReport}
                disabled={actionLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Generating...' : 'Generate PDF Report'}
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</div>
              <div className="text-gray-600">Total Users</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.students}</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600">{stats.teachers}</div>
              <div className="text-gray-600">Teachers</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600">{stats.totalCourses}</div>
              <div className="text-gray-600">Total Courses</div>
            </div>
          </div>

          {/* Payment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Registration Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Registrations:</span>
                  <span className="font-semibold text-indigo-600">{stats.totalRegistrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Payments:</span>
                  <span className="font-semibold text-yellow-600">{stats.pendingPayments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid Registrations:</span>
                  <span className="font-semibold text-green-600">{stats.paidRegistrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cancelled:</span>
                  <span className="font-semibold text-red-600">{stats.cancelledRegistrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-semibold text-indigo-600">
                    {stats.totalRegistrations > 0 
                      ? `${Math.round((stats.paidRegistrations / stats.totalRegistrations) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                {/* NEW: Total Revenue Display */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-gray-600 font-bold">Total Revenue:</span>
                  <span className="font-bold text-purple-600 text-lg">
                    Tsh {stats.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={fetchRegistrations}
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Refresh Registrations
                </button>
                <button
                  onClick={fetchUsers}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Refresh Users
                </button>
                <button
                  onClick={fetchCourses}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'registrations':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Management</h2>
          <div className="mb-4 flex items-center space-x-4">
            <span className="text-gray-600">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-1 px-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <RegistrationManagementTable
            registrations={filteredRegistrations}
            onUpdateStatus={handleUpdatePaymentStatus}
            onUpdateControlNo={handleUpdateControlNo}
            loading={actionLoading}
          />
        </div>
      );

    case 'users':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User Management</h2>
          <UserManagementTable
            users={users}
            onRoleChange={handleRoleChange}
            loading={actionLoading}
          />
        </div>
      );

    default:
      return null;
  }
};

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-8">
        <Header user={user} onLogout={onLogout} title="Admin Dashboard" />
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;