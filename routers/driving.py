from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from io import BytesIO

# Assuming these schemas, crud functions, database, auth, and models files exist
import schemas
import engineering_schemas
import crud
from database import get_db
from auth import get_current_user # Dependency for authentication
import models

# --- Configuration ---
router = APIRouter(
    prefix="/engineering",
    tags=["Driving Courses - Main"]
)

# Helper dependency to check for engineering staff/admin roles
async def get_current_authorized_engineering_staff(current_user: models.User = Depends(get_current_user)):
    """
    Checks if the user is authorized to manage driving courses (admin or engineering_staff).
    """
    authorized_roles = ["admin", "engineering_staff"]
    if current_user.role not in authorized_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Engineering Staff or Admin privileges required."
        )
    return current_user

# ====================================================
# --- DEBUG ENDPOINT ---
# ====================================================

@router.get("/driving/debug/endpoints")
async def debug_driving_endpoints():
    """Debug endpoint to test if driving routes are accessible"""
    return {
        "message": "Driving endpoints are working!",
        "timestamp": datetime.utcnow().isoformat(),
        "available_endpoints": [
            "GET /engineering/driving-applications",
            "GET /engineering/driving-courses",
            "POST /engineering/driving/courses",
            "GET /engineering/driving-courses/available",
            "POST /engineering/driving-applications/apply",
            "GET /engineering/driving-applications/my-applications"
        ]
    }

# ====================================================
# --- COURSE RETRIEVAL ENDPOINTS ---
# ====================================================

# GET /engineering/driving-courses (For Staff Dashboard)
@router.get("/driving-courses", response_model=List[engineering_schemas.DrivingCourseOut])
async def get_all_driving_courses(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Get all driving courses (for staff/admin dashboard view)."""
    try:
        courses = await crud.get_driving_courses(db)
        return [engineering_schemas.DrivingCourseOut.model_validate(c) for c in courses]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch all driving courses: {str(e)}"
        )

# GET /engineering/driving-courses/available (For Student View)
@router.get("/driving-courses/available", response_model=List[engineering_schemas.DrivingCourseOut])
async def get_available_driving_courses_frontend(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all currently available driving courses (for student view/application)."""
    try:
        courses = await crud.get_available_driving_courses(db)
        return [engineering_schemas.DrivingCourseOut.model_validate(c) for c in courses]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch available driving courses: {str(e)}"
        )

# ====================================================
# --- GENERAL DRIVING DASHBOARD ENDPOINTS ---
# ====================================================

# GET /engineering/driving-applications
@router.get("/driving-applications", response_model=List[engineering_schemas.DrivingApplicationOut])
async def get_driving_applications(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Get all driving applications."""
    try:
        applications = await crud.get_driving_applications(db)

        enhanced_applications = []
        for app in applications:
            # Build the response data safely
            app_data = {
                # Fields that definitely exist in database
                "id": app.id,
                "course_id": app.course_id,
                "student_full_name": app.student_full_name,
                "phone_number": app.phone_number,
                "application_status": app.application_status,
                "registration_control_number": app.registration_control_number,
                "course_status": app.course_status,
                "grade": app.grade,
                "completion_date": app.completion_date,
                "certificate_requested": app.certificate_requested,
                "certificate_request_date": app.certificate_request_date,
                "certificate_approved": app.certificate_approved,
                "certificate_approval_date": app.certificate_approval_date,
                "certificate_control_number": app.certificate_control_number,
                "certificate_issued": app.certificate_issued,
                "certificate_issue_date": app.certificate_issue_date,
                "issued_by": app.issued_by,
                "application_date": app.application_date,
                "updated_at": app.updated_at,

                # Fields that might be missing - use safe access
                "user_id": getattr(app, 'user_id', None),
                "payment_status": getattr(app, 'payment_status', 'Pending'),
                "created_at": getattr(app, 'created_at', app.application_date),

                # Enhanced course fields
                "course_name": app.course.course_name if app.course else None,
                "course_type": app.course.course_type if app.course else None,
                "course_duration": app.course.duration if app.course else None,
                "course_price": app.course.price if app.course else None,
            }

            # Remove any None values that might cause issues
            cleaned_data = {k: v for k, v in app_data.items() if v is not None}

            enhanced_applications.append(engineering_schemas.DrivingApplicationOut(**cleaned_data))

        return enhanced_applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch driving applications: {str(e)}"
        )

# ====================================================
# --- STUDENT ENDPOINTS ---
# ====================================================

# POST /engineering/driving-applications/apply
@router.post("/driving-applications/apply", response_model=engineering_schemas.DrivingApplicationOut, status_code=status.HTTP_201_CREATED)
async def apply_for_driving_course(
    application: engineering_schemas.DrivingApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Student endpoint to apply for a driving course."""
    try:
        # Check if the course exists before trying to apply
        course = await crud.get_driving_course(db, application.course_id)
        if not course:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        # Create the application, associating it with the current user
        new_application = await crud.create_driving_application(db, application, current_user.id)

        # Enhance the response model with related course data
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(new_application).model_dump()
        app_dict = {**base_app_data}

        if new_application.course:
            app_dict["course_name"] = new_application.course.course_name
            app_dict["course_type"] = new_application.course.course_type
            app_dict["course_duration"] = new_application.course.duration
            app_dict["course_price"] = new_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)

    except HTTPException:
        raise 
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit driving course application: {str(e)}"
        )

# GET /engineering/driving-applications/my-applications
@router.get("/driving-applications/my-applications", response_model=List[engineering_schemas.DrivingApplicationOut])
async def get_my_driving_applications(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all driving applications submitted by the current authenticated user."""
    try:
        applications = await crud.get_driving_applications_by_user(db, user_id=current_user.id)

        enhanced_applications = []
        for app in applications:
            app_data = engineering_schemas.DrivingApplicationOut.model_validate(app).model_dump()

            # Enhance with course data
            if app.course:
                app_data["course_name"] = app.course.course_name
                app_data["course_type"] = app.course.course_type
                app_data["course_duration"] = app.course.duration
                app_data["course_price"] = app.course.price

            enhanced_applications.append(engineering_schemas.DrivingApplicationOut.model_validate(app_data))

        return enhanced_applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user's driving applications: {str(e)}"
        )

# ====================================================
# --- COURSE MANAGEMENT ENDPOINTS ---
# ====================================================

# POST /engineering/driving/courses
@router.post("/driving/courses", response_model=engineering_schemas.DrivingCourseOut)
async def announce_driving_course(
    course: engineering_schemas.DrivingCourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Announce new driving course."""
    try:
        # The timezone fix is handled inside crud.create_driving_course
        new_course = await crud.create_driving_course(db, course, current_user.id)
        return new_course
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create driving course: {str(e)}"
        )

# PATCH /engineering/driving-courses/{course_id}
@router.patch("/driving-courses/{course_id}", response_model=engineering_schemas.DrivingCourseOut)
async def update_driving_course(
    course_id: int,
    course_update: engineering_schemas.DrivingCourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Update a driving course."""
    try:
        updated_course = await crud.update_driving_course(db, course_id, course_update)
        if not updated_course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving course not found")
        return updated_course
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update driving course: {str(e)}"
        )

# DELETE /engineering/driving-courses/{course_id}
@router.delete("/driving-courses/{course_id}")
async def delete_driving_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Delete a driving course."""
    try:
        success = await crud.delete_driving_course(db, course_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving course not found")
        return {"message": "Driving course deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete driving course: {str(e)}"
        )

# GET /engineering/driving-courses/{course_id}
@router.get("/driving-courses/{course_id}", response_model=engineering_schemas.DrivingCourseOut)
async def get_driving_course_by_id(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Get a specific driving course by ID."""
    try:
        course = await crud.get_driving_course(db, course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving course not found")
        return course
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch driving course: {str(e)}"
        )

# GET /engineering/driving-courses/{course_id}/applications
@router.get("/driving-courses/{course_id}/applications", response_model=List[engineering_schemas.DrivingApplicationOut])
async def get_driving_course_applications(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Get all applications for a specific driving course."""
    try:
        applications = await crud.get_driving_applications_by_course(db, course_id)

        enhanced_applications = []
        for app in applications:
            app_data = engineering_schemas.DrivingApplicationOut.model_validate(app).model_dump()

            # Enhance with course data
            if app.course:
                app_data["course_name"] = app.course.course_name
                app_data["course_type"] = app.course.course_type
                app_data["course_duration"] = app.course.duration
                app_data["course_price"] = app.course.price

            enhanced_applications.append(engineering_schemas.DrivingApplicationOut.model_validate(app_data))

        return enhanced_applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch course applications: {str(e)}"
        )

# ====================================================
# --- APPLICATION APPROVAL ENDPOINTS ---
# ====================================================

# PATCH /engineering/driving-applications/{application_id}/approve
@router.patch("/driving-applications/{application_id}/approve", response_model=engineering_schemas.DrivingApplicationOut)
async def approve_driving_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Approve individual driving application."""
    try:
        update_data = {"application_status": "Approved"}
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Return enhanced response
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve application: {str(e)}"
        )

# POST /engineering/driving-courses/{course_id}/approve-applications
@router.post("/driving-courses/{course_id}/approve-applications")
async def approve_driving_applications_frontend(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Approve all applications for a specific driving course."""
    try:
        applications = await crud.get_driving_applications_by_course(db, course_id)
        application_ids = [app.id for app in applications]
        updated_applications = await crud.bulk_update_application_status(
            db, application_ids, "Approved"
        )
        return {"message": f"Approved {len(updated_applications)} applications", "applications": updated_applications}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve applications: {str(e)}"
        )

# POST /engineering/driving-courses/{course_id}/bulk-approve
@router.post("/driving-courses/{course_id}/bulk-approve")
async def bulk_approve_applications(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Bulk approve all applications for a course."""
    try:
        applications = await crud.get_driving_applications_by_course(db, course_id)
        application_ids = [app.id for app in applications]
        updated_applications = await crud.bulk_update_application_status(
            db, application_ids, "Approved"
        )
        return {
            "message": f"Approved {len(updated_applications)} applications for course {course_id}",
            "approved_count": len(updated_applications)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk approve applications: {str(e)}"
        )

# ====================================================
# --- MANUAL CONTROL NUMBER MANAGEMENT ENDPOINTS ---
# ====================================================

# PATCH /engineering/driving-applications/{application_id}/assign-control-number
@router.patch("/driving-applications/{application_id}/assign-control-number", response_model=engineering_schemas.DrivingApplicationOut)
async def assign_course_control_number_manual(
    application_id: int,
    control_data: engineering_schemas.DrivingManualControlNumberAssign,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """MANUAL registration control number assignment (Admin only)."""
    try:
        # Get the application
        db_application = await crud.get_driving_application(db, application_id)
        if not db_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")
        
        # Check if application is approved
        if db_application.application_status != "Approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Cannot assign control number to non-approved application"
            )
        
        # Validate manual control number
        if not control_data.control_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Control number is required for manual assignment"
            )
        
        # Validate control number format (12 characters)
        if len(control_data.control_number) != 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Control number must be exactly 12 characters"
            )
        
        control_number = control_data.control_number.upper()
        print(f"Manual control number assigned by {current_user.role}: {control_number}")
        
        update_data = {
            "registration_control_number": control_number,
            "manual_assignment": True,  # Flag for manual assignment
            "assigned_by": current_user.id,
            "assignment_date": datetime.utcnow()
        }
        
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Return enhanced response
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign manual control number: {str(e)}"
        )

# PATCH /engineering/driving-applications/{application_id}/assign-certificate-control-number
@router.patch("/driving-applications/{application_id}/assign-certificate-control-number", response_model=engineering_schemas.DrivingApplicationOut)
async def assign_certificate_control_number_manual(
    application_id: int,
    control_data: engineering_schemas.DrivingManualCertificateControlNumberAssign,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """MANUAL certificate control number assignment (Admin only)."""
    try:
        # Get the application
        db_application = await crud.get_driving_application(db, application_id)
        if not db_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")
        
        # Check if certificate is approved and course is completed
        if not db_application.certificate_approved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Cannot assign certificate control number to non-approved certificate request"
            )
        
        if db_application.course_status != "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course must be completed before assigning certificate control number"
            )
        
        # Validate manual certificate control number
        if not control_data.certificate_control_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Certificate control number is required for manual assignment"
            )
        
        # Validate control number format (12 characters)
        if len(control_data.certificate_control_number) != 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Certificate control number must be exactly 12 characters"
            )
        
        certificate_control_number = control_data.certificate_control_number.upper()
        print(f"Manual certificate control number assigned by {current_user.role}: {certificate_control_number}")
        
        update_data = {
            "certificate_control_number": certificate_control_number,
            "manual_assignment": True,  # Flag for manual assignment
            "assigned_by": current_user.id,
            "assignment_date": datetime.utcnow()
        }
        
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Return enhanced response
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign manual certificate control number: {str(e)}"
        )

# ====================================================
# --- MANUAL COURSE STATUS MANAGEMENT ENDPOINTS ---
# ====================================================

# PUT /engineering/driving-applications/{application_id}/course-status
@router.put("/driving-applications/{application_id}/course-status", response_model=engineering_schemas.DrivingApplicationOut)
async def update_driving_course_status_manual(
    application_id: int,
    status_data: engineering_schemas.DrivingCourseStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """MANUAL course status update for driving application (HOD/Engineering Staff only)."""
    try:
        # Get the application
        db_application = await crud.get_driving_application(db, application_id)
        if not db_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")
        
        # Validate course status transition
        valid_statuses = ["Not Started", "Started", "Completed"]
        if status_data.course_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid course status. Must be one of: {valid_statuses}"
            )
        
        # Check if registration control number is assigned (for starting/completing course)
        if status_data.course_status in ["Started", "Completed"] and not db_application.registration_control_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start or complete course without registration control number assigned"
            )
        
        # Prepare update data
        update_data = {
            "course_status": status_data.course_status,
            "manual_update": True  # Flag to indicate manual update
        }
        
        # Set timestamps based on status
        if status_data.course_status == "Started":
            update_data["course_started_at"] = datetime.utcnow()
        elif status_data.course_status == "Completed":
            update_data["course_completed_at"] = datetime.utcnow()
            update_data["completion_date"] = datetime.utcnow()
        
        # Update the application
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Return enhanced response
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update course status: {str(e)}"
        )

# POST /engineering/driving-applications/{application_id}/start-course
@router.post("/driving-applications/{application_id}/start-course", response_model=engineering_schemas.DrivingApplicationOut)
async def start_driving_course_manual(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """MANUALLY mark course as started (HOD/Engineering Staff only)."""
    try:
        # Get the application
        db_application = await crud.get_driving_application(db, application_id)
        if not db_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")
        
        # Check if registration control number is assigned
        if not db_application.registration_control_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start course without registration control number assigned"
            )
        
        # Check if course is already completed
        if db_application.course_status == "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course is already completed"
            )
        
        update_data = {
            "course_status": "Started",
            "course_started_at": datetime.utcnow(),
            "manual_update": True
        }
        
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Return enhanced response
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start course: {str(e)}"
        )

# POST /engineering/driving-applications/{application_id}/complete-course
@router.post("/driving-applications/{application_id}/complete-course", response_model=engineering_schemas.DrivingApplicationOut)
async def complete_driving_course_manual(
    application_id: int,
    grade_data: engineering_schemas.DrivingCourseComplete,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """MANUALLY mark course as completed (HOD/Engineering Staff only)."""
    try:
        # Get the application
        db_application = await crud.get_driving_application(db, application_id)
        if not db_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")
        
        # Check if course is started
        if db_application.course_status != "Started":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course must be started before it can be completed"
            )
        
        update_data = {
            "course_status": "Completed",
            "course_completed_at": datetime.utcnow(),
            "completion_date": datetime.utcnow(),
            "grade": grade_data.grade,
            "manual_update": True
        }
        
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Return enhanced response
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete course: {str(e)}"
        )

# ====================================================
# --- BULK OPERATIONS ENDPOINTS ---
# ====================================================

# POST /engineering/driving-applications/bulk-update-status
@router.patch("/driving-applications/bulk-update-status", response_model=dict)
async def bulk_update_application_status_frontend(
    update_data: engineering_schemas.BulkApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Bulk update status for multiple driving applications."""
    try:
        updated_applications = await crud.bulk_update_application_status(
            db, update_data.application_ids, update_data.status
        )
        return {"message": f"Updated status for {len(updated_applications)} applications", "count": len(updated_applications)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update applications: {str(e)}"
        )

# ====================================================
# --- CERTIFICATE WORKFLOW ENDPOINTS ---
# ====================================================

# POST /engineering/driving-applications/{application_id}/request-certificate
@router.post("/driving-applications/{application_id}/request-certificate", response_model=engineering_schemas.DrivingApplicationOut)
async def request_driving_certificate(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Initiate a certificate request for a driving application."""
    try:
        # Check if application exists and belongs to user (if not staff)
        db_application = await crud.get_driving_application(db, application_id)
        if not db_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Check if user owns this application (unless they're staff)
        if current_user.role not in ["admin", "engineering_staff"] and db_application.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this application")

        update_data = {
            "certificate_requested": True,
            "certificate_request_date": datetime.utcnow()
        }
        updated_application = await crud.update_driving_application(db, application_id, update_data)

        # Use Pydantic's model_validate for safe ORM object to dict conversion
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        # ENSURE SAFE ACCESS: Enhance with course data
        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to request certificate: {str(e)}"
        )

# PATCH /engineering/driving-applications/{application_id}/approve-certificate
@router.patch("/driving-applications/{application_id}/approve-certificate", response_model=engineering_schemas.DrivingApplicationOut)
async def approve_certificate_request_frontend(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Approve certificate request for driving application."""
    try:
        update_data = {
            "certificate_approved": True,
            "certificate_approval_date": datetime.utcnow()
        }
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Use Pydantic's model_validate for safe ORM object to dict conversion
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        # ENSURE SAFE ACCESS: Enhance with course data
        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve certificate: {str(e)}"
        )

# POST /engineering/driving-applications/{application_id}/issue-certificate
@router.post("/driving-applications/{application_id}/issue-certificate", response_model=engineering_schemas.DrivingApplicationOut)
async def issue_driving_certificate_frontend(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Issue certificate for driving application."""
    try:
        update_data = {
            "certificate_issued": True,
            "certificate_issue_date": datetime.utcnow(),
            "issued_by": current_user.id
        }
        updated_application = await crud.update_driving_application(db, application_id, update_data)
        if not updated_application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driving application not found")

        # Use Pydantic's model_validate for safe ORM object to dict conversion
        base_app_data = engineering_schemas.DrivingApplicationOut.model_validate(updated_application).model_dump()
        app_dict = {**base_app_data}

        # ENSURE SAFE ACCESS: Enhance with course data
        if updated_application.course:
            app_dict["course_name"] = updated_application.course.course_name
            app_dict["course_type"] = updated_application.course.course_type
            app_dict["course_duration"] = updated_application.course.duration
            app_dict["course_price"] = updated_application.course.price

        return engineering_schemas.DrivingApplicationOut.model_validate(app_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to issue certificate: {str(e)}"
        )

# ====================================================
# --- REPORTS AND ANALYTICS ENDPOINTS ---
# ====================================================

# GET /engineering/driving-applications/pending-certificates
@router.get("/driving-applications/pending-certificates", response_model=List[engineering_schemas.DrivingApplicationOut])
async def get_pending_certificate_requests_frontend(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Get all driving applications that have requested a certificate but have not yet been issued one."""
    try:
        applications = await crud.get_pending_certificate_requests(db)

        enhanced_applications = []
        for app in applications:
            # Build the response data safely (similar logic to get_driving_applications)
            app_data = engineering_schemas.DrivingApplicationOut.model_validate(app).model_dump()

            # Enhance with course data
            if app.course:
                app_data["course_name"] = app.course.course_name
                app_data["course_type"] = app.course.course_type
                app_data["course_duration"] = app.course.duration
                app_data["course_price"] = app.course.price

            enhanced_applications.append(engineering_schemas.DrivingApplicationOut.model_validate(app_data))

        return enhanced_applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending certificate requests: {str(e)}"
        )

# GET /engineering/driving-school/reports
@router.get("/driving-school/reports")
async def get_driving_school_reports(
    quarter: Optional[str] = None,
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Generate driving school reports based on quarter and year."""
    try:
        report_data = await crud.generate_driving_school_reports(db, quarter, year)
        return report_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate driving school reports: {str(e)}"
        )

# GET /engineering/driving-school/dashboard-stats
@router.get("/driving-school/dashboard-stats")
async def get_driving_school_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Get dashboard statistics for driving school."""
    try:
        # Get all applications
        applications = await crud.get_driving_applications(db)
        
        # Calculate statistics
        total_applications = len(applications)
        approved_applications = len([app for app in applications if app.application_status == "Approved"])
        completed_courses = len([app for app in applications if app.course_status == "Completed"])
        certificate_requests = len([app for app in applications if app.certificate_requested])
        issued_certificates = len([app for app in applications if app.certificate_issued])
        
        # Calculate revenue
        registration_revenue = len([app for app in applications if app.registration_control_number]) * 150000
        certificate_revenue = len([app for app in applications if app.certificate_control_number]) * 20000
        total_revenue = registration_revenue + certificate_revenue
        
        # Get courses count
        courses = await crud.get_driving_courses(db)
        total_courses = len(courses)
        
        return {
            "total_applications": total_applications,
            "approved_applications": approved_applications,
            "completed_courses": completed_courses,
            "certificate_requests": certificate_requests,
            "issued_certificates": issued_certificates,
            "registration_revenue": registration_revenue,
            "certificate_revenue": certificate_revenue,
            "total_revenue": total_revenue,
            "total_courses": total_courses
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard statistics: {str(e)}"
        )

# ====================================================
# --- SEARCH AND FILTER ENDPOINTS ---
# ====================================================

# GET /engineering/driving-applications/search
@router.get("/driving-applications/search", response_model=List[engineering_schemas.DrivingApplicationOut])
async def search_driving_applications(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_authorized_engineering_staff)
):
    """Search driving applications by student name or phone number."""
    try:
        # This is a simple implementation - you might want to enhance it with full-text search
        applications = await crud.get_driving_applications(db)
        
        # Filter applications based on search query
        filtered_applications = [
            app for app in applications 
            if q.lower() in app.student_full_name.lower() or 
               q in app.phone_number
        ]

        enhanced_applications = []
        for app in filtered_applications:
            app_data = engineering_schemas.DrivingApplicationOut.model_validate(app).model_dump()

            # Enhance with course data
            if app.course:
                app_data["course_name"] = app.course.course_name
                app_data["course_type"] = app.course.course_type
                app_data["course_duration"] = app.course.duration
                app_data["course_price"] = app.course.price

            enhanced_applications.append(engineering_schemas.DrivingApplicationOut.model_validate(app_data))

        return enhanced_applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search driving applications: {str(e)}"
        )