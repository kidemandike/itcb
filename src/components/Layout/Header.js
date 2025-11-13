// components/Layout/Header.js
import React, { useState } from 'react';
import { MobileSidebar } from './Sidebar';

export const Header = ({ 
  user, 
  onLogout, 
  title, 
  sidebarLinks, 
  activeTab, 
  setActiveTab,
  showBackButton = false,
  onBack = () => {} 
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Safe user data access
  const userName = user ? `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() : 'User';
  const userRole = user?.role ? user.role.replace(/_/g, ' ') : 'User';

  return (
    <>
      <div className="bg-gradient-to-r from-white to-green-50 p-4 lg:p-6 rounded-2xl shadow-xl mb-6 lg:mb-8 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {sidebarLinks && (
              <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {/* Back button */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title="Go Back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            
            <div>
              <h1 className="text-xl lg:text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Welcome back, <span className="font-semibold text-green-700">{userName}</span>
              </p>
            </div>
          </div>
          
          {/* Desktop User Info & Logout */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              Logout
            </button>
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={onLogout}
            className="lg:hidden p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            title="Logout"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarLinks && (
        <MobileSidebar
          links={sidebarLinks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={onLogout}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
};