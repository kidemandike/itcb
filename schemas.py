# schemas.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List # Ensure List is imported for other schemas if needed

# --- User Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    # NEW: Allow role to be set on creation, but default to 'student'
    role: str = "student"

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    role: str # NEW: Include role in output

    class Config:
        from_attributes = True # For Pydantic v2.x, use orm_mode = True for v1.x

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    # NEW: Allow admin to update role
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResult(BaseModel):
    success: bool
    message: Optional[str] = None
    access_token: Optional[str] = None
    user: Optional[UserOut] = None # Include UserOut model

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str

# --- Course Registration Schemas ---

class CourseRegistrationBase(BaseModel):
    course_id: str
    course_name: str
    selected_schedule: str
    selected_level: str
    course_price: str
    course_duration: str
    instructor_name: str

class CourseRegistrationCreate(CourseRegistrationBase):
    # When creating, user_id, user_name, user_email will be populated by backend
    pass

class CourseRegistrationOut(CourseRegistrationBase):
    id: int
    user_id: int
    user_name: str
    user_email: str
    registration_date: datetime
    payment_status: str
    is_completed: bool
    control_no: Optional[str] = None # NEW: control_no field for output

    class Config:
        from_attributes = True # For Pydantic v2.x, use orm_mode = True for v1.x

class CourseRegistrationUpdateStatus(BaseModel):
    payment_status: str = Field(..., pattern="^(Pending|Paid|Cancelled)$")

class CourseRegistrationUpdateCompletion(BaseModel):
    is_completed: bool

# NEW: Schema for updating control number (Admin only)
class RegistrationControlNoUpdate(BaseModel):
    control_no: str
