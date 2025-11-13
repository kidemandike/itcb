// components/utils/EmptyState.js
import React from 'react';

export const EmptyState = ({ title, description, icon, action }) => (
  <div className="text-center py-8 lg:py-12">
    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      {icon || (
        <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
    </div>
    <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 text-sm lg:text-base">{description}</p>
    {action}
  </div>
);