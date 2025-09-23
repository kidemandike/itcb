from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from models import Course, Instructor, CourseRegistration, LevelEnum
from database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === CRUD Courses ===
@router.post("/admin/add_course")
def add_course(
    title: str = Form(...),
    description: str = Form(""),
    duration: int = Form(...),
    price: float = Form(...),
    level: LevelEnum = Form(...),
    instructor_id: int = Form(...),
    db: Session = Depends(get_db)
):
    new_course = Course(
        title=title, description=description, duration=duration,
        price=price, level=level, instructor_id=instructor_id
    )
    db.add(new_course)
    db.commit()
    return {"message": "Course added"}

@router.get("/courses")
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

# === Instructors ===
@router.post("/admin/add_instructor")
def add_instructor(name: str = Form(...), db: Session = Depends(get_db)):
    instructor = Instructor(name=name)
    db.add(instructor)
    db.commit()
    return {"message": "Instructor added"}

@router.get("/instructors")
def list_instructors(db: Session = Depends(get_db)):
    return db.query(Instructor).all()

# === Register User to Course ===
@router.post("/register_course")
def register_course(user_id: int = Form(...), course_id: int = Form(...), db: Session = Depends(get_db)):
    existing = db.query(CourseRegistration).filter_by(user_id=user_id, course_id=course_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")
    registration = CourseRegistration(user_id=user_id, course_id=course_id)
    db.add(registration)
    db.commit()
    return {"message": "Registered to course"}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime

# Import your actual models based on the schema you provided
from models import User, Course, CourseRegistration
from database import SessionLocal
from schemas import (
    CourseCreate, CourseOut, 
    CourseRegistrationCreate, CourseRegistrationOut, CourseRegistrationUpdateStatus,
    RegistrationControlNoUpdate, UserOut, UserUpdate
)
from auth import get_current_user, get_current_admin_user, get_current_teacher_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === Course Management ===

@router.post("/courses/", response_model=CourseOut)
async def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)  # Only teachers can create courses
):
    """Create a new course (Teachers only)"""
    # Check if course_id already exists
    existing_course = db.query(Course).filter(Course.course_id == course.course_id).first()
    if existing_course:
        raise HTTPException(
            status_code=400,
            detail="Course ID already exists. Please choose a different course ID."
        )
    
    # Create course with instructor details from current user
    course_data = course.dict()
    course_data["instructor_id"] = current_user.id
    course_data["instructor_name"] = current_user.full_name
    
    db_course = Course(**course_data)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.get("/courses", response_model=List[CourseOut])
async def get_all_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available courses"""
    courses = db.query(Course).all()
    return courses

@router.get("/teacher/my-courses", response_model=List[CourseOut])
async def get_teacher_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get courses created by the current teacher"""
    courses = db.query(Course).filter(Course.instructor_id == current_user.id).all()
    return courses

# === Course Registration Management ===

@router.post("/courses/register", response_model=CourseRegistrationOut)
async def register_for_course(
    registration: CourseRegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register current user for a course"""
    # Find the course by course_id (string identifier)
    course = db.query(Course).filter(Course.course_id == registration.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user is already registered for this course
    existing_registration = db.query(CourseRegistration).filter(
        and_(
            CourseRegistration.user_id == current_user.id,
            CourseRegistration.course_id == course.id  # Use the actual course.id (integer)
        )
    ).first()
    
    if existing_registration:
        raise HTTPException(status_code=400, detail="You are already registered for this course")
    
    # Create registration
    registration_data = registration.dict()
    registration_data["user_id"] = current_user.id
    registration_data["user_name"] = current_user.full_name
    registration_data["user_email"] = current_user.email
    registration_data["course_id"] = course.id  # Use the actual course.id
    
    db_registration = CourseRegistration(**registration_data)
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    return db_registration

@router.get("/users/{user_id}/registrations", response_model=List[CourseRegistrationOut])
async def get_user_registrations(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get registrations for a specific user"""
    # Users can only view their own registrations, admins can view any
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these registrations")
    
    registrations = db.query(CourseRegistration).filter(
        CourseRegistration.user_id == user_id
    ).all()
    
    return registrations

@router.get("/teacher/courses/{course_id}/registrations", response_model=List[CourseRegistrationOut])
async def get_course_registrations(
    course_id: str,  # This is the course_id string, not the database id
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher_user)
):
    """Get all registrations for a specific course (Teachers only)"""
    # Find the course and verify teacher ownership
    course = db.query(Course).filter(
        and_(
            Course.course_id == course_id,
            Course.instructor_id == current_user.id
        )
    ).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    
    # Get registrations for this course
    registrations = db.query(CourseRegistration).filter(
        CourseRegistration.course_id == course.id
    ).all()
    
    return registrations

