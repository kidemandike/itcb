// components/Layout/Sidebar.js
import React, { useState } from 'react';

export const Sidebar = ({ links, activeTab, setActiveTab, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Safe user data access
  const userName = user ? `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() : 'User';
  const userEmail = user?.email || 'No email';
  const userRole = user?.role ? user.role.replace(/_/g, ' ') : 'User';

  return (
    <div className={`bg-[#003366] text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header with collapse button */}
      <div className="p-4 border-b border-blue-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
            SUA-ITCB
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links && links.map(link => (
            <li key={link.id}>
              <button
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center rounded-xl transition-all duration-300 hover:scale-105 ${
                  activeTab === link.id
                    ? 'bg-gradient-to-r from-green-600 to-green-700 font-semibold shadow-lg shadow-green-500/50'
                    : 'hover:bg-gradient-to-r hover:from-green-700 hover:to-green-800 hover:shadow-md'
                } ${isCollapsed ? 'justify-center p-3' : 'text-left px-5 py-3'}`}
                title={isCollapsed ? link.name : ''}
              >
                {link.icon && <span className={isCollapsed ? '' : 'mr-3'}>{link.icon}</span>}
                {!isCollapsed && link.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout Section */}
      <div className="p-4 border-t border-blue-700">
        {!isCollapsed && (
          <div className="mb-4">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-blue-200 truncate">{userEmail}</p>
            <p className="text-xs text-blue-300 capitalize mt-1">{userRole}</p>
          </div>
        )}
        
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg ${
            isCollapsed ? 'p-3' : 'px-4 py-3'
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Mobile Sidebar with safe user data access
export const MobileSidebar = ({ links, activeTab, setActiveTab, user, onLogout, isOpen, onClose }) => {
  // Safe user data access
  const userName = user ? `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() : 'User';
  const userEmail = user?.email || 'No email';
  const userRole = user?.role ? user.role.replace(/_/g, ' ') : 'User';

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#003366] text-white p-6 transform transition-transform duration-300 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
            SUA-ITCB
          </div>
          <button onClick={onClose} className="text-white text-2xl">×</button>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-3">
            {links && links.map(link => (
              <li key={link.id}>
                <button
                  onClick={() => {
                    setActiveTab(link.id);
                    onClose();
                  }}
                  className={`w-full text-left px-5 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === link.id
                      ? 'bg-gradient-to-r from-green-600 to-green-700 font-semibold shadow-lg shadow-green-500/50'
                      : 'hover:bg-gradient-to-r hover:from-green-700 hover:to-green-800'
                  }`}
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile User Info & Logout */}
        <div className="border-t border-blue-700 pt-4 mt-4">
          <div className="mb-4">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-blue-200">{userEmail}</p>
            <p className="text-xs text-blue-300 capitalize mt-1">{userRole}</p>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};