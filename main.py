import os
from datetime import timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, APIRouter 
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List


import schemas
import crud 
import models
from database import engine, get_db, close_db 
from auth import (
    create_access_token,
    get_current_user, # ⭐ Necessary for most protected routes
    verify_password,
    get_password_hash
)

from routers import teacher, conference_rooms, department, certificate_application
from routers.driving import router as driving_router

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Access token expiration from environment, default to 30 minutes
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Initialize FastAPI app
app = FastAPI(
    title="ITCB Training Center Backend",
    description="FastAPI backend for Flutter authentication, user management, and course registration.",
    version="1.0.0",
)

# --- CORS Middleware Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:54848",
        "http://127.0.0.1:54848",
        "http://localhost:61343", 
        "http://127.0.0.1:61343",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- Database Initialization on Startup ---
@app.on_event("startup")
async def on_startup():
    """Initialize database tables on application startup"""
    try:
        # Asynchronously create all database tables defined in models.py
        async with engine.begin() as conn:
            # This will create tables if they don't exist
            await conn.run_sync(models.Base.metadata.create_all)
        print("✅ Database tables created/checked successfully.")
    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        raise

# --- Database Cleanup on Shutdown ---
@app.on_event("shutdown")
async def on_shutdown():
    """Close database connections on application shutdown"""
    try:
        await close_db()
        print("✅ Database connections closed successfully.")
    except Exception as e:
        print(f"❌ Error during database cleanup: {e}")

# --- Include Your Routers ---
app.include_router(teacher.router)
app.include_router(conference_rooms.router)
app.include_router(department.router) 
app.include_router(certificate_application.router)
app.include_router(driving_router)


# --- Dependency for Admin User Authentication ---
async def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Admin privileges required"
        )
    return current_user

# ----------------------------------------------------
#               API ENDPOINTS
# ----------------------------------------------------

# --- Root Endpoint ---
@app.get("/", summary="API Health Check")
async def root():
    """Health check endpoint to verify API is running"""
    return {
        "status": "online",
        "message": "ITCB Training Center Backend API",
        "version": "1.0.0"
    }

# --- AUTHENTICATION ROUTES ---

@app.post("/register", response_model=schemas.AuthResult, summary="Register a new user")
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new user with the provided details.
    Assigns 'student' role by default.
    """
    db_user = await crud.get_user_by_email(db, email=user.email)
    if db_user:
        return schemas.AuthResult(success=False, message="Email already registered.")

    # Assign default role 'student' if not provided
    user.role = user.role if user.role else "student"

    new_user = await crud.create_user(db=db, user=user)
    
    # Refresh to get auto-generated fields
    await db.refresh(new_user)
    
    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Convert SQLAlchemy model to dictionary for validation
    user_dict = {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "phone": new_user.phone,
        "is_active": new_user.is_active,
        "role": new_user.role,
        "created_at": new_user.created_at,
    }
    
    user_out = schemas.UserOut.model_validate(user_dict)

    return schemas.AuthResult(
        success=True,
        message="Registration successful!",
        access_token=access_token,
        user=user_out
    )

@app.post("/login", response_model=schemas.AuthResult, summary="Authenticate user and get access token")
async def login_for_access_token(user_login: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticates a user with email and password.
    Returns an access token and user details on successful login.
    """
    user = await crud.get_user_by_email(db, email=user_login.email)
    if not user or not verify_password(user_login.password, user.hashed_password):
        return schemas.AuthResult(success=False, message="Incorrect email or password.")

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # ⭐ FIX: Convert SQLAlchemy model to dictionary before validation
    user_dict = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "is_active": user.is_active,
        "role": user.role,
        "created_at": user.created_at,
    }
    
    # ⭐ FIX: Use model_validate on the dictionary
    user_out = schemas.UserOut.model_validate(user_dict)

    return schemas.AuthResult(
        success=True,
        message="Login successful!",
        access_token=access_token,
        user=user_out
    )