# === Admin Endpoints ===

@router.get("/admin/users", response_model=List[UserOut])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all users (Admin only)"""
    users = db.query(User).all()
    return users

@router.get("/admin/registrations", response_model=List[CourseRegistrationOut])
async def get_all_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all course registrations (Admin only)"""
    registrations = db.query(CourseRegistration).all()
    return registrations

@router.patch("/admin/registrations/{registration_id}/status", response_model=CourseRegistrationOut)
async def update_registration_payment_status(
    registration_id: int,
    status_update: CourseRegistrationUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update payment status of a registration (Admin only)"""
    registration = db.query(CourseRegistration).filter(
        CourseRegistration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    registration.payment_status = status_update.payment_status
    db.commit()
    db.refresh(registration)
    
    return registration

@router.patch("/admin/registrations/{registration_id}/control_no", response_model=CourseRegistrationOut)
async def update_registration_control_no(
    registration_id: int,
    control_update: RegistrationControlNoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update control number of a registration (Admin only)"""
    registration = db.query(CourseRegistration).filter(
        CourseRegistration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    registration.control_no = control_update.control_no
    db.commit()
    db.refresh(registration)
    
    return registration

@router.patch("/admin/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int,
    role_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update user role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from changing their own role (safety measure)
    if user.id == current_user.id and role_update.role != "admin":
        raise HTTPException(
            status_code=400, 
            detail="Cannot change your own admin role"
        )
    
    if role_update.role:
        user.role = role_update.role
    
    db.commit()
    db.refresh(user)
    
    return user

# === Additional Utility Endpoints ===

@router.get("/courses/{course_id}", response_model=CourseOut)
async def get_course_by_id(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific course by course_id"""
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course

@router.get("/registrations/{registration_id}", response_model=CourseRegistrationOut)
async def get_registration_by_id(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific registration by ID"""
    registration = db.query(CourseRegistration).filter(
        CourseRegistration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Users can only view their own registrations, admins and course instructors can view any
    if (current_user.role not in ["admin"] and 
        current_user.id != registration.user_id):
        # Check if current user is the instructor of the course
        course = db.query(Course).filter(Course.id == registration.course_id).first()
        if not course or course.instructor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this registration")
    
    return registration

# === Statistics Endpoints (Admin) ===

@router.get("/admin/stats")
async def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get system statistics (Admin only)"""
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_teachers = db.query(User).filter(User.role == "teacher").count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    
    total_courses = db.query(Course).count()
    total_registrations = db.query(CourseRegistration).count()
    pending_payments = db.query(CourseRegistration).filter(
        CourseRegistration.payment_status == "Pending"
    ).count()
    paid_registrations = db.query(CourseRegistration).filter(
        CourseRegistration.payment_status == "Paid"
    ).count()
    
    return {
        "users": {
            "total": total_users,
            "students": total_students,
            "teachers": total_teachers,
            "admins": total_admins
        },
        "courses": {
            "total": total_courses
        },
        "registrations": {
            "total": total_registrations,
            "pending_payments": pending_payments,
            "paid": paid_registrations,
            "success_rate": round((paid_registrations / total_registrations * 100) if total_registrations > 0 else 0, 2)
        }
    }