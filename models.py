import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float, Text
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
from typing import Optional
from datetime import datetime

# --- Base Class Definition ---
class Base(DeclarativeBase):
    pass

# -----------------------------------------------------------------------------

# --- User Model (Public.users) ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="student", nullable=False)
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)

    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now()) 

    # Relationships
    department = relationship("Department", back_populates="members", foreign_keys=[department_id])
    registrations = relationship("CourseRegistration", back_populates="user")
    room_bookings = relationship("RoomBooking", back_populates="user")
    taught_courses = relationship("Course", back_populates="instructor") 
    driving_applications = relationship("DrivingApplication", back_populates="user", foreign_keys="DrivingApplication.user_id")
    driving_courses_created = relationship("DrivingCourse", back_populates="creator", foreign_keys="DrivingCourse.created_by")
    issued_driving_certificates = relationship("DrivingCertificate", back_populates="issuer", foreign_keys="DrivingCertificate.issued_by")

# ----------------------------------------------------------------------
# --- Department Model (Public.departments) ---
class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=True) 
    
    head_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    head = relationship("User", foreign_keys=[head_id])
    members = relationship("User", back_populates="department", foreign_keys=[User.department_id])

# ----------------------------------------------------------------------
# --- Course Model (Public.courses) ---
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(String, unique=True, index=True, nullable=False)
    course_name = Column(String, nullable=False)
    description = Column(String)
    course_price = Column(Integer, nullable=False)
    course_duration = Column(String, nullable=False)
    
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    instructor_name = Column(String, nullable=False)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    instructor = relationship("User", back_populates="taught_courses")

# --- Course Registration Model (Public.course_registrations) ---
class CourseRegistration(Base):
    __tablename__ = "course_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String, nullable=False) 
    user_email = Column(String, nullable=False) 

    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    
    course_name = Column(String, nullable=False)
    selected_schedule = Column(String, nullable=False)
    selected_level = Column(String, nullable=False)
    course_price = Column(String, nullable=False) 
    course_duration = Column(String, nullable=False)
    instructor_name = Column(String, nullable=False)
    
    registration_date = Column(DateTime, nullable=True) 
    payment_status = Column(String, default="pending", nullable=False)
    completion_status = Column(String, default="In Progress", nullable=True)
    control_no = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    is_completed = Column(Boolean, default=False) 

    user = relationship("User", back_populates="registrations")

# --- Conference Room Model (Public.conference_rooms) ---
class ConferenceRoom(Base):
    __tablename__ = "conference_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    capacity = Column(Integer)
    location = Column(String)
    amenities = Column(JSON)
    is_active = Column(Boolean, default=True)
    price_per_day = Column(Integer, nullable=False, default=0)
    
    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    bookings = relationship("RoomBooking", back_populates="room")
    
# --- Room Booking Model (Public.room_bookings) ---
class RoomBooking(Base):
    __tablename__ = "room_bookings"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("conference_rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    
    start_time = Column(DateTime(timezone=True), nullable=False) 
    end_time = Column(DateTime(timezone=True), nullable=False)
    
    status = Column(String, nullable=False, default="pending")
    total_price = Column(Integer, nullable=False)
    control_no = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    room = relationship("ConferenceRoom", back_populates="bookings")
    user = relationship("User", back_populates="room_bookings")
 
# ----------------------------------------------------------------------
# 🎓 --- Certificate Application Model (NEW) ---
# ----------------------------------------------------------------------

class CertificateApplication(Base):
    __tablename__ = "certificate_applications"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    
    certificate_type = Column(String, nullable=False) 
    purpose = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    application_notes = Column(String, nullable=True)

    # ⭐ CRITICAL FIX: ADDED FIELDS TO MATCH CLIENT PAYLOAD
    department = Column(String, nullable=False)
    graduation_year = Column(String, nullable=False)
    registration_number = Column(String, nullable=False)
    
    staff_status = Column(String, default="Pending Review", nullable=False) 
    approved_by_staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    control_number = Column(String, index=True, unique=True, nullable=True) 
    
    created_at = Column(DateTime, default=func.now()) 
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now()) 

    # Relationships
    applicant = relationship("User", foreign_keys=[user_id], backref="certificate_applications_submitted")
    approver = relationship("User", foreign_keys=[approved_by_staff_id], backref="certificate_applications_approved")
# ----------------------------------------------------------------------
# 🚗 --- Driving Course Model (UPDATED - FIXED TIMEZONE ISSUE) ---
# ----------------------------------------------------------------------

