import React, { useState } from 'react';

// A custom Modal component to replace browser alerts
const Modal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full border-t-8 border-green-600">
        <p className="text-center text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Reusable Input Field component with green accent
const InputField = ({ label, name, type, value, onChange, required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
    />
  </div>
);

// Login and Registration Form component
const LoginAndRegisterForm = ({
  isRegistering,
  setIsRegistering,
  handleLogin,
  handleRegister,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [modalMessage, setModalMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Use the handleLogin function passed from the parent component
    handleLogin(formData.email, formData.password);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setModalMessage('Passwords do not match.');
      return;
    }
    const userToRegister = {
      ...formData,
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
    };
    delete userToRegister.confirmPassword;
    handleRegister(userToRegister);
    setModalMessage("Registration successful! Please log in.");
    setIsRegistering(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 via-white to-[#003366] p-4">
      <Modal message={modalMessage} onClose={() => setModalMessage('')} />
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-[#003366] transition-all duration-300">
        <h2 className="text-3xl font-extrabold text-center text-[#003366] mb-6">
          {isRegistering ? 'Create Your Account' : 'Welcome Back'}
        </h2>

        {isRegistering ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <InputField label="First Name" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
            <InputField label="Last Name" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
            <button
              type="submit"
              className="w-full bg-[#003366] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#002244] transition-colors duration-300 shadow-md"
            >
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            <div className="text-right">
              <button
                type="button"
                onClick={() => setModalMessage('Redirect to forgot password page')}
                className="text-sm text-[#003366] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 shadow-md"
            >
              Login
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-[#003366] hover:underline font-medium"
          >
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginAndRegisterForm;