@app.get("/me", response_model=schemas.AuthResult, summary="Get current authenticated user's profile")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    Retrieves the profile information of the currently authenticated user.
    """
    # Convert SQLAlchemy model to dictionary for validation
    user_dict = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "is_active": current_user.is_active,
        "role": current_user.role,
        "created_at": current_user.created_at,
    }
    
    user_out = schemas.UserOut.model_validate(user_dict)

    return schemas.AuthResult(
        success=True,
        message="User data retrieved successfully.",
        user=user_out
    )

# --- PASSWORD RESET ROUTES (Simulated for simplicity) ---

@app.post("/forgot-password", response_model=schemas.AuthResult, summary="Simulate sending password reset link")
async def forgot_password(request: schemas.ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Simulates the process of sending a password reset link to the user's email.
    """
    user = await crud.get_user_by_email(db, email=request.email)
    if user:
        print(f"Simulated: Sent reset link to {user.email}")
    else:
        print(f"Simulated: Attempted reset for unregistered email {request.email}")

    # Always return success to prevent email enumeration attacks
    return schemas.AuthResult(success=True, message="If your email is registered, a password reset link has been sent.")

@app.post("/reset-password", response_model=schemas.AuthResult, summary="Simulate password reset using token")
async def reset_password(request: schemas.ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Simulates resetting a user's password using a provided reset token and new password.
    """
    user = await crud.get_user_by_email(db, email=request.email)
    if not user or request.reset_token != "dummy_reset_token":
        return schemas.AuthResult(success=False, message="Invalid email or reset token.")

    user.hashed_password = get_password_hash(request.new_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return schemas.AuthResult(success=True, message="Password has been reset successfully!")

# --- COURSE ROUTES ---

@app.get("/courses", response_model=List[schemas.CourseOut], summary="Get all available courses")
async def get_all_courses_list(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves a list of all courses available in the system.
    """
    courses = await crud.get_all_courses(db) 
    return [schemas.CourseOut.model_validate(course.__dict__) for course in courses]

@app.get("/courses/department/{department_name}", response_model=List[schemas.CourseOut], summary="Get courses by department name")
async def get_courses_by_department_list(
    department_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves a list of courses associated with a specific department.
    Used by department staff dashboards (Engineering, ICE, Language Studies).
    """
    # Authorization: Only allow staff/admin roles to query departmental course data
    authorized_roles = ["admin", "engineering_staff", "ice_staff", "language_staff"]
    if current_user.role not in authorized_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access departmental courses.")

    # Calls the new CRUD function to fetch filtered courses
    courses = await crud.get_courses_by_department_name(db, department_name=department_name) 
    
    # Return an empty list if no courses are found for the department
    return [schemas.CourseOut.model_validate(course.__dict__) for course in courses]

# --- STUDENT COURSE REGISTRATION ROUTES ---

@app.post("/courses/register", response_model=schemas.CourseRegistrationOut, status_code=status.HTTP_201_CREATED, summary="Register current user for a course")
async def register_course(
    registration: schemas.CourseRegistrationCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Allows an authenticated user (typically a student) to register for a course.
    """
    if current_user.role not in ["student", "user", "admin"]: 
        raise HTTPException(status_code=403, detail="Not authorized to register for courses.")

    # Convert course_id to integer
    try:
        course_pk_int = int(registration.course_id)
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid course ID format: '{registration.course_id}'. Must be a numeric identifier."
        )
    
    # Check if user already registered
    existing_registration = await crud.get_course_registration_by_user_and_course(
        db, 
        current_user.id, 
        course_pk_int,
        registration.selected_schedule
    )
    if existing_registration:
        raise HTTPException(status_code=409, detail="You are already registered for this course and schedule.")

    # Create registration
    db_registration = await crud.create_course_registration(
        db=db,
        registration=registration,
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_email=current_user.email,
        course_pk=course_pk_int
    )
    
    await db.refresh(db_registration)
    
    return schemas.CourseRegistrationOut.model_validate(db_registration.__dict__)

@app.get("/users/{user_id}/registrations", response_model=List[schemas.CourseRegistrationOut], summary="Get all course registrations for a specific user")
async def get_user_registrations(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves all course registrations for a specific user.
    """
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these registrations.")

    registrations = await crud.get_user_course_registrations(db, user_id=user_id)
    return [schemas.CourseRegistrationOut.model_validate(reg.__dict__) for reg in registrations]

# --- ADMIN-SPECIFIC ROUTES ---

@app.get("/admin/users", response_model=List[schemas.UserOut], summary="Get all users (Admin only)")
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user) 
):
    """
    Retrieves a list of all registered users. Requires admin privileges.
    """
    users = await crud.get_all_users(db)
    return [schemas.UserOut.model_validate(user.__dict__) for user in users]

@app.get("/admin/registrations", response_model=List[schemas.CourseRegistrationOut], summary="Get all course registrations (Admin only)")
async def get_all_registrations(
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user) 
):
    """
    Retrieves a list of all course registrations. Requires admin privileges.
    """
    registrations = await crud.get_all_course_registrations(db)
    return [schemas.CourseRegistrationOut.model_validate(reg.__dict__) for reg in registrations]

@app.patch("/admin/registrations/{registration_id}/status", response_model=schemas.CourseRegistrationOut, summary="Update payment status (Admin only)")
async def update_registration_payment_status(
    registration_id: int,
    status_update: schemas.CourseRegistrationUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates the payment status of a registration. Requires admin privileges.
    """
    db_registration = await crud.update_course_registration_status(db, registration_id, status_update)
    if not db_registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    await db.refresh(db_registration)
    return schemas.CourseRegistrationOut.model_validate(db_registration.__dict__)

@app.patch("/admin/registrations/{registration_id}/completion", response_model=schemas.CourseRegistrationOut, summary="Update completion status (Admin only)")
async def update_registration_completion_status(
    registration_id: int,
    completion_update: schemas.CourseRegistrationUpdateCompletion,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates the completion status of a registration. Requires admin privileges.
    """
    db_registration = await crud.update_course_registration_completion(db, registration_id, completion_update)
    if not db_registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    await db.refresh(db_registration)
    return schemas.CourseRegistrationOut.model_validate(db_registration.__dict__)

@app.patch("/admin/registrations/{registration_id}/control_no", response_model=schemas.CourseRegistrationOut, summary="Update control number (Admin only)")
async def update_registration_control_no(
    registration_id: int,
    control_no_update: schemas.RegistrationControlNoUpdate,
    db: AsyncSession = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates the control number for a registration. Requires admin privileges.
    """
    db_registration = await crud.get_course_registration_by_id(db, registration_id)
    if not db_registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    updated_registration = await crud.update_registration_control_no( 
        db, db_registration=db_registration, control_no=control_no_update.control_no
    )
    
    await db.refresh(updated_registration)
    return schemas.CourseRegistrationOut.model_validate(updated_registration.__dict__)

@app.delete("/admin/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a registration (Admin only)")
async def delete_registration(
    registration_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Deletes a course registration. Requires admin privileges.
    """
    deleted = await crud.delete_course_registration(db, registration_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Registration not found")
    return 

@app.patch("/admin/users/{user_id}/role", response_model=schemas.UserOut, summary="Update user role (Admin only)")
async def update_user_role(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates a user's role. Requires admin privileges.
    """
    if not user_update.model_dump(exclude_unset=True):
        raise HTTPException(status_code=400, detail="No fields provided for update.")
    
    db_user = await crud.update_user(db, user_id, user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.refresh(db_user)
    
    # Convert SQLAlchemy model to dictionary for validation
    user_dict = {
        "id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "phone": db_user.phone,
        "is_active": db_user.is_active,
        "role": db_user.role,
        "created_at": db_user.created_at,
    }
    
    return schemas.UserOut.model_validate(user_dict)

@app.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a user (Admin only)")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Deletes a user. Requires admin privileges.
    """
    deleted = await crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return