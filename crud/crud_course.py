from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import Optional, List

import models
import schemas

# --- Course CRUD Operations ---

async def get_all_courses(db: AsyncSession) -> list[models.Course]:
    """Retrieves all course records."""
    result = await db.execute(select(models.Course))
    return list(result.scalars().all())

async def get_course_by_id(db: AsyncSession, course_id: int) -> models.Course | None:
    """Fetches a course by its integer primary key (id)."""
    result = await db.execute(select(models.Course).where(models.Course.id == course_id))
    return result.scalars().first()

async def get_course_by_code(db: AsyncSession, course_code: str) -> models.Course | None:
    """Fetches a course by its unique string code (course_id)."""
    result = await db.execute(select(models.Course).where(models.Course.course_id == course_code))
    return result.scalars().first()

async def get_courses_by_instructor_id(db: AsyncSession, instructor_id: int) -> list[models.Course]:
    """Fetches courses assigned to a specific instructor (teacher)."""
    result = await db.execute(
        select(models.Course).where(models.Course.instructor_id == instructor_id)
    )
    return list(result.scalars().all())

async def get_courses_by_department_name(db: AsyncSession, department_name: str) -> list[models.Course]:
    """
    Retrieves all courses where the instructor belongs to the specified department.
    """
    department_name_lower = department_name.lower()
    stmt = (
        select(models.Course)
        .join(models.User, models.Course.instructor_id == models.User.id)
        .join(models.Department, models.User.department_id == models.Department.id)
        .filter(models.Department.name.ilike(department_name_lower))
        .options(joinedload(models.Course.instructor))
    )
    
    result = await db.execute(stmt)
    return result.scalars().unique().all()


async def get_course_by_id_and_instructor(db: AsyncSession, course_id: int, instructor_id: int) -> Optional[models.Course]:
    """
    Retrieves a Course by its primary key (id) AND verifies it is taught by 
    the given instructor_id.
    """
    stmt = select(models.Course).where(
        models.Course.id == course_id,
        models.Course.instructor_id == instructor_id
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def create_course(
    db: AsyncSession, 
    course: schemas.CourseCreate, 
    instructor_id: int, 
    instructor_name: str
) -> models.Course:
    """Creates a new course record in the database."""
    
    course_data = course.model_dump()
    course_data["instructor_id"] = instructor_id
    course_data["instructor_name"] = instructor_name
    
    db_course = models.Course(**course_data)
    
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    
    return db_course