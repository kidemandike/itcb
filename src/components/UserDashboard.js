// UserDashboard.js
import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from './UIComponents';
import { ConferenceRoomCard } from './BookConferenceRoom';
import { BookingForm } from './AdminConferenceRooms';
import api from '../api';

const UserDashboard = ({ user, accessToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState('available-rooms');
  const [conferenceRooms, setConferenceRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const fetchConferenceRooms = async () => {
    try {
      const roomsData = await api.getConferenceRooms(accessToken);
      if (Array.isArray(roomsData)) {
        setConferenceRooms(roomsData);
      } else {
        console.error('Invalid rooms data:', roomsData);
        setConferenceRooms([]);
      }
    } catch (error) {
      console.error('Failed to fetch conference rooms:', error);
      alert('Failed to load conference rooms.');
    }
  };

  const fetchMyBookings = async () => {
    try {
      const bookingsData = await api.getMyRoomBookings(accessToken);
      if (Array.isArray(bookingsData)) {
        setMyBookings(bookingsData);
      } else {
        console.error('Invalid bookings data:', bookingsData);
        setMyBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch my bookings:', error);
      alert('Failed to load your bookings.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchConferenceRooms(), fetchMyBookings()]);
      setLoading(false);
    };
    loadData();
  }, [accessToken]);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async (bookingData) => {
    try {
      await api.bookConferenceRoom(accessToken, bookingData);
      alert('Booking request submitted successfully!');
      setShowBookingForm(false);
      setSelectedRoom(null);
      fetchMyBookings();
    } catch (error) {
      console.error('Failed to submit booking:', error);
      alert('Failed to submit booking request.');
    }
  };

  const sidebarLinks = [
    { name: 'Available Rooms', id: 'available-rooms' },
    { name: 'My Bookings', id: 'my-bookings' },
  ];

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500">Loading...</p>;
    }

    if (showBookingForm) {
      return (
        <BookingForm
          room={selectedRoom}
          onSubmit={handleSubmitBooking}
          onCancel={() => {
            setShowBookingForm(false);
            setSelectedRoom(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'available-rooms':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Conference Rooms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conferenceRooms.map(room => (
                <ConferenceRoomCard
                  key={room.id}
                  room={room}
                  onBook={() => handleBookRoom(room)}
                  actionText="Book This Room"
                />
              ))}
            </div>
            
            {conferenceRooms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <p className="text-gray-600 text-lg">No conference rooms available.</p>
              </div>
            )}
          </div>
        );
        
      case 'my-bookings':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Booking Requests</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {myBookings.map(booking => (
                <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{booking.roomName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Dates:</p>
                      <p className="font-medium">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Participants:</p>
                      <p className="font-medium">{booking.participants} people</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Purpose:</p>
                    <p className="font-medium">{booking.purpose}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Total Cost:</p>
                    <p className="text-lg font-bold text-blue-700">Tsh {booking.totalCost}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {myBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-lg">You haven't made any booking requests yet.</p>
              </div>
            )}
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
        <Header user={user} onLogout={onLogout} title="Conference Room Booking" />
        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;