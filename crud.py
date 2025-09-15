# crud.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, and_ # Ensure 'and_' is imported

# Corrected imports (assuming direct import from project root)
import models
import schemas
from auth import get_password_hash # get_password_hash is defined in auth.py

# --- User CRUD Operations ---

async def get_user_by_email(db: AsyncSession, email: str) -> models.User | None:
    """Fetches a user by their email address."""
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> models.User | None:
    """Fetches a user by their ID."""
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalars().first()

async def get_all_users(db: AsyncSession) -> list[models.User]:
    """Fetches all users from the database."""
    result = await db.execute(select(models.User))
    return list(result.scalars().all())

async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
    """Creates a new user in the database."""
    hashed_password = get_password_hash(user.password)
    full_name = f"{user.first_name} {user.last_name}".strip() if user.first_name and user.last_name else user.full_name

    db_user = models.User(
        full_name=full_name,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_password,
        is_active=True,
        role=user.role # NEW: Save the role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user_id: int, user_update: schemas.UserUpdate) -> models.User | None:
    """Updates an existing user's information."""
    db_user = await get_user_by_id(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True) # For Pydantic v2.x, use .dict(exclude_unset=True) for v1.x

    for key, value in update_data.items():
        setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user

async def delete_user(db: AsyncSession, user_id: int) -> bool:
    """Deletes a user by their ID."""
    result = await db.execute(delete(models.User).where(models.User.id == user_id))
    await db.commit()
    return result.rowcount > 0

# --- Course Registration CRUD Operations ---

async def create_course_registration(
    db: AsyncSession,
    registration: schemas.CourseRegistrationCreate,
    user_id: int,
    user_name: str,
    user_email: str
) -> models.CourseRegistration:
    """Creates a new course registration."""
    db_registration = models.CourseRegistration(
        user_id=user_id,
        user_name=user_name,
        user_email=user_email,
        course_id=registration.course_id,
        course_name=registration.course_name,
        selected_schedule=registration.selected_schedule,
        selected_level=registration.selected_level,
        course_price=registration.course_price,
        course_duration=registration.course_duration,
        instructor_name=registration.instructor_name,
        payment_status="Pending", # Default status
        is_completed=False # Default completion status
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
    course_id: str,
    selected_schedule: str
) -> models.CourseRegistration | None:
    """
    Fetches a course registration by user ID, course ID, and selected schedule.
    This helps prevent duplicate registrations for the same course and schedule.
    """
    result = await db.execute(
        select(models.CourseRegistration).where(
            and_(
                models.CourseRegistration.user_id == user_id,
                models.CourseRegistration.course_id == course_id,
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
    db_registration.is_completed = completion_update.is_completed
    await db.commit()
    await db.refresh(db_registration)
    return db_registration

# NEW: Function to update control number for a registration
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
