import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { InputField } from "./UIComponents";
import {
  CalendarDays,
  ClipboardList,
  Loader2,
  XCircle,
  Plus, // Added for the Add button
  X, // Added for the Close button
  Wifi, // Added for amenity icon
  Monitor, // Added for amenity icon
  Coffee, // Added for amenity icon
} from "lucide-react";

const BookConferenceRoom = ({ accessToken }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [durationDays, setDurationDays] = useState(0);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [conflictBookingId, setConflictBookingId] = useState(null);

  // ⭐ NEW STATE: Controls the visibility of the booking form
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Helper to find the currently selected room object
  const getSelectedRoomObject = useCallback(() => {
    return rooms.find((r) => r.id === parseInt(selectedRoom));
  }, [rooms, selectedRoom]);

  // Fetch rooms and user bookings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedRooms = await api.getConferenceRooms(accessToken);
        // Assuming fetchedRooms array contains objects with an 'amenities' property:
        // { id: 1, name: "Room A", capacity: 10, price_per_day: 100000, amenities: ["WiFi", "Projector", "Coffee Station"] }
        setRooms(Array.isArray(fetchedRooms) ? fetchedRooms : []);
        const fetchedBookings = await api.getMyRoomBookings(accessToken);
        setBookings(Array.isArray(fetchedBookings) ? fetchedBookings : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load rooms or your bookings.");
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchData();
  }, [accessToken]);

  // Check room availability
  const checkAvailability = useCallback(
    async (roomId, start, end) => {
      if (!roomId || !start || !end) {
        setIsRoomAvailable(true);
        setConflictBookingId(null);
        return;
      }
      try {
        const result = await api.checkRoomAvailability(
          accessToken,
          roomId,
          start,
          end
        );
        setIsRoomAvailable(result.available);
        setConflictBookingId(result.conflicting_booking_id);
      } catch (error) {
        console.error("Availability check failed:", error);
        setIsRoomAvailable(true);
        setConflictBookingId(null);
      }
    },
    [accessToken]
  );

  // Recalculate price and check availability
  useEffect(() => {
    let days = 0;
    let price = 0;
    const room = getSelectedRoomObject(); // Use the helper function
    if (selectedRoom && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationMs = end - start;
      // Calculate duration in days, minimum 1 day
      days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
      setDurationDays(days);
      if (room) {
        const dailyRate = room.price_per_day || room.price || 0;
        price = dailyRate * days;
      }
      checkAvailability(selectedRoom, startDate + "T00:00:00", endDate + "T23:59:59");
    } else {
      setDurationDays(0);
      setIsRoomAvailable(true);
      setConflictBookingId(null);
    }
    setCalculatedPrice(price);
  }, [selectedRoom, startDate, endDate, getSelectedRoomObject, checkAvailability]);

  const resetForm = () => {
    setSelectedRoom("");
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setCalculatedPrice(0);
    setDurationDays(0);
    setIsRoomAvailable(true);
    setConflictBookingId(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      alert("End date must be after start date");
      return;
    }
    if (new Date(startDate) < new Date().setHours(0, 0, 0, 0)) {
      alert("Start date must be today or in the future");
      return;
    }
    if (!isRoomAvailable) {
      alert("Room already booked for this range.");
      return;
    }
    setLoading(true);
    try {
      const bookingData = {
        room_id: parseInt(selectedRoom),
        title,
        description,
        start_time: new Date(startDate + "T00:00:00").toISOString(),
        end_time: new Date(endDate + "T23:59:59").toISOString(),
      };
      await api.bookRoom(accessToken, bookingData);
      alert("Booking request submitted successfully!");
      const updatedBookings = await api.getMyRoomBookings(accessToken);
      setBookings(Array.isArray(updatedBookings) ? updatedBookings : []);
      // Reset form and hide it
      resetForm();
      setShowBookingForm(false); 
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.cancelRoomBooking(accessToken, bookingId);
      alert("Booking cancelled successfully!");
      const updatedBookings = await api.getMyRoomBookings(accessToken);
      setBookings(Array.isArray(updatedBookings) ? updatedBookings : []);
    } catch (error) {
      console.error("Cancel booking error:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const getRoomName = (roomId) =>
    rooms.find((r) => r.id === roomId)?.name || "Unknown Room";
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Helper function to map a string amenity to an icon component
  const getAmenityIcon = (amenity) => {
    const lowerCaseAmenity = amenity.toLowerCase();
    if (lowerCaseAmenity.includes("wifi")) return <Wifi className="w-4 h-4 text-indigo-500" />;
    if (lowerCaseAmenity.includes("projector") || lowerCaseAmenity.includes("monitor") || lowerCaseAmenity.includes("screen")) return <Monitor className="w-4 h-4 text-indigo-500" />;
    if (lowerCaseAmenity.includes("coffee") || lowerCaseAmenity.includes("refreshments")) return <Coffee className="w-4 h-4 text-indigo-500" />;
    // Default fallback icon
    return <Plus className="w-4 h-4 text-indigo-500" />;
  };

  const currentRoom = getSelectedRoomObject();

  return (
    <div className="space-y-10 p-4 sm:p-8 bg-gradient-to-b from-indigo-50 to-white min-h-screen">
      
      {/* --- BOOKING FORM TOGGLE BUTTON --- */}
      {!showBookingForm && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setShowBookingForm(true);
              resetForm(); // Ensure form is clean when opening
            }}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.01]"
          >
            <Plus className="w-6 h-6" /> Book a Conference Room
          </button>
        </div>
      )}

      {/* --- BOOKING FORM SECTION (Conditional) --- */}
      {showBookingForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex justify-between items-start mb-6 border-b pb-3">
            <h2 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-500" /> New Booking
            </h2>
            <button
              onClick={() => setShowBookingForm(false)}
              className="p-2 text-gray-500 hover:text-gray-900 transition"
              aria-label="Close form"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Select Conference Room
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full p-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400"
                required
              >
                <option value="">-- Choose a conference room--</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.capacity} seats) – {room.location}
                  </option>
                ))}
              </select>
            </div>

            {/* --- NEW: AMENITIES DISPLAY --- */}
            {currentRoom && currentRoom.amenities && currentRoom.amenities.length > 0 && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-700 mb-2">Amenities:</h4>
                <div className="flex flex-wrap gap-4">
                  {currentRoom.amenities.map((amenity, index) => (
                    <span key={index} className="flex items-center text-sm text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                      {getAmenityIcon(amenity)}
                      <span className="ml-1">{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* ----------------------------- */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Meeting Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Q3 Strategy Meeting"
              />
              <InputField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <InputField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
              />
            </div>

            {selectedRoom && startDate && endDate && (
              <div className="rounded-lg p-4 bg-gray-50 border">
                {!isRoomAvailable ? (
                  <div className="text-red-600 font-medium flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> Room already booked for this range.
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between text-sm text-gray-600">
                    <span>Duration: {durationDays} day(s)</span>
                    {calculatedPrice > 0 && (
                      <span className="font-bold text-green-600">
                        Total: Tsh {calculatedPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isRoomAvailable}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                isRoomAvailable
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" /> Submitting...
                </span>
              ) : (
                "Submit Booking"
              )}
            </button>
          </form>
        </div>
      )}

      {/* --- MY BOOKINGS SECTION (Always Visible) --- */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center gap-2 px-6 py-4 border-b">
          <CalendarDays className="text-indigo-500 w-5 h-5" />
          <h3 className="text-2xl font-bold text-gray-800">My Bookings</h3>
        </div>
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="p-6 text-gray-500">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {["Room", "Title", "Dates", "Control No", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {getRoomName(booking.room_id)}
                    </td>
                    <td className="px-6 py-3">{booking.title}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDate(booking.start_time)} → {formatDate(booking.end_time)}
                    </td>
                    <td className="px-6 py-3 text-indigo-600 font-semibold">
                      {booking.control_no || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookConferenceRoom;