// components/forms/InputField.js
import React from 'react';

export const InputField = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  error, 
  disabled = false 
}) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 lg:px-4 py-2 lg:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);