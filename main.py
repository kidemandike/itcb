# main.py
import os
from datetime import timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

# Internal imports (ensure these files are in your project)
import schemas
import crud
import models
from database import engine, init_db, get_db # Ensure get_db yields AsyncSession
from auth import (
    create_access_token,
    get_current_user,
    verify_password,
    get_password_hash
)

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
# List of origins (frontend URLs) that are allowed to access your API
# Adjust these based on where your Flutter web app will run in development and production.
origins = [
    "http://localhost:54848",
    "http://127.0.0.1:54848",
    "http://localhost:61343",
    "http://127.0.0.1:61343",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:52012",
    "http://127.0.0.1:50288",
    "http://10.0.2.2:8080",
    "*",  # <-- Add * only in development to avoid origin errors
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # Ensure OPTIONS is allowed
    allow_headers=["*"],   # Ensure Authorization, Content-Type, etc. are allowed
)

# --- Database Initialization on Startup ---
@app.on_event("startup")
async def on_startup():
    # Asynchronously create all database tables defined in models.py
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    print("Database tables created/checked.")

# --- Dependency for Admin User Authentication ---
# This dependency ensures that the current user is authenticated AND has the 'admin' role.
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

    # Assign default role 'student' if not provided (or overwrite if desired)
    user.role = user.role if user.role else "student"

    new_user = await crud.create_user(db=db, user=user)
    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return schemas.AuthResult(
        success=True,
        message="Registration successful!",
        access_token=access_token,
        user=schemas.UserOut.from_orm(new_user)
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

    return schemas.AuthResult(
        success=True,
        message="Login successful!",
        access_token=access_token,
        user=schemas.UserOut.from_orm(user)
    )

@app.get("/me", response_model=schemas.AuthResult, summary="Get current authenticated user's profile")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    Retrieves the profile information of the currently authenticated user.
    """
    return schemas.AuthResult(
        success=True,
        message="User data retrieved successfully.",
        user=schemas.UserOut.from_orm(current_user)
    )

# --- PASSWORD RESET ROUTES (Simulated for simplicity) ---

@app.post("/forgot-password", response_model=schemas.AuthResult, summary="Simulate sending password reset link")
async def forgot_password(request: schemas.ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Simulates the process of sending a password reset link to the user's email.
    (In a real application, this would involve sending an actual email with a unique token).
    """
    user = await crud.get_user_by_email(db, email=request.email)
    if user:
        # In a real app, generate a token, save it to DB, and send email.
        print(f"Simulated: Sent reset link to {user.email}")
    else:
        print(f"Simulated: Attempted reset for unregistered email {request.email}")

    # Always return success to prevent email enumeration attacks
    return schemas.AuthResult(success=True, message="If your email is registered, a password reset link has been sent.")

@app.post("/reset-password", response_model=schemas.AuthResult, summary="Simulate password reset using token")
async def reset_password(request: schemas.ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Simulates resetting a user's password using a provided reset token and new password.
    (Uses a dummy token for demonstration).
    """
    user = await crud.get_user_by_email(db, email=request.email)
    if not user or request.reset_token != "dummy_reset_token": # Replace "dummy_reset_token" with actual token validation
        return schemas.AuthResult(success=False, message="Invalid email or reset token.")

    user.hashed_password = get_password_hash(request.new_password)
    db.add(user)
    await db.commit()
    await db.refresh(user) # Refresh to get any updated fields

    return schemas.AuthResult(success=True, message="Password has been reset successfully!")


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
    if current_user.role not in ["student", "user", "admin"]: # Allow admin to register for testing if needed
        raise HTTPException(status_code=403, detail="Not authorized to register for courses.")

    # Check if user already registered for this specific course offering (e.g., same course_id and schedule)
    existing_registration = await crud.get_course_registration_by_user_and_course(
        db, current_user.id, registration.course_id, registration.selected_schedule
    )
    if existing_registration:
        raise HTTPException(status_code=409, detail="You are already registered for this course and schedule.")

    db_registration = await crud.create_course_registration(
        db=db,
        registration=registration,
        user_id=current_user.id,
        user_name=current_user.full_name, # Use full_name from the authenticated user
        user_email=current_user.email
    )
    return schemas.CourseRegistrationOut.from_orm(db_registration)

@app.get("/users/{user_id}/registrations", response_model=List[schemas.CourseRegistrationOut], summary="Get all course registrations for a specific user")
async def get_user_registrations(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves all course registrations for a specific user.
    Accessible by the user themselves or by an administrator.
    """
    # Allow user to view their own registrations, or admin to view anyone's
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these registrations.")

    registrations = await crud.get_user_course_registrations(db, user_id=user_id)
    return [schemas.CourseRegistrationOut.from_orm(reg) for reg in registrations]


# --- ADMIN-SPECIFIC ROUTES ---

@app.get("/admin/users", response_model=List[schemas.UserOut], summary="Get all users (Admin only)")
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user) # Ensures only admin can access
):
    """
    Retrieves a list of all registered users. Requires admin privileges.
    """
    users = await crud.get_all_users(db)
    return [schemas.UserOut.from_orm(user) for user in users]

