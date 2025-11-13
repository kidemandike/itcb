// components/utils/StatusBadge.js
import React from 'react';

export const StatusBadge = ({ status, type = "default" }) => {
  const getStatusClasses = (status, type) => {
    const baseClasses = "px-2 lg:px-3 py-1 rounded-full text-xs font-medium inline-flex items-center";
    
    if (type === "payment") {
      return status 
        ? `${baseClasses} bg-green-100 text-green-800`
        : `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
    
    if (type === "approval") {
      return status 
        ? `${baseClasses} bg-green-100 text-green-800`
        : `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
    
    // Default status badge
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const getStatusText = (status, type) => {
    if (type === "payment") return status ? "Paid" : "Pending";
    if (type === "approval") return status ? "Approved" : "Pending";
    return status;
  };

  return (
    <span className={getStatusClasses(status, type)}>
      {getStatusText(status, type)}
    </span>
  );
};