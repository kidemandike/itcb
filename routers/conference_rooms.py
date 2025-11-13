import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from math import ceil 

# Assume these files exist and contain necessary definitions/dependencies
import schemas 
import crud 
import models 
from database import get_db 
from auth import get_current_user, get_current_admin # Corrected import

router = APIRouter(prefix="/conference-rooms", tags=["Conference Rooms"])

# ----------------------------------------------------------------------
# Conference Room CRUD Routes 
# ----------------------------------------------------------------------

@router.post("/", response_model=schemas.ConferenceRoom, summary="Create a new conference room (Admin only)")
async def create_conference_room(
    room: schemas.ConferenceRoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin) # FIX APPLIED
):
    existing_room = await crud.get_conference_room_by_name(db, room.name)
    if existing_room:
        raise HTTPException(status_code=400, detail="Conference room with this name already exists")
    
    try:
        db_room = await crud.create_conference_room(db, room)
        # 🚀 Fix: Refresh to get auto-generated ID, created_at, updated_at
        await db.refresh(db_room)
        return db_room
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating conference room: {str(e)}")


@router.get("/", response_model=List[schemas.ConferenceRoom], summary="Get all conference rooms")
async def get_all_conference_rooms(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rooms = await crud.get_conference_rooms(db)
    # ✅ Use model_validate for robust serialization
    return [schemas.ConferenceRoom.model_validate(r) for r in rooms]


@router.get("/{room_id}", response_model=schemas.ConferenceRoom, summary="Get a conference room by ID")
async def get_conference_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    room = await crud.get_conference_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Conference room not found")
    return room


@router.put("/{room_id}", response_model=schemas.ConferenceRoom, summary="Update a conference room (Admin only)")
async def update_conference_room(
    room_id: int,
    room_update: schemas.ConferenceRoomUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin) # FIX APPLIED
):
    db_room = await crud.update_conference_room(db, room_id, room_update)
    if not db_room:
        raise HTTPException(status_code=404, detail="Conference room not found")
    # 🚀 Fix: Refresh to get the latest updated_at timestamp
    await db.refresh(db_room)
    return db_room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a conference room (Admin only)")
async def delete_conference_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin) # FIX APPLIED
):
    deleted = await crud.delete_conference_room(db, room_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conference room not found")
    return # No content returned for 204


# ----------------------------------------------------------------------
# Room Booking Routes
# ----------------------------------------------------------------------

@router.post("/bookings", response_model=schemas.RoomBooking, summary="Book a conference room")
async def book_conference_room(
    booking: schemas.RoomBookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Books a conference room for the authenticated user."""

    room = await crud.get_conference_room(db, booking.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Conference room not found")

    # Time validation (Ensures consistency)
    # Convert 'now' to aware datetime for safe comparison with potential aware/unaware input
    now_utc = datetime.now(timezone.utc)
    
    # Ensure start_time is aware/coerced to UTC for comparison
    start_time_aware = booking.start_time
    if start_time_aware.tzinfo is None or start_time_aware.tzinfo.utcoffset(start_time_aware) is None:
        start_time_aware = booking.start_time.replace(tzinfo=timezone.utc) 

    if start_time_aware < now_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book a room in the past"
        )

    if booking.end_time <= booking.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )
    
    # 💥 CRITICAL FIX: Calculate Total Price
    # Calculate duration in days, rounding up to charge for the full last day
    time_diff = booking.end_time - booking.start_time
    total_seconds = time_diff.total_seconds()
    
    # Ensure a minimum duration of 1 second to avoid division by zero/zero cost.
    if total_seconds <= 0:
        total_days = 1
    else:
        # Calculate days, then use ceil to ensure any partial day is charged as a full day.
        # 86400 is the number of seconds in a day (24 * 3600).
        total_days = ceil(total_seconds / 86400)
    
    total_price = total_days * room.price_per_day
    # ------------------------------------------

    existing_booking = await crud.check_room_availability(
        db, booking.room_id, booking.start_time, booking.end_time
    )
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This room is already booked for the selected time slot."
        )

    try:
        # Pass the calculated total_price to the CRUD function
        db_booking = await crud.create_room_booking(
            db, 
            booking, 
            current_user.id,
            total_price=total_price # <--- Passed here
        )
        
        # 🚀 CRITICAL FIX: Refresh to get DB-generated timestamps (created_at/updated_at/id)
        await db.refresh(db_booking) 

        return schemas.RoomBooking.model_validate(db_booking) 
    
    except Exception as e:
        # Use repr(e) to get a detailed error string, but often the HTTPException detail 
        # is enough for a 500. We keep the explicit error message here for debugging.
        raise HTTPException(status_code=500, detail=f"Error creating booking: {e!r}")


@router.get("/bookings/my-bookings", response_model=List[schemas.RoomBooking], summary="Get current user's room bookings")
async def get_my_room_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bookings = await crud.get_user_bookings(db, current_user.id)
    # ✅ Use model_validate for robust serialization
    return [schemas.RoomBooking.model_validate(b) for b in bookings]


@router.get("/admin/bookings", response_model=List[schemas.RoomBooking], summary="Get all room bookings (Admin only)")
async def get_all_room_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin) # FIX APPLIED
):
    bookings = await crud.get_all_room_bookings(db)
    # ✅ Use model_validate for robust serialization
    return [schemas.RoomBooking.model_validate(b) for b in bookings]


@router.patch("/bookings/{booking_id}/status", response_model=schemas.RoomBooking, summary="Approve/Reject/Cancel a booking (Admin only)")
async def update_booking_status(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin) # FIX APPLIED
):
    valid_statuses = ["pending", "approved", "rejected", "cancelled"]
    if status_update.status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status_update.status}. Must be one of {valid_statuses}")

    db_booking = await crud.update_booking_status(db, booking_id, status_update.status)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # 🚀 Fix: Refresh to get the latest updated_at timestamp from the DB
    await db.refresh(db_booking) 
    
    return schemas.RoomBooking.model_validate(db_booking)


# ----------------------------------------------------------------------
# Control Number Update Endpoint 
# ----------------------------------------------------------------------
@router.patch("/bookings/{booking_id}/control-no", response_model=schemas.RoomBooking, summary="Set control number for a booking (Admin only)")
async def update_booking_control_no(
    booking_id: int,
    # Assuming you have a Pydantic schema for this, e.g., BookingControlNoUpdate
    control_no_update: schemas.BookingControlNoUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin) # FIX APPLIED
):
    # This calls the CRUD function to update the control_no field
    db_booking = await crud.update_booking_control_no(db, booking_id, control_no_update.control_no)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 🚀 Refresh to get the latest updated data
    await db.refresh(db_booking)

    return schemas.RoomBooking.model_validate(db_booking)
# ----------------------------------------------------------------------


@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Cancel a room booking (User/Admin)")
async def delete_room_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_booking = await crud.get_room_booking_by_id(db, booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if db_booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this booking.")

    deleted = await crud.delete_room_booking(db, booking_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete booking.")
    return # No content returned for 204


@router.get("/availability/{room_id}", summary="Check room availability")
async def check_room_availability(
    room_id: int,
    start_time: datetime,
    end_time: datetime,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    room = await crud.get_conference_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Conference room not found")

    conflicting_booking = await crud.check_room_availability(db, room_id, start_time, end_time)

    return {
        "room_id": room_id,
        "start_time": start_time,
        "end_time": end_time,
        "available": conflicting_booking is None,
        "conflicting_booking_id": conflicting_booking.id if conflicting_booking else None,
    }