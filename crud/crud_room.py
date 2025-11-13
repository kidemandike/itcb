from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, and_
from datetime import datetime
from typing import Optional, List

import models
import schemas

# --- Conference Room CRUD Operations ---

async def get_conference_room(db: AsyncSession, room_id: int) -> models.ConferenceRoom | None:
    """Fetches a single conference room by its ID."""
    result = await db.execute(select(models.ConferenceRoom).where(models.ConferenceRoom.id == room_id))
    return result.scalars().first()

async def get_conference_room_by_name(db: AsyncSession, name: str) -> models.ConferenceRoom | None:
    """Fetches a single conference room by its name."""
    result = await db.execute(select(models.ConferenceRoom).where(models.ConferenceRoom.name == name))
    return result.scalars().first()

async def get_conference_rooms(db: AsyncSession) -> list[models.ConferenceRoom]:
    """Retrieves all conference room records."""
    result = await db.execute(select(models.ConferenceRoom))
    return list(result.scalars().all())

async def create_conference_room(db: AsyncSession, room: schemas.ConferenceRoomCreate) -> models.ConferenceRoom:
    """Creates a new conference room."""
    db_room = models.ConferenceRoom(**room.model_dump())
    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    return db_room

async def update_conference_room(
    db: AsyncSession, 
    room_id: int, 
    room_update: schemas.ConferenceRoomUpdate
) -> models.ConferenceRoom | None:
    """Updates an existing conference room."""
    db_room = await get_conference_room(db, room_id)
    if not db_room:
        return None

    update_data = room_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_room, key, value)
    
    await db.commit()
    await db.refresh(db_room)
    return db_room

async def delete_conference_room(db: AsyncSession, room_id: int) -> bool:
    """Deletes a conference room by its ID."""
    result = await db.execute(delete(models.ConferenceRoom).where(models.ConferenceRoom.id == room_id))
    await db.commit()
    return result.rowcount > 0

# --- Room Booking CRUD Operations ---

async def create_room_booking(
    db: AsyncSession, 
    booking: schemas.RoomBookingCreate, 
    user_id: int,
    total_price: float 
) -> models.RoomBooking:
    """Creates a new room booking."""
    db_booking = models.RoomBooking(
        user_id=user_id,
        status="pending", # Default status
        total_price=total_price, 
        **booking.model_dump()
    )
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

async def get_room_booking_by_id(db: AsyncSession, booking_id: int) -> models.RoomBooking | None:
    """Fetches a single room booking by its ID."""
    result = await db.execute(select(models.RoomBooking).where(models.RoomBooking.id == booking_id))
    return result.scalars().first()

async def get_all_room_bookings(db: AsyncSession) -> list[models.RoomBooking]:
    """Retrieves all room bookings."""
    result = await db.execute(select(models.RoomBooking))
    return list(result.scalars().all())

async def get_user_bookings(db: AsyncSession, user_id: int) -> list[models.RoomBooking]:
    """Retrieves all room bookings for a specific user."""
    result = await db.execute(select(models.RoomBooking).where(models.RoomBooking.user_id == user_id))
    return list(result.scalars().all())

async def check_room_availability(
    db: AsyncSession, 
    room_id: int, 
    start_time: datetime, 
    end_time: datetime
) -> models.RoomBooking | None:
    """Checks for any conflicting bookings for the specified room and time range."""
    
    conflict_condition = and_(
        models.RoomBooking.room_id == room_id,
        models.RoomBooking.end_time > start_time,
        models.RoomBooking.start_time < end_time,
        models.RoomBooking.status.in_(["pending", "approved"]) 
    )
    
    result = await db.execute(select(models.RoomBooking).where(conflict_condition))
    return result.scalars().first()

async def update_booking_status(
    db: AsyncSession, 
    booking_id: int, 
    status_str: str
) -> models.RoomBooking | None:
    """Updates the status of a room booking."""
    db_booking = await get_room_booking_by_id(db, booking_id)
    if not db_booking:
        return None
    db_booking.status = status_str
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

async def update_booking_control_no(
    db: AsyncSession, 
    booking_id: int, 
    control_no: str
) -> models.RoomBooking | None:
    """
    Updates the control number for a given room booking.
    Fetches the booking by ID first.
    """
    db_booking = await get_room_booking_by_id(db, booking_id)
    
    if not db_booking:
        return None 
        
    db_booking.control_no = control_no
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

async def delete_room_booking(db: AsyncSession, booking_id: int) -> bool:
    """Deletes a room booking by its ID."""
    result = await db.execute(delete(models.RoomBooking).where(models.RoomBooking.id == booking_id))
    await db.commit()
    return result.rowcount > 0