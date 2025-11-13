from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, update
from sqlalchemy.orm import joinedload
from datetime import datetime, timezone
from typing import Optional, List

import models
import schemas
import engineering_schemas 
from engineering_schemas import (
    DrivingCourseCreate, 
    DrivingCourseUpdate, 
    DrivingApplicationCreate,
    DrivingApplicationResponse, 
)

# ----------------------------------------------------------------------
# --- Driving Course CRUD Operations ---
# ----------------------------------------------------------------------

async def create_driving_course(
    db: AsyncSession, 
    course: DrivingCourseCreate,
    created_by: int
) -> models.DrivingCourse:
    """Creates a new driving course, ensuring dates are timezone-naive."""
    
    # Convert Pydantic object to a dictionary for modification
    course_data = course.model_dump()

    # --- TIMEZONE FIX IMPLEMENTED HERE ---
    
    # Check and strip timezone from start_date
    start_date = course_data["start_date"]
    if start_date and start_date.tzinfo is not None:
        # Convert to UTC before stripping, then strip timezone info
        naive_start_date = start_date.astimezone(timezone.utc).replace(tzinfo=None)
        course_data["start_date"] = naive_start_date
    
    # Check and strip timezone from end_date
    end_date = course_data["end_date"]
    if end_date and end_date.tzinfo is not None:
        # Convert to UTC before stripping, then strip timezone info
        naive_end_date = end_date.astimezone(timezone.utc).replace(tzinfo=None)
        course_data["end_date"] = naive_end_date
        
    # --- END TIMEZONE FIX ---

    # Instantiate the database model using the cleaned dictionary
    db_course = models.DrivingCourse(
        course_name=course_data["course_name"],
        course_type=course_data["course_type"],
        start_date=course_data["start_date"],
        end_date=course_data["end_date"],
        duration=course_data["duration"],
        price=course_data["price"],
        quarter=course_data["quarter"],
        year=course_data["year"],
        created_by=created_by
    )
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    return db_course

