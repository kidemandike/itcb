// src/api/conferenceRooms.js - Conference Room Booking Endpoints

import { fetchApi } from './core';

const conferenceRoomsApi = {
    // --- Conference Room Functions (General) ---
    getConferenceRooms: (token) => fetchApi("/conference-rooms/", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    bookRoom: (token, bookingData) => fetchApi("/conference-rooms/bookings", {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(bookingData),
    }),

    getMyRoomBookings: (token) => fetchApi("/conference-rooms/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    cancelRoomBooking: (token, bookingId) => fetchApi(`/conference-rooms/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    }),

    checkRoomAvailability: (token, roomId, startTime, endTime) => {
        const url = `/conference-rooms/availability/${roomId}?start_time=${startTime}&end_time=${endTime}`;
        return fetchApi(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    // --- Admin Conference Room Functions ---
    createConferenceRoom: (token, roomData) => fetchApi("/conference-rooms/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(roomData),
    }),

    getAdminAllBookings: (token) => fetchApi("/conference-rooms/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
    }),

    updateBookingStatus: (token, bookingId, status) => fetchApi(`/conference-rooms/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: status }),
    }),

    updateBookingControlNo: (token, bookingId, controlNo) => fetchApi(`/conference-rooms/bookings/${bookingId}/control-no`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ control_no: controlNo }),
    }),
};

export default conferenceRoomsApi;