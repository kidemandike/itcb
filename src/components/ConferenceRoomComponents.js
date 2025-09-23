// ConferenceRoomComponents.js
import React from 'react';

// Conference Room Card Component
export const ConferenceRoomCard = ({ room, onBook, actionText, showAdminControls = false, onEdit, onDelete }) => (
  <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {room.name}
        </h4>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
          Capacity: {room.capacity}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4">{room.location}</p>
      
      <div className="mb-4">
        <p className="text-lg font-semibold text-blue-700">Tsh {room.costPerDay} / day</p>
      </div>
      
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-600 mb-2">Amenities:</h5>
        <div className="flex flex-wrap gap-2">
          {room.amenities && room.amenities.includes('wifi') && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Free WiFi</span>
          )}
          {room.amenities && room.amenities.includes('computer') && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Computer</span>
          )}
          {room.amenities && room.amenities.includes('projector') && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Projector</span>
          )}
          {room.amenities && room.amenities.includes('ac') && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Air Conditioning</span>
          )}
        </div>
      </div>
    </div>
    
    {onBook && (
      <button
        onClick={onBook}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        {actionText || 'Book Room'}
      </button>
    )}
    
    {showAdminControls && (
      <div className="mt-4 flex space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    )}
  </div>
);

// Booking Request Card Component
export const BookingRequestCard = ({ booking, onApprove, onReject }) => (
  <div className="bg-gradient-to-br from-white to-green-50 border border-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <h4 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        {booking.roomName}
      </h4>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
        {booking.status || 'Pending'}
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm text-gray-600">Requested by:</p>
        <p className="font-medium">{booking.userName}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Participants:</p>
        <p className="font-medium">{booking.participants} people</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm text-gray-600">Start Date:</p>
        <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">End Date:</p>
        <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
      </div>
    </div>
    
    <div className="mb-4">
      <p className="text-sm text-gray-600">Duration:</p>
      <p className="font-medium">{booking.duration} days</p>
    </div>
    
    <div className="mb-4">
      <p className="text-sm text-gray-600">Total Cost:</p>
      <p className="text-lg font-bold text-green-700">Tsh {booking.totalCost}</p>
    </div>
    
    {onApprove && onReject && booking.status === 'Pending' && (
      <div className="flex space-x-2">
        <button
          onClick={onApprove}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Reject
        </button>
      </div>
    )}
  </div>
);