async def get_driving_courses(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> List[models.DrivingCourse]:
    """Retrieves all driving courses with pagination."""
    result = await db.execute(
        select(models.DrivingCourse)
        .offset(skip)
        .limit(limit)
        .order_by(models.DrivingCourse.created_at.desc())
    )
    return result.scalars().all()

async def get_driving_course(
    db: AsyncSession, 
    course_id: int
) -> models.DrivingCourse | None:
    """Fetches a driving course by its ID."""
    result = await db.execute(
        select(models.DrivingCourse)
        .where(models.DrivingCourse.id == course_id)
    )
    return result.scalars().first()

async def get_available_driving_courses(db: AsyncSession) -> List[models.DrivingCourse]:
    """Retrieves all available driving courses (end_date >= current date)."""
    result = await db.execute(
        select(models.DrivingCourse)
        .where(models.DrivingCourse.end_date >= datetime.utcnow())
        .where(models.DrivingCourse.is_active == True)
        .order_by(models.DrivingCourse.start_date.asc())
    )
    return result.scalars().all()

async def update_driving_course(
    db: AsyncSession, 
    course_id: int, 
    course_update: DrivingCourseUpdate
) -> models.DrivingCourse | None:
    """Updates a driving course."""
    db_course = await get_driving_course(db, course_id)
    if not db_course:
        return None
        
    update_data = course_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        # Optional: Add timezone stripping here if the update schema allows dates
        if field in ["start_date", "end_date"] and value and value.tzinfo is not None:
             value = value.astimezone(timezone.utc).replace(tzinfo=None)
             
        setattr(db_course, field, value)
        
    await db.commit()
    await db.refresh(db_course)
    return db_course

async def delete_driving_course(db: AsyncSession, course_id: int) -> bool:
    """Deletes a driving course by its ID."""
    db_course = await get_driving_course(db, course_id)
    if not db_course:
        return False
        
    await db.delete(db_course)
    await db.commit()
    return True

# ----------------------------------------------------------------------
# --- Driving Application CRUD Operations ---
# ----------------------------------------------------------------------

async def create_driving_application(
    db: AsyncSession, 
    application: DrivingApplicationCreate,
    user_id: int = None
) -> models.DrivingApplication:
    """Creates a new driving application."""
    db_application = models.DrivingApplication(
        course_id=application.course_id,
        student_full_name=application.student_full_name,
        phone_number=application.phone_number,
        user_id=user_id
    )
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    
    # Eagerly load the course, user, and issuer relationships before returning
    result = await db.execute(
        select(models.DrivingApplication)
        .options(
            joinedload(models.DrivingApplication.course),
            joinedload(models.DrivingApplication.user),
            joinedload(models.DrivingApplication.issuer)
        )
        .where(models.DrivingApplication.id == db_application.id)
    )
    return result.scalars().first()

async def get_driving_applications(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> List[models.DrivingApplication]:
    """Retrieves all driving applications with pagination. Added eager loading."""
    result = await db.execute(
        select(models.DrivingApplication)
        .options(
            joinedload(models.DrivingApplication.course),
            joinedload(models.DrivingApplication.user),
            joinedload(models.DrivingApplication.issuer)
        )
        .offset(skip)
        .limit(limit)
        .order_by(models.DrivingApplication.application_date.desc())
    )
    return result.scalars().all()

async def get_driving_application(
    db: AsyncSession, 
    application_id: int
) -> models.DrivingApplication | None:
    """Fetches a driving application by its ID. Added eager loading."""
    result = await db.execute(
        select(models.DrivingApplication)
        .options(
            joinedload(models.DrivingApplication.course),
            joinedload(models.DrivingApplication.user),
            joinedload(models.DrivingApplication.issuer)
        )
        .where(models.DrivingApplication.id == application_id)
    )
    return result.scalars().first()

async def get_driving_applications_by_course(
    db: AsyncSession, 
    course_id: int
) -> List[models.DrivingApplication]:
    """Fetches all driving applications for a specific course. Added eager loading."""
    result = await db.execute(
        select(models.DrivingApplication)
        .options(
            joinedload(models.DrivingApplication.course),
            joinedload(models.DrivingApplication.user),
            joinedload(models.DrivingApplication.issuer)
        )
        .where(models.DrivingApplication.course_id == course_id)
        .order_by(models.DrivingApplication.application_date.desc())
    )
    return result.scalars().all()

async def get_driving_applications_by_user(db: AsyncSession, user_id: int) -> List[models.DrivingApplication]:
    """Fetches all driving applications for a specific user. Added eager loading."""
    result = await db.execute(
        select(models.DrivingApplication)
        .options(
            joinedload(models.DrivingApplication.course),
            joinedload(models.DrivingApplication.user),
            joinedload(models.DrivingApplication.issuer)
        )
        .where(models.DrivingApplication.user_id == user_id)
        .order_by(models.DrivingApplication.application_date.desc())
    )
    return result.scalars().all()

async def update_driving_application(
    db: AsyncSession, 
    application_id: int, 
    update_data: dict
) -> models.DrivingApplication | None:
    """Updates a driving application with provided data."""
    # get_driving_application is used, which already performs eager loading
    db_application = await get_driving_application(db, application_id)
    if not db_application:
        return None
        
    for field, value in update_data.items():
        # Ensure any updated datetime fields are stripped of timezone before setting
        if isinstance(value, datetime) and value.tzinfo is not None:
            value = value.astimezone(timezone.utc).replace(tzinfo=None)
            
        setattr(db_application, field, value)
        
    await db.commit()
    await db.refresh(db_application)
    return db_application

async def bulk_update_application_status(
    db: AsyncSession, 
    application_ids: List[int], 
    status: str
) -> List[models.DrivingApplication]:
    """Bulk updates the application status for multiple driving applications."""
    # Perform the bulk update query
    update_statement = (
        update(models.DrivingApplication)
        .where(models.DrivingApplication.id.in_(application_ids))
        .values(application_status=status)
    )
    
    await db.execute(update_statement)
    await db.commit()
    
    # Re-fetch the updated records with eager loading to return to the router
    result = await db.execute(
        select(models.DrivingApplication)
        .options(
            joinedload(models.DrivingApplication.course),
            joinedload(models.DrivingApplication.user),
            joinedload(models.DrivingApplication.issuer)
        )
        .where(models.DrivingApplication.id.in_(application_ids))
    )
    return result.scalars().all()

async def get_pending_certificate_requests(db: AsyncSession) -> List[models.DrivingApplication]:
    """Retrieves all pending certificate requests for driving courses. Added eager loading."""
    result = await db.execute(
        select(models.DrivingApplication)
        .options(
            joinedload(models.DrivingApplication.course),
            joinedload(models.DrivingApplication.user),
            joinedload(models.DrivingApplication.issuer)
        )
        .where(
            models.DrivingApplication.certificate_requested == True,
            models.DrivingApplication.certificate_issued == False
        )
        .order_by(models.DrivingApplication.certificate_request_date.desc())
    )
    return result.scalars().all()

async def generate_driving_school_reports(
    db: AsyncSession, 
    quarter: Optional[str] = None, 
    year: Optional[int] = None
) -> dict:
    """Generate driving school reports based on quarter and year. Eager loading added."""
    query = select(models.DrivingApplication).options(joinedload(models.DrivingApplication.course))
    
    # Apply filters if provided
    if quarter or year:
        # If filtering by course data, we need to join
        query = query.join(models.DrivingApplication.course)
        if quarter:
            query = query.where(models.DrivingCourse.quarter == quarter)
        if year:
            query = query.where(models.DrivingCourse.year == year)
    
    result = await db.execute(query)
    applications = result.scalars().all()
    
    # Calculate report data
    total_applications = len(applications)
    approved_applications = len([app for app in applications if app.application_status == "Approved"])
    completed_courses = len([app for app in applications if app.course_status == "Completed"])
    certificate_requests = len([app for app in applications if app.certificate_requested])
    issued_certificates = len([app for app in applications if app.certificate_issued])
    
    # Calculate total revenue (app.course.price is now safe to access)
    total_revenue = sum([
        app.course.price for app in applications 
        if app.application_status == "Approved" and app.course
    ])
    
    return {
        "total_applications": total_applications,
        "approved_applications": approved_applications,
        "completed_courses": completed_courses,
        "certificate_requests": certificate_requests,
        "issued_certificates": issued_certificates,
        "total_revenue": total_revenue,
        "quarter": quarter,
        "year": year
    }