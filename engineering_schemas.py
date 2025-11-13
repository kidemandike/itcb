from pydantic import BaseModel, Field, ConfigDict, validator
from datetime import datetime
from typing import Optional, List

# NOTE: You must import UserOut from the core schemas file
from schemas import UserOut 

# ----------------------------------------------------------------------
# 🚗 --- Driving Course Schemas ---
# ----------------------------------------------------------------------

class DrivingCourseBase(BaseModel):
    """Base schema for driving course data."""
    course_name: str = Field(..., description="Name of the driving course")
    course_type: str = Field(..., description="Type of driving course: 'Regular Vehicles', 'Agricultural Machinery', 'Heavy Equipment'")
    start_date: datetime = Field(..., description="Course start date")
    end_date: datetime = Field(..., description="Course end date")
    duration: str = Field(..., description="Course duration e.g., '3 months'")
    price: int = Field(..., ge=0, description="Course fee in Tsh")
    quarter: str = Field(..., description="Quarter identifier e.g., 'Q1', 'Q2', 'Q3', 'Q4'")
    year: int = Field(..., ge=2020, description="Year of the course")

    @validator('start_date', 'end_date', pre=True)
    @classmethod
    def strip_datetimes_of_timezone(cls, dt_value):
        """Converts timezone-aware datetime objects to naive datetime objects."""
        if isinstance(dt_value, datetime) and dt_value.tzinfo is not None:
            return dt_value.replace(tzinfo=None)
        return dt_value


class DrivingCourseCreate(DrivingCourseBase):
    """Schema for creating a new driving course (Head of Engineering)."""
    pass


class DrivingCourseUpdate(BaseModel):
    """Schema for updating driving course details."""
    course_name: Optional[str] = None
    course_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration: Optional[str] = None
    price: Optional[int] = Field(None, ge=0)
    quarter: Optional[str] = None
    year: Optional[int] = Field(None, ge=2020)
    is_active: Optional[bool] = None

    @validator('start_date', 'end_date', pre=True)
    @classmethod
    def strip_optional_datetimes_of_timezone(cls, dt_value):
        if isinstance(dt_value, datetime) and dt_value.tzinfo is not None:
            return dt_value.replace(tzinfo=None)
        return dt_value


class DrivingCourseOut(DrivingCourseBase):
    """Schema for returning driving course data."""
    id: int
    created_by: int
    is_active: bool = True
    application_count: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------------------------
# 🚗 --- Driving Application Schemas (MANUAL CONTROL ONLY) ---
# ----------------------------------------------------------------------

class DrivingApplicationBase(BaseModel):
    """Base schema for driving application data."""
    course_id: int 
    student_full_name: str
    phone_number: str


class DrivingApplicationCreate(DrivingApplicationBase):
    """Schema for creating a new driving application."""
    pass


# --- MANUAL CONTROL NUMBER SCHEMAS (NO AUTO-GENERATION) ---

class DrivingManualControlNumberAssign(BaseModel):
    """Schema for manual control number assignment"""
    control_number: str = Field(..., description="Manual control number (required)")
    amount: Optional[int] = Field(150000, description="Registration fee amount")
    payment_reference: Optional[str] = Field(None, description="Payment reference")


class DrivingManualCertificateControlNumberAssign(BaseModel):
    """Schema for manual certificate control number assignment"""
    certificate_control_number: str = Field(..., description="Manual certificate control number (required)")
    certificate_amount: Optional[int] = Field(20000, description="Certificate fee amount")
    payment_reference: Optional[str] = Field(None, description="Payment reference")


class DrivingApplicationUpdate(BaseModel):
    """Schema for updating application details."""
    application_status: Optional[str] = None
    course_status: Optional[str] = None
    grade: Optional[str] = None
    certificate_requested: Optional[bool] = None
    certificate_approved: Optional[bool] = None
    certificate_issued: Optional[bool] = None
    certificate_control_number: Optional[str] = None
    registration_control_number: Optional[str] = None


