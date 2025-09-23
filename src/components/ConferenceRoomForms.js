// ConferenceRoomForms.js
import React, { useState } from 'react';

// Form for adding/editing conference rooms (Admin)
export const ConferenceRoomForm = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    capacity: room?.capacity || '',
    costPerDay: room?.costPerDay || '',
    location: room?.location || '',
    amenities: room?.amenities || [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const updatedAmenities = checked
        ? [...formData.amenities, value]
        : formData.amenities.filter(item => item !== value);
      
      setFormData(prev => ({ ...prev, amenities: updatedAmenities }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {room ? 'Edit Conference Room' : 'Add New Conference Room'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Day (Tsh)</label>
          <input
            type="number"
            name="costPerDay"
            value={formData.costPerDay}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              value="wifi"
              checked={formData.amenities.includes('wifi')}
              onChange={handleChange}
              className="mr-2 h-5 w-5 text-blue-600"
            />
            Free WiFi
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="computer"
              checked={formData.amenities.includes('computer')}
              onChange={handleChange}
              className="mr-2 h-5 w-5 text-blue-600"
            />
            Computer
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="projector"
              checked={formData.amenities.includes('projector')}
              onChange={handleChange}
              className="mr-2 h-5 w-5 text-blue-600"
            />
            Projector
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              value="ac"
              checked={formData.amenities.includes('ac')}
              onChange={handleChange}
              className="mr-2 h-5 w-5 text-blue-600"
            />
            Air Conditioning
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {room ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  );
};

// Form for booking conference rooms (User)
export const BookingForm = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    participants: '',
    startDate: '',
    endDate: '',
    purpose: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate || !room) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of both dates
    
    return diffDays * room.costPerDay;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const totalCost = calculateTotal();
    const duration = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    
    onSubmit({
      ...formData,
      totalCost,
      duration,
      roomId: room.id,
      roomName: room.name
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Book Conference Room: {room.name}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Participants</label>
          <input
            type="number"
            name="participants"
            value={formData.participants}
            onChange={handleChange}
            required
            min="1"
            max={room.capacity}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Max capacity: {room.capacity} people</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Booking</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {formData.startDate && formData.endDate && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold text-blue-800">
            Total Cost: Tsh {calculateTotal().toLocaleString()} 
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24) + 1)} days)
            </span>
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Request Booking
        </button>
      </div>
    </form>
  );
};