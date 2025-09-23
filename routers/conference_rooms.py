# routers/conference_rooms.py
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

import schemas
import crud
import models
from database import get_db
from auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/conference-rooms", tags=["Conference Rooms"])

# --- Conference Room Routes ---
@router.post("/", response_model=schemas.ConferenceRoom, summary="Create a new conference room (Admin only)")
async def create_conference_room(
    room: schemas.ConferenceRoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Creates a new conference room with pricing and amenities. Requires admin privileges.
    """
    # Check if room with same name already exists
    existing_room = await crud.get_conference_room_by_name(db, room.name)
    if existing_room:
        raise HTTPException(status_code=400, detail="Conference room with this name already exists")
    
    try:
        db_room = await crud.create_conference_room(db, room)
        return db_room
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating conference room: {str(e)}")

@router.get("/", response_model=List[schemas.ConferenceRoom], summary="Get all conference rooms")
async def get_all_conference_rooms(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves a list of all conference rooms with pricing information.
    """
    rooms = await crud.get_conference_rooms(db)
    return rooms

@router.get("/{room_id}", response_model=schemas.ConferenceRoom, summary="Get conference room by ID")
async def get_conference_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves a specific conference room by ID.
    """
    room = await crud.get_conference_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Conference room not found")
    return room

@router.put("/{room_id}", response_model=schemas.ConferenceRoom, summary="Update conference room (Admin only)")
async def update_conference_room(
    room_id: int,
    room_update: schemas.ConferenceRoomUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Updates a specific conference room including pricing and amenities. Requires admin privileges.
    """
    db_room = await crud.update_conference_room(db, room_id, room_update)
    if not db_room:
        raise HTTPException(status_code=404, detail="Conference room not found")
    return db_room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete conference room (Admin only)")
async def delete_conference_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Deletes a specific conference room. Requires admin privileges.
    """
    deleted = await crud.delete_conference_room(db, room_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conference room not found")
    return {"message": "Conference room deleted successfully"}

# --- Room Booking Routes ---
@router.post("/bookings", response_model=schemas.RoomBooking, summary="Book a conference room")
async def book_conference_room(
    booking: schemas.RoomBookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Books a conference room for the authenticated user with automatic price calculation.
    """
    # Check if room exists
    room = await crud.get_conference_room(db, booking.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Conference room not found")
    
    # Validate booking times
    if booking.end_time <= booking.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )
    
   if booking.start_time < datetime.now(timezone.utc):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Cannot book a room in the past"
        )
    
    # Check for time conflicts
    existing_booking = await crud.check_room_availability(
        db, booking.room_id, booking.start_time, booking.end_time
    )
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="This room is already booked for the selected time slot."
        )
    
    try:
        db_booking = await crud.create_room_booking(db, booking, current_user.id)
        return db_booking
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating booking: {str(e)}")

@router.get("/bookings", response_model=List[schemas.RoomBooking], summary="Get all room bookings (Admin only)")
async def get_all_room_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Retrieves all room bookings. Requires admin privileges.
    """
    bookings = await crud.get_all_room_bookings(db)
    return bookings

@router.get("/bookings/my-bookings", response_model=List[schemas.RoomBooking], summary="Get current user's room bookings")
async def get_my_room_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves the current user's room bookings.
    """
    bookings = await crud.get_user_bookings(db, current_user.id)
    return bookings

@router.delete("/bookings/my-bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Cancel user's own booking")
async def cancel_my_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Allows a user to cancel their own booking.
    """
    # Get the booking
    booking = await crud.get_room_booking(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if the booking belongs to the current user
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )
    
   if booking.status not in ["pending", "approved"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a booking that is already completed or cancelled"
        )
    # Check if booking is in the future (allow cancellation up to 1 hour before start)
    cancellation_deadline = booking.start_time - timedelta(hours=1)
    if datetime.utcnow() > cancellation_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel booking less than 1 hour before start time"
        )
    
    try:
        # Update booking status to cancelled
        booking.status = "cancelled"
        booking.updated_at = datetime.utcnow()
        await db.commit()
        return {"message": "Booking cancelled successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error cancelling booking: {str(e)}")

@router.patch("/bookings/{booking_id}/status", response_model=schemas.RoomBooking, summary="Update booking status (Admin only)")
async def update_booking_status(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Updates the status of a room booking. Requires admin privileges.
    """
    valid_statuses = ["approved", "rejected", "completed", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(valid_statuses)}"
        )
    
    db_booking = await crud.update_booking_status(db, booking_id, status_update.status)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db_booking

@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete room booking (Admin only)")
async def delete_room_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Permanently deletes a room booking. Requires admin privileges.
    """
    deleted = await crud.delete_room_booking(db, booking_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted successfully"}

@router.get("/availability/{room_id}")
async def check_room_availability(
    room_id: int,
    start_time: datetime,
    end_time: datetime,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Check room availability for a specific time period.
    """
    room = await crud.get_conference_room(db, room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conference room not found"
        )
    
    conflicting_booking = await crud.check_room_availability(db, room_id, start_time, end_time)
    
    return {
        "room_id": room_id,
        "room_name": room.name,
        "start_time": start_time,
        "end_time": end_time,
        "available": conflicting_booking is None,
        "conflicting_booking": conflicting_booking
    }

@router.get("/bookings/{room_id}/schedule", response_model=List[schemas.RoomBooking], summary="Get room booking schedule")
async def get_room_schedule(
    room_id: int,
    start_date: datetime = None,
    end_date: datetime = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get booking schedule for a specific room within a date range.
    """
    room = await crud.get_conference_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Conference room not found")
    
    # Default to current week if no dates provided
    if not start_date:
        start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    if not end_date:
        end_date = start_date + timedelta(days=7)
    
    try:
        bookings = await crud.get_room_bookings_in_range(db, room_id, start_date, end_date)
        return bookings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving schedule: {str(e)}")

@router.get("/statistics/usage", summary="Get room usage statistics (Admin only)")
async def get_room_usage_statistics(
    start_date: datetime = None,
    end_date: datetime = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Get usage statistics for all conference rooms. Requires admin privileges.
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)  # Last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    
    try:
        stats = await crud.get_room_usage_statistics(db, start_date, end_date)
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")