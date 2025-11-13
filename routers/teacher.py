from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

# Import your Pydantic schemas, CRUD operations, and dependencies
import schemas
import crud
import models
from database import get_db
from auth import get_current_user

# Initialize the APIRouter for this module
router = APIRouter(
    prefix="/teacher",
    tags=["Teacher"],
)

# A dependency to check if the current user is a teacher or an admin
async def get_current_teacher(current_user: models.User = Depends(get_current_user)):
    """
    Dependency to check if the user has a 'teacher' or 'admin' role.
    """
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Teacher or Admin privileges required"
        )
    return current_user

# ----------------------------------------------------------------------
#                         TEACHER-SPECIFIC ENDPOINTS
# ----------------------------------------------------------------------

@router.post(
    "/courses",
    response_model=schemas.CourseOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course"
)
async def create_course_for_teacher(
    course: schemas.CourseBase,
    current_teacher: models.User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new course and assigns it to the current authenticated teacher.
    """
    try:
        # Check if course with same unique identifier/name already exists if necessary,
        # otherwise rely on database constraints or crud logic.
        
        # Create the new course using the CRUD function, passing the teacher's ID
        new_course = await crud.create_course(
            db=db, 
            course=course, 
            instructor_id=current_teacher.id,
            instructor_name=current_teacher.full_name
        )
        return schemas.CourseOut.from_orm(new_course)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the course: {str(e)}"
        )


@router.get(
    "/my-courses",
    response_model=List[schemas.CourseOut],
    summary="Get all courses taught by the current teacher"
)
async def get_teacher_courses(
    current_teacher: models.User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a list of all courses assigned to the authenticated teacher.
    """
    courses = await crud.get_courses_by_instructor_id(db, instructor_id=current_teacher.id)
    return [schemas.CourseOut.from_orm(course) for course in courses]


@router.get(
    "/courses/{course_id}/registrations",
    response_model=List[schemas.CourseRegistrationOut],
    summary="Get all student registrations for a specific course taught by the teacher"
)
async def get_course_registrations_by_teacher(
    course_id: int, 
    current_teacher: models.User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a list of student registrations for a given course.
    Verifies that the authenticated teacher is the instructor of the course.
    """
    # 1. Use the integer PK to find the course and verify the instructor
    course = await crud.get_course_by_id_and_instructor(db, course_id=course_id, instructor_id=current_teacher.id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or you do not have permission to view its registrations."
        )
    
    # 2. Get the registrations for this specific course using the numeric PK
    registrations = await crud.get_registrations_by_course_id(db, course.id)
    
    # 3. Return the list of registrations
    return [schemas.CourseRegistrationOut.from_orm(reg) for reg in registrations]
    
