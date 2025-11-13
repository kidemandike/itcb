from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, and_
from typing import Optional, List

import models
import schemas

# --- Course Registration CRUD Operations ---

async def create_course_registration(
    db: AsyncSession,
    registration: schemas.CourseRegistrationCreate,
    user_id: int,
    user_name: str,
    user_email: str,
    course_pk: int # Ensures the correct INTEGER type is stored
) -> models.CourseRegistration:
    """Creates a new course registration."""
    db_registration = models.CourseRegistration(
        user_id=user_id,
        user_name=user_name,
        user_email=user_email,
        
        course_id=course_pk, # Stores the INTEGER Primary Key
        
        course_name=registration.course_name,
        selected_schedule=registration.selected_schedule,
        selected_level=registration.selected_level,
        course_price=registration.course_price, # Expects string
        course_duration=registration.course_duration,
        instructor_name=registration.instructor_name,
        payment_status="Pending", 
        completion_status="In Progress",
        is_completed=False # Explicitly setting is_completed
    )
    db.add(db_registration)
    await db.commit()
    await db.refresh(db_registration)
    return db_registration

async def get_course_registration_by_id(db: AsyncSession, registration_id: int) -> models.CourseRegistration | None:
    """Fetches a course registration by its ID."""
    result = await db.execute(select(models.CourseRegistration).where(models.CourseRegistration.id == registration_id))
    return result.scalars().first()

async def get_course_registration_by_user_and_course(
    db: AsyncSession,
    user_id: int,
    course_pk: int, # Correctly expects the INTEGER Primary Key
    selected_schedule: str
) -> models.CourseRegistration | None:
    """
    Fetches a course registration by user ID, course (PK) and selected schedule.
    """
    result = await db.execute(
        select(models.CourseRegistration).where(
            and_(
                models.CourseRegistration.user_id == user_id,
                models.CourseRegistration.course_id == course_pk, 
                models.CourseRegistration.selected_schedule == selected_schedule
            )
        )
    )
    return result.scalars().first()

async def get_all_course_registrations(db: AsyncSession) -> list[models.CourseRegistration]:
    """Fetches all course registrations."""
    result = await db.execute(select(models.CourseRegistration))
    return list(result.scalars().all())

async def get_user_course_registrations(db: AsyncSession, user_id: int) -> list[models.CourseRegistration]:
    """Fetches all course registrations for a specific user."""
    result = await db.execute(select(models.CourseRegistration).where(models.CourseRegistration.user_id == user_id))
    return list(result.scalars().all())

async def get_registrations_by_course_id(db: AsyncSession, course_pk: int) -> list[models.CourseRegistration]:
    """Fetches all registrations for a specific course (using course primary key)."""
    result = await db.execute(
        select(models.CourseRegistration).where(models.CourseRegistration.course_id == course_pk)
    )
    return list(result.scalars().all())


async def update_course_registration_status(
    db: AsyncSession,
    registration_id: int,
    status_update: schemas.CourseRegistrationUpdateStatus
) -> models.CourseRegistration | None:
    """Updates the payment status of a course registration."""
    db_registration = await get_course_registration_by_id(db, registration_id)
    if not db_registration:
        return None
    db_registration.payment_status = status_update.payment_status
    await db.commit()
    await db.refresh(db_registration)
    return db_registration

async def update_course_registration_completion(
    db: AsyncSession,
    registration_id: int,
    completion_update: schemas.CourseRegistrationUpdateCompletion
) -> models.CourseRegistration | None:
    """Updates the completion status of a course registration."""
    db_registration = await get_course_registration_by_id(db, registration_id)
    if not db_registration:
        return None
    
    db_registration.completion_status = completion_update.completion_status 
    
    # Optionally update the boolean flag based on the string status
    if completion_update.completion_status in ["Completed", "Failed"]:
        db_registration.is_completed = True
    else:
        db_registration.is_completed = False

    await db.commit()
    await db.refresh(db_registration)
    return db_registration

async def update_registration_control_no(
    db: AsyncSession,
    db_registration: models.CourseRegistration,
    control_no: str
) -> models.CourseRegistration:
    """Updates the control number for a given course registration."""
    db_registration.control_no = control_no
    await db.commit()
    await db.refresh(db_registration)
    return db_registration

async def delete_course_registration(db: AsyncSession, registration_id: int) -> bool:
    """Deletes a course registration by its ID."""
    result = await db.execute(delete(models.CourseRegistration).where(models.CourseRegistration.id == registration_id))
    await db.commit()
    return result.rowcount > 0