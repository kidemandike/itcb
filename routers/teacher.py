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
    course_id: int,  # This path parameter must be an integer
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
    
# ----------------------------------------------------------------------
#                         COURSE REGISTRATION ENDPOINT
# ----------------------------------------------------------------------
@router.post(
    "/register", 
    response_model=schemas.CourseRegistrationOut, 
    status_code=status.HTTP_201_CREATED, 
    summary="Register current user for a course"
)
async def register_course(
    registration: schemas.CourseRegistrationCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Allows an authenticated user to register for a course.
    This endpoint finds the course by its unique string `course_id`
    and creates a new registration using the course's integer primary key.
    """
    # 1. Authorize user role
    if current_user.role not in ["student", "user", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to register for courses.")
    
    # 2. Find the course by its unique string course_id
    course = await crud.get_course_by_course_id(db, course_id=registration.course_id)
    if not course:
        raise HTTPException(status_code=404, detail=f"Course with ID {registration.course_id} not found.")

    # 3. Check for existing registration to prevent duplicates
    existing_registration = await crud.get_course_registration_by_user_and_course(
        db, current_user.id, course.id, registration.selected_schedule
    )
    if existing_registration:
        raise HTTPException(status_code=409, detail="You are already registered for this course and schedule.")

    try:
        # 4. Create the new registration record (force course.id as PK)
        db_registration = await crud.create_course_registration(
            db=db,
            registration=registration,
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_email=current_user.email,
            course_pk=course.id  # pass actual integer PK
        )
        return schemas.CourseRegistrationOut.from_orm(db_registration)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