class DrivingCourse(Base):
    __tablename__ = "driving_courses"

    id = Column(Integer, primary_key=True, index=True)
    
    course_name = Column(String, nullable=False)
    course_type = Column(String, nullable=False)
    start_date = Column(DateTime(timezone=False), nullable=False)  # FIXED: Explicitly timezone-naive
    end_date = Column(DateTime(timezone=False), nullable=False)    # FIXED: Explicitly timezone-naive
    duration = Column(String, nullable=False)
    price = Column(Float, nullable=False) 
    
    quarter = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=False), default=func.now())  # FIXED: timezone-naive
    updated_at = Column(DateTime(timezone=False), default=func.now(), onupdate=func.now())  # FIXED: timezone-naive
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="driving_courses_created")
    applications = relationship("DrivingApplication", back_populates="course")

# ----------------------------------------------------------------------
# 🚗 --- Driving Application Model (UPDATED - FIXED MISSING FIELDS) ---
# ----------------------------------------------------------------------

class DrivingApplication(Base):
    __tablename__ = "driving_applications"

    id = Column(Integer, primary_key=True, index=True)
    
    course_id = Column(Integer, ForeignKey("driving_courses.id"), nullable=False)
    
    student_full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    application_status = Column(String, default="Pending Review", nullable=False) 
    
    registration_control_number = Column(String, unique=True, nullable=True)
    
    course_status = Column(String, default="Not Started", nullable=False) 
    grade = Column(String, nullable=True) 
    completion_date = Column(DateTime(timezone=False), nullable=True)  # FIXED: timezone-naive
    
    certificate_requested = Column(Boolean, default=False)
    certificate_request_date = Column(DateTime(timezone=False), nullable=True)  # FIXED: timezone-naive
    
    certificate_approved = Column(Boolean, default=False)
    certificate_approval_date = Column(DateTime(timezone=False), nullable=True)  # FIXED: timezone-naive
    
    certificate_control_number = Column(String, unique=True, nullable=True)
    
    certificate_issued = Column(Boolean, default=False)
    certificate_issue_date = Column(DateTime(timezone=False), nullable=True)  # FIXED: timezone-naive
    issued_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    payment_status = Column(String, default="Pending", nullable=False) 
    
    application_date = Column(DateTime(timezone=False), default=func.now())  # FIXED: timezone-naive
    updated_at = Column(DateTime(timezone=False), default=func.now(), onupdate=func.now())  # FIXED: timezone-naive
    
    # ADDED MISSING FIELDS TO MATCH YOUR DATABASE SCHEMA
    created_at = Column(DateTime(timezone=False), default=func.now())  # ADDED: Missing field
    
    # Relationships
    course = relationship("DrivingCourse", back_populates="applications")
    issuer = relationship("User", foreign_keys=[issued_by])
    user = relationship("User", foreign_keys=[user_id], back_populates="driving_applications")
    # Added inverse relationship for certificate
    certificate = relationship("DrivingCertificate", back_populates="application", uselist=False)

# ----------------------------------------------------------------------
# 🚗 --- Driving Certificate Model (UPDATED - FIXED RELATIONSHIPS) ---
# ----------------------------------------------------------------------

class DrivingCertificate(Base):
    __tablename__ = "driving_certificates"

    id = Column(Integer, primary_key=True, index=True)
    
    application_id = Column(Integer, ForeignKey("driving_applications.id"), nullable=False)
    
    certificate_number = Column(String, unique=True, nullable=False)
    student_name = Column(String, nullable=False)
    course_type = Column(String, nullable=False)
    license_class = Column(String, nullable=False) 
    grade_obtained = Column(String, nullable=False)
    issue_date = Column(DateTime(timezone=False), nullable=False)  # FIXED: timezone-naive
    expiry_date = Column(DateTime(timezone=False), nullable=True)  # FIXED: timezone-naive
    
    issued_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    is_active = Column(Boolean, default=True)
    is_revoked = Column(Boolean, default=False)
    revocation_reason = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=False), default=func.now())  # FIXED: timezone-naive
    updated_at = Column(DateTime(timezone=False), default=func.now(), onupdate=func.now())  # FIXED: timezone-naive
    
    # Relationships
    application = relationship("DrivingApplication", back_populates="certificate")
    issuer = relationship("User", foreign_keys=[issued_by], back_populates="issued_driving_certificates")