class DrivingApplicationOut(BaseModel):
    """Schema for returning driving application data - MATCHES DATABASE STRUCTURE"""
    model_config = ConfigDict(from_attributes=True)
    
    # Core application fields (direct from database)
    id: int
    course_id: int
    student_full_name: str
    phone_number: str
    application_status: str
    registration_control_number: Optional[str] = None
    course_status: str
    grade: Optional[str] = None
    completion_date: Optional[datetime] = None
    certificate_requested: Optional[bool] = None
    certificate_request_date: Optional[datetime] = None
    certificate_approved: Optional[bool] = None
    certificate_approval_date: Optional[datetime] = None
    certificate_control_number: Optional[str] = None
    certificate_issued: Optional[bool] = None
    certificate_issue_date: Optional[datetime] = None
    issued_by: Optional[int] = None
    application_date: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    user_id: Optional[int] = None
    payment_status: Optional[str] = "Pending"
    created_at: Optional[datetime] = None
    
    # Enhanced fields from relationships (will be populated in routes)
    course_name: Optional[str] = None
    course_type: Optional[str] = None
    course_duration: Optional[str] = None
    course_price: Optional[int] = None


class DrivingApplicationResponse(BaseModel):
    """Schema for returning full driving application data with relationships."""
    model_config = ConfigDict(from_attributes=True)
    
    # Database fields
    id: int
    course_id: int
    user_id: Optional[int] = None
    student_full_name: str
    phone_number: str
    application_status: str
    registration_control_number: Optional[str] = None
    course_status: str
    grade: Optional[str] = None
    completion_date: Optional[datetime] = None
    certificate_requested: Optional[bool] = None
    certificate_request_date: Optional[datetime] = None
    certificate_approved: Optional[bool] = None
    certificate_approval_date: Optional[datetime] = None
    certificate_control_number: Optional[str] = None
    certificate_issued: Optional[bool] = None
    certificate_issue_date: Optional[datetime] = None
    issued_by: Optional[int] = None
    application_date: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    payment_status: Optional[str] = "Pending"
    created_at: Optional[datetime] = None
    
    # Relationships
    course: Optional['DrivingCourseOut'] = None
    user: Optional['UserOut'] = None
    issuer: Optional['UserOut'] = None


# ----------------------------------------------------------------------
# 🚗 --- MANUAL COURSE STATUS MANAGEMENT SCHEMAS ---
# ----------------------------------------------------------------------

class DrivingCourseStatusUpdate(BaseModel):
    """Schema for manual course status update"""
    course_status: str = Field(..., description="Course status: 'Not Started', 'Started', 'Completed'")
    manual_update: bool = Field(True, description="Flag for manual update")


class DrivingCourseComplete(BaseModel):
    """Schema for manually marking course as completed"""
    grade: Optional[str] = Field(None, description="Final grade for the course")


# ----------------------------------------------------------------------
# 🚗 --- Driving Certificate Schemas ---
# ----------------------------------------------------------------------

class DrivingCertificateBase(BaseModel):
    """Base schema for driving certificate data."""
    certificate_number: str = Field(..., description="Unique certificate number")
    student_name: str = Field(..., description="Name of the certificate recipient")
    course_type: str = Field(..., description="Type of driving course completed")
    license_class: str = Field(..., description="License class: B, C, D, etc.")
    grade_obtained: str = Field(..., description="Grade obtained in the course")
    issue_date: datetime = Field(..., description="Date certificate was issued")
    expiry_date: Optional[datetime] = Field(None, description="Optional certificate expiry date")

    @validator('issue_date', 'expiry_date', pre=True)
    @classmethod
    def strip_certificate_datetimes_of_timezone(cls, dt_value):
        if isinstance(dt_value, datetime) and dt_value.tzinfo is not None:
            return dt_value.replace(tzinfo=None)
        return dt_value


class DrivingCertificateCreate(DrivingCertificateBase):
    """Schema for creating a new driving certificate."""
    application_id: int = Field(..., description="ID of the driving application")
    issued_by: int = Field(..., description="ID of the user issuing the certificate")


class DrivingCertificateUpdate(BaseModel):
    """Schema for updating driving certificate details."""
    is_active: Optional[bool] = None
    is_revoked: Optional[bool] = None
    revocation_reason: Optional[str] = None