@app.get("/admin/registrations", response_model=List[schemas.CourseRegistrationOut], summary="Get all course registrations (Admin only)")
async def get_all_registrations(
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user) # Ensures only admin can access
):
    """
    Retrieves a list of all course registrations across all users. Requires admin privileges.
    """
    registrations = await crud.get_all_course_registrations(db)
    return [schemas.CourseRegistrationOut.from_orm(reg) for reg in registrations]

@app.patch("/admin/registrations/{registration_id}/status", response_model=schemas.CourseRegistrationOut, summary="Update payment status of a registration (Admin only)")
async def update_registration_payment_status(
    registration_id: int,
    status_update: schemas.CourseRegistrationUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates the payment status of a specific course registration. Requires admin privileges.
    """
    db_registration = await crud.update_course_registration_status(db, registration_id, status_update)
    if not db_registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    return schemas.CourseRegistrationOut.from_orm(db_registration)

@app.patch("/admin/registrations/{registration_id}/completion", response_model=schemas.CourseRegistrationOut, summary="Update completion status of a registration (Admin only)")
async def update_registration_completion_status(
    registration_id: int,
    completion_update: schemas.CourseRegistrationUpdateCompletion,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates the completion status of a specific course registration. Requires admin privileges.
    """
    db_registration = await crud.update_course_registration_completion(db, registration_id, completion_update)
    if not db_registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    return schemas.CourseRegistrationOut.from_orm(db_registration)

# NEW: Endpoint to update control number for a registration (Admin only)
@app.patch("/admin/registrations/{registration_id}/control_no", response_model=schemas.CourseRegistrationOut, summary="Update control number for a registration (Admin only)")
async def update_registration_control_no(
    registration_id: int,
    control_no_update: schemas.RegistrationControlNoUpdate,
    db: AsyncSession = Depends(get_db), # Ensure AsyncSession
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates the control number for a specific course registration. Requires admin privileges.
    """
    db_registration = await crud.get_course_registration_by_id(db, registration_id) # Fetch the registration
    if not db_registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    updated_registration = await crud.update_registration_control_no( # Call the CRUD function
        db, db_registration=db_registration, control_no=control_no_update.control_no
    )
    return schemas.CourseRegistrationOut.from_orm(updated_registration)

@app.delete("/admin/registrations/{registration_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a course registration (Admin only)")
async def delete_registration(
    registration_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Deletes a specific course registration. Requires admin privileges.
    """
    deleted = await crud.delete_course_registration(db, registration_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Registration not found")
    return {"message": "Registration deleted successfully"} # FastAPI returns 204 for no content, message is for documentation

@app.patch("/admin/users/{user_id}/role", response_model=schemas.UserOut, summary="Update a user's role (Admin only)")
async def update_user_role(
    user_id: int,
    user_update: schemas.UserUpdate, # This schema should contain 'role: Optional[str]'
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Updates the role of a specific user. Requires admin privileges.
    """
    if user_update.role is None:
        raise HTTPException(status_code=400, detail="Role must be provided for update.")

    # Ensure other fields in UserUpdate are None if only role is being updated
    # or adjust schema/crud.update_user to handle partial updates cleanly.
    update_data = {"role": user_update.role}
    db_user = await crud.update_user(db, user_id, schemas.UserUpdate(**update_data))
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut.from_orm(db_user)

@app.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a user (Admin only)")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """
    Deletes a user from the system. Requires admin privileges.
    """
    deleted = await crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"} # FastAPI returns 204 for no content, message is for documentation
