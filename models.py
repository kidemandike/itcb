# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

# Corrected: Use absolute import if database.py is in the same directory
from database import Base

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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # NEW: Add a role column for permissions (e.g., 'student', 'admin')
    role = Column(String, default="student", nullable=False)

    # Define relationship to course registrations
    registrations = relationship("CourseRegistration", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"

class CourseRegistration(Base):
    __tablename__ = "course_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String, nullable=False) # Denormalized for easier querying
    user_email = Column(String, nullable=False) # Denormalized for easier querying

    course_id = Column(String, nullable=False, index=True) # e.g., 'intro_comp'
    course_name = Column(String, nullable=False)
    selected_schedule = Column(String, nullable=False)
    selected_level = Column(String, nullable=False)
    course_price = Column(String, nullable=False) # Storing as string to keep 'TSh 30,000/=' format
    course_duration = Column(String, nullable=False)
    instructor_name = Column(String, nullable=False)

    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    payment_status = Column(String, default="Pending", nullable=False) # e.g., 'Pending', 'Paid', 'Cancelled'
    is_completed = Column(Boolean, default=False, nullable=False) # For tracking course completion
    control_no = Column(String, nullable=True) # NEW: Control number for payment

    # Define relationship back to User
    user = relationship("User", back_populates="registrations")

    def __repr__(self):
        return f"<CourseRegistration(id={self.id}, user_email='{self.user_email}', course_name='{self.course_name}', status='{self.payment_status}')>"