class DrivingCertificateOut(DrivingCertificateBase):
    """Schema for returning driving certificate data."""
    id: int
    application_id: int
    issued_by: int
    is_active: bool = True
    is_revoked: bool = False
    revocation_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------------------------------------------------------
# 🚗 --- Control Number and Bulk Operation Schemas ---
# ----------------------------------------------------------------------

class DrivingRegistrationControlNoUpdate(BaseModel):
    """Schema for admin to assign registration control number."""
    registration_control_number: str = Field(..., description="Control number for course registration")


class DrivingCertificateControlNoUpdate(BaseModel):
    """Schema for admin to assign certificate control number."""
    certificate_control_number: str = Field(..., description="Control number for certificate after payment")


class DrivingCertificateApproval(BaseModel):
    """Schema for admin to approve certificate request after payment."""
    approved: bool = Field(True, description="Set to True to approve certificate request")


class BulkApplicationUpdate(BaseModel):
    """Schema for bulk updating driving application status."""
    application_ids: List[int] = Field(..., description="List of application IDs to update")
    status: str = Field(..., description="New application status for the selected applications")


# ----------------------------------------------------------------------
# 🚗 --- Report and Statistics Schemas ---
# ----------------------------------------------------------------------

class DrivingReportRequest(BaseModel):
    """Schema for requesting driving school reports."""
    quarter: Optional[str] = Field(None, description="Quarter to filter by e.g., 'Q1 2024'")
    year: Optional[int] = Field(None, ge=2020, description="Year to filter by")
    course_type: Optional[str] = Field(None, description="Course type to filter by")


class DrivingReportOut(BaseModel):
    """Schema for returning driving school report data."""
    total_applications: int
    approved_applications: int
    completed_courses: int
    certificate_requests: int
    issued_certificates: int
    total_revenue: float
    quarter: Optional[str] = None
    year: Optional[int] = None
    course_type: Optional[str] = None


# ----------------------------------------------------------------------
# 🚗 --- New Schemas for Enhanced Functionality ---
# ----------------------------------------------------------------------

class DrivingDashboardStats(BaseModel):
    """Schema for driving school dashboard statistics."""
    total_applications: int
    approved_applications: int
    completed_courses: int
    certificate_requests: int
    issued_certificates: int
    registration_revenue: int
    certificate_revenue: int
    total_revenue: int
    total_courses: int


class DrivingApplicationSearch(BaseModel):
    """Schema for searching driving applications."""
    query: str = Field(..., description="Search query for student name or phone number")


class DrivingApplicationFilter(BaseModel):
    """Schema for filtering driving applications."""
    application_status: Optional[str] = None
    course_status: Optional[str] = None
    course_type: Optional[str] = None
    certificate_requested: Optional[bool] = None
    certificate_issued: Optional[bool] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class DrivingPaymentStatusUpdate(BaseModel):
    """Schema for updating payment status."""
    payment_status: str = Field(..., description="Payment status: 'Pending', 'Paid', 'Cancelled'")


class DrivingApplicationStatusUpdate(BaseModel):
    """Schema for updating application status."""
    status: str = Field(..., description="Application status")


class DrivingCertificatePDFData(BaseModel):
    """Schema for certificate PDF generation data."""
    license_number: str = Field(..., description="License number for the certificate")
    issue_date: str = Field(..., description="Certificate issue date")
    expiry_date: str = Field(..., description="Certificate expiry date")
    vehicle_categories: str = Field(..., description="Vehicle categories")
    restrictions: Optional[str] = Field("None", description="License restrictions")


class DrivingBulkApproveResponse(BaseModel):
    """Schema for bulk approval response."""
    message: str
    approved_count: int


# ----------------------------------------------------------------------
# 🚗 --- Application Status Constants ---
# ----------------------------------------------------------------------

class DrivingApplicationStatus:
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class DrivingCourseStatus:
    NOT_STARTED = "Not Started"
    STARTED = "Started"
    COMPLETED = "Completed"
    FAILED = "Failed"


class DrivingPaymentStatus:
    PENDING = "Pending"
    PAID = "Paid"
    CANCELLED = "Cancelled"