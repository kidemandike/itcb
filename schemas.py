from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

# ----------------------------------------------------------------------
# --- User Schemas ---
# ----------------------------------------------------------------------

class UserBase(BaseModel):
    """Shared fields for all user models."""
    email: EmailStr
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str
    role: str = "student"


class UserOut(UserBase):
    """Schema for returning user information."""
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    role: str

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for login requests."""
    email: EmailStr
    password: str


class AuthResult(BaseModel):
    """Schema returned after successful or failed authentication."""
    success: bool
    message: Optional[str] = None
    access_token: Optional[str] = None
    user: Optional[UserOut] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str


# ----------------------------------------------------------------------
# --- Course Schemas ---------------------------------------------------
# ----------------------------------------------------------------------

class CourseBase(BaseModel):
    """Base course schema."""
    course_id: str = Field(..., description="Unique code for the course (e.g., CS101)")
    course_name: str
    description: Optional[str] = None
    course_price: int = Field(..., ge=0)
    course_duration: str


class CourseCreate(CourseBase):
    """Schema for creating new courses."""
    pass


class CourseOut(CourseBase):
    """Schema for returning course details."""
    id: int
    instructor_id: Optional[int] = None
    instructor_name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------------------------
# --- Course Registration Schemas -------------------------------------
# ----------------------------------------------------------------------

class CourseRegistrationBase(BaseModel):
    """Base schema for course registration data."""
    course_id: str 
    course_name: str
    selected_schedule: str
    selected_level: str
    course_price: str
    course_duration: str
    instructor_name: str


class CourseRegistrationCreate(CourseRegistrationBase):
    """Schema for new course registration requests."""
    pass


class CourseRegistrationOut(CourseRegistrationBase):
    """Schema for returning registered course info."""
    id: int
    user_id: int
    user_name: str
    user_email: str
    registration_date: Optional[datetime] = None 
    payment_status: str
    course_id: int
    completion_status: Optional[str] = None
    control_no: Optional[str] = None
    is_completed: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CourseRegistrationUpdateStatus(BaseModel):
    """Schema for updating course payment status."""
    payment_status: str = Field(..., pattern="^(Pending|Paid|Cancelled)$")


class CourseRegistrationUpdateCompletion(BaseModel):
    """Schema for updating completion status."""
    completion_status: str = Field(..., pattern="^(In Progress|Completed|Failed)$")


class RegistrationControlNoUpdate(BaseModel):
    """Schema for admin control number update."""
    control_no: str


# ----------------------------------------------------------------------
# --- Conference Room Schemas -----------------------------------------
# ----------------------------------------------------------------------

class ConferenceRoomBase(BaseModel):
    """Base schema for conference room data."""
    name: str
    capacity: int = Field(..., gt=0)
    location: Optional[str] = None
    amenities: Optional[List[str]] = None
    price_per_day: int = Field(0, ge=0)
    is_active: Optional[bool] = True


class ConferenceRoomCreate(ConferenceRoomBase):
    """Schema for creating a new conference room."""
    pass


class ConferenceRoomUpdate(BaseModel):
    """Schema for updating conference room details."""
    name: Optional[str] = None
    capacity: Optional[int] = Field(None, gt=0)
    location: Optional[str] = None
    amenities: Optional[List[str]] = None
    price_per_day: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ConferenceRoom(ConferenceRoomBase):
    """Schema for returning conference room data."""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------------------------
# --- Room Booking Schemas --------------------------------------------
# ----------------------------------------------------------------------

class RoomBookingBase(BaseModel):
    """Base schema for room booking data."""
    room_id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime


class RoomBookingCreate(RoomBookingBase):
    """Schema for creating new room bookings."""
    pass


class BookingStatusUpdate(BaseModel):
    """Schema for updating booking status."""
    status: str = Field(..., pattern="^(pending|approved|rejected|cancelled)$")


class BookingControlNoUpdate(BaseModel):
    """Schema for admin control number update for room bookings."""
    control_no: str


class RoomBooking(RoomBookingBase):
    """Schema for returning full room booking data."""
    id: int
    user_id: Optional[int] = None
    status: str
    total_price: Optional[int] = None
    control_no: Optional[str] = None
    created_at: Optional[datetime] = None 
    updated_at: Optional[datetime] = None 

    model_config = ConfigDict(from_attributes=True)

# ----------------------------------------------------------------------
# --- Department Schemas -----------------------------------------------
# ----------------------------------------------------------------------

class DepartmentBase(BaseModel):
    """Base schema for department data."""
    name: str
    code: Optional[str] = None
    head_id: Optional[int] = None
    is_active: Optional[bool] = True


class DepartmentCreate(DepartmentBase):
    """Schema for creating a new department."""
    pass


class DepartmentUpdate(BaseModel):
    """Schema for updating department details."""
    name: Optional[str] = None
    code: Optional[str] = None
    head_id: Optional[int] = None
    is_active: Optional[bool] = None


class DepartmentOut(DepartmentBase):
    """Schema for returning full department data."""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------------------------
# 🎓 --- Certificate Application Schemas (Moved from Driving) ---
# ----------------------------------------------------------------------

class CertificateApplicationBase(BaseModel):
    """Base schema for certificate applications."""
    certificate_type: str = Field(..., description="E.g., 'ELP', 'Short Course', 'Alumni'")
    purpose: str
    department: str
    graduation_year: str
    registration_number: str
    phone_number: str = Field(..., alias="contact_phone")
    application_notes: Optional[str] = None

class CertificateApplicationCreate(CertificateApplicationBase):
    """Schema for a user submitting a new application."""
    pass

class CertificateApplicationUpdateStatus(BaseModel):
    """Schema for staff/admin to update the status."""
    staff_status: str = Field(..., pattern="^(Pending Review|Approved|Rejected|Issued)$")
    
class CertificateApplicationControlNoUpdate(BaseModel):
    """Schema for admin to set the final control number."""
    control_number: str

class CertificateApplicationOut(CertificateApplicationBase):
    """Schema for returning the full application details."""
    id: int
    user_id: int
    user_name: str
    user_email: str
    staff_status: str = "Pending Review"
    control_number: Optional[str] = None
    approved_by_staff_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)