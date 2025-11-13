// components/forms/CertificateApplicationCard.js
import React, { useState } from 'react';
import { InputField } from './InputField';

export const CertificateApplicationCard = ({ onSubmit, actionLoading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 p-4 lg:p-8 rounded-2xl shadow-2xl max-w-lg mx-auto w-full">
      <h3 className="text-xl lg:text-2xl font-bold text-purple-700 mb-4">English Certificate Application (SUA Alumni)</h3>
      <p className="text-gray-600 mb-6 text-sm lg:text-base">Please fill in your details to apply for your English Proficiency Certificate.</p>
      
      <form onSubmit={handleSubmit}>
        <InputField 
          label="Full Name (as per SUA records)"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required={true}
          placeholder="Enter your full legal name"
        />
        <InputField 
          label="SUA Registration Number"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          required={true}
          placeholder="e.g., SU-20XX-0XXX"
        />
        <InputField 
          label="Contact Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required={true}
          placeholder="e.g., 07XXXXXXXX"
        />

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 text-sm lg:text-base"
        >
          {actionLoading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};