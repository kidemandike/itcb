import React, { useState, useEffect } from 'react';
import api from '../../api';
import { InputField } from '../UIComponents';
import { Plus, X, Loader2, Eye, EyeOff } from 'lucide-react';

const AdminConferenceRooms = ({ accessToken }) => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Room Creation States
    const [roomName, setRoomName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [location, setLocation] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    
    // UI/Loading States
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showAllData, setShowAllData] = useState(false);
    
    // Booking Management State
    const [controlNoInputs, setControlNoInputs] = useState({});
    
    // Available amenities options
    const availableAmenities = [
        'Air Conditioning',
        'Wi-Fi',
        'Computers',
        'Projector',
        'Whiteboard',
        'Video Conferencing',
        'Sound System',
        'Catering Service',
        'Printing Service'
    ];

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [fetchedBookings, fetchedRooms, fetchedUsers] = await Promise.all([
                api.getAdminAllBookings(accessToken),
                api.getConferenceRooms(accessToken),
                api.getAdminAllUsers(accessToken)
            ]);

            setBookings(fetchedBookings);
            setRooms(fetchedRooms);
            setUsers(fetchedUsers);
            
            // Initialize controlNoInputs with existing data if available
            const initialControlNos = fetchedBookings.reduce((acc, booking) => {
                acc[booking.id] = booking.control_no || '';
                return acc;
            }, {});
            setControlNoInputs(initialControlNos);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert("Failed to load data. Please check your network or token validity.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) fetchAllData();
    }, [accessToken]);

    const handleAmenityChange = (amenity) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            if (!roomName || !capacity || !location || !pricePerDay) {
                alert("Please fill in all required fields.");
                return;
            }

            const roomData = {
                name: roomName,
                capacity: parseInt(capacity),
                location,
                price_per_day: parseInt(pricePerDay),
                amenities: selectedAmenities, 
            };
            
            await api.createConferenceRoom(accessToken, roomData);
            alert("Conference room created successfully! 🎉");
            
            // Reset form
            setRoomName('');
            setCapacity('');
            setLocation('');
            setPricePerDay('');
            setSelectedAmenities([]);
            setShowForm(false);
            
            // Refresh data
            fetchAllData();
        } catch (error) {
            console.error("Failed to create room:", error);
            const errorMessage = error.response?.data?.detail || "Please check the room details and try again.";
            alert(`Failed to create room. ${errorMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this booking?`)) return;
        setActionLoading(true);
        try {
            await api.updateBookingStatus(accessToken, bookingId, status);
            alert(`Booking ${status} successfully!`);
            fetchAllData();
        } catch (error) {
            console.error("Failed to update booking status:", error);
            const errorMessage = error.response?.data?.detail || "An unexpected error occurred.";
            alert(`Failed to update booking status. ${errorMessage}`);
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleControlNoChange = (bookingId, value) => {
        setControlNoInputs(prev => ({
            ...prev,
            [bookingId]: value
        }));
    };
    
    const handleSaveControlNo = async (bookingId) => {
        const controlNo = controlNoInputs[bookingId]?.trim();
        
        if (!controlNo) {
            alert("Control Number cannot be empty.");
            return;
        }

        setActionLoading(true);
        try {
            await api.updateBookingControlNo(accessToken, bookingId, controlNo);
            alert(`Control Number for Booking ${bookingId} saved successfully!`);
            fetchAllData();
        } catch (error) {
            console.error("Failed to save Control Number:", error);
            let errorMessage = "An unexpected error occurred while saving the control number.";
             if (error.response?.data?.detail) {
                errorMessage = JSON.stringify(error.response.data.detail);
            } else if (error.message) {
                 errorMessage = error.message;
            }
            alert(`Failed to save Control Number. ${errorMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    // Helper functions to get related data
    const getRoomName = (roomId) => {
        const room = rooms.find(r => r.id === roomId);
        return room ? room.name : 'Unknown Room';
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.full_name || user.email : 'Unknown User'; 
    };

    const formatAmenities = (amenities) => {
        if (!amenities || !Array.isArray(amenities) || amenities.length === 0) return 'None';
        return amenities.join(', ');
    };

    const formatTime = (dateString) => 
        new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

    return (
        <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">

            {/* Header with Toggle Button */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-indigo-700">Conference Room Management</h2>
                    <button
                        onClick={() => setShowAllData(!showAllData)}
                        className={`flex items-center gap-2 py-3 px-6 rounded-full text-white font-medium transition ${
                            showAllData ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {showAllData ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />} 
                        {showAllData ? 'Hide All Data' : 'Show All Data'}
                    </button>
                </div>
                
                {/* Create Room Toggle */}
                <div className="flex justify-between items-center border-t pt-4">
                    <h3 className="text-xl font-bold text-gray-700">Room Management</h3>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-full text-white font-medium transition ${
                            showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
                        {showForm ? 'Close Form' : 'Add New Room'}
                    </button>
                </div>
            </div>

            {/* Create Room Form - Hidden by default */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <form onSubmit={handleCreateRoom} className="space-y-6">
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            
                            <InputField
                                label="Room Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                required
                                placeholder="e.g., Boardroom Alpha"
                            />

                            <InputField
                                label="Capacity"
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                required
                                min="1"
                                placeholder="e.g., 12"
                            />
                            
                            <InputField
                                label="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                                placeholder="e.g., 5th Floor, West Wing"
                            />

                            <InputField
                                label="Price Per Day (Tsh)"
                                type="number"
                                value={pricePerDay}
                                onChange={(e) => setPricePerDay(e.target.value)}
                                required
                                min="1"
                                placeholder="e.g., 50000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Amenities
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg border">
                                {availableAmenities.map(amenity => (
                                    <label 
                                        key={amenity} 
                                        className="flex items-center text-sm cursor-pointer hover:text-indigo-600 transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => handleAmenityChange(amenity)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-gray-700">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                            {actionLoading ? 'Creating Room...' : 'Create Room'}
                        </button>
                    </form>
                </div>
            )}

            {/* All Data Sections - Hidden by default, shown when button clicked */}
            {showAllData && (
                <>
                    {/* Rooms List */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Conference Rooms ({rooms.length})</h3>
                        {loading ? (
                            <p className="text-gray-500 flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4"/> Loading rooms...</p>
                        ) : rooms.length === 0 ? (
                            <p className="text-gray-500">No rooms available. Please add one using the form above.</p>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rooms.map(room => (
                                    <div key={room.id} className="border border-indigo-200 rounded-lg p-5 bg-indigo-50 hover:shadow-md transition">
                                        <h4 className="font-extrabold text-xl text-indigo-800 mb-2">{room.name}</h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-gray-700">Capacity: {room.capacity} people</p>
                                            <p className="text-gray-700">Location: {room.location}</p>
                                            <p className="text-green-600 font-bold">Rate: Tsh {room.price_per_day?.toLocaleString()}/day</p>
                                        </div>
                                        
                                        <div className="mt-3 pt-3 border-t border-indigo-100">
                                            <p className="text-xs font-semibold text-indigo-600 mb-1">Amenities:</p>
                                            <p className="text-sm text-gray-600 leading-tight">
                                                {formatAmenities(room.amenities)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Booking Approval Table */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">All Booking Requests ({bookings.length})</h3>
                        {loading ? (
                            <p className="text-gray-500 flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4"/> Loading bookings...</p>
                        ) : bookings.length === 0 ? (
                            <p className="text-gray-500">No booking requests found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Control No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Array.isArray(bookings) && bookings.map(booking => {
                                            const startTime = new Date(booking.start_time);
                                            const endTime = new Date(booking.end_time);
                                            const durationDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
                                            const currentInputValue = controlNoInputs[booking.id] ?? (booking.control_no || '');
                                            const isApprovedOrCompleted = booking.status === 'approved' || booking.status === 'completed';
                                            const isModified = currentInputValue !== (booking.control_no || '');
                                            
                                            return (
                                                <tr key={booking.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserName(booking.user_id)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRoomName(booking.room_id)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{durationDays} day{durationDays !== 1 ? 's' : ''}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">Tsh {booking.total_price?.toLocaleString()}</td>
                                                    
                                                    {/* CONTROL NO. CELL with Input and Save Button */}
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {isApprovedOrCompleted ? (
                                                            <div className="flex flex-col space-y-1">
                                                                <input
                                                                    type="text"
                                                                    value={currentInputValue} 
                                                                    placeholder="Enter Control No."
                                                                    className="border border-gray-300 rounded-md p-1 text-xs w-28"
                                                                    onChange={(e) => handleControlNoChange(booking.id, e.target.value)} 
                                                                    disabled={actionLoading}
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveControlNo(booking.id)} 
                                                                    className={`text-white rounded-md p-1 text-xs ${
                                                                        isModified && currentInputValue.trim() 
                                                                            ? 'bg-indigo-500 hover:bg-indigo-600'
                                                                            : 'bg-gray-400 cursor-not-allowed'
                                                                    }`}
                                                                    disabled={actionLoading || !isModified || !currentInputValue.trim()}
                                                                >
                                                                    {actionLoading ? <Loader2 className="w-3 h-3 inline animate-spin" /> : 'Save'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {booking.status === 'pending' && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'approved')}
                                                                    className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded transition disabled:bg-gray-400"
                                                                    disabled={actionLoading}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                                                                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition disabled:bg-gray-400"
                                                                    disabled={actionLoading}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminConferenceRooms;