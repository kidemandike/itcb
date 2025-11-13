# routers/certificate_application.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse 
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from io import BytesIO 

import schemas
import crud
from database import get_db
from auth import get_current_user, get_current_admin, get_current_language_staff
import models
# You will also need to import your PDF generation utility, e.g.:
# from .utils import create_pdf_from_application 

router = APIRouter(
    prefix="/certificate-applications",
    tags=["Certificate Applications"]
)

# Helper dependency to check for staff/admin roles
async def get_current_authorized_staff(current_user: models.User = Depends(get_current_user)):
    """
    Checks if the user is authorized to view all applications (admin or language_staff).
    """
    authorized_roles = ["admin", "language_staff"] 
    if current_user.role not in authorized_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Staff or Admin privileges required to view all applications."
        )
    return current_user

# ----------------------------------------------------
#         STAFF/ADMIN ENDPOINTS
# ----------------------------------------------------

@router.get("/", response_model=List[schemas.CertificateApplicationOut], summary="Get all certificate applications (Staff/Admin only)")
async def get_all_applications(
    db: AsyncSession = Depends(get_db),
    current_staff: models.User = Depends(get_current_authorized_staff)
):
    """
    Retrieves a list of all certificate applications for review by authorized staff.
    """
    applications = await crud.get_all_certificate_applications(db)
    return applications
    
@router.patch("/{application_id}/approve-staff", response_model=schemas.CertificateApplicationOut, summary="Approve/Review application status (Language Staff only)")
async def update_application_status(
    application_id: int,
    status_update: schemas.CertificateApplicationUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_staff: models.User = Depends(get_current_language_staff) # Requires 'language_staff' role
):
    """
    Updates the staff status of a specific certificate application (e.g., from 'Pending Review' to 'Approved').
    """
    db_application = await crud.get_certificate_application_by_id(db, application_id)
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    updated_application = await crud.update_certificate_application_status(
        db,
        db_application,
        status_update,
        current_staff.id
    )
    return updated_application

@router.patch("/{application_id}/control-number", response_model=schemas.CertificateApplicationOut, summary="Set final control number (Admin only)")
async def set_application_control_number(
    application_id: int,
    control_update: schemas.CertificateApplicationControlNoUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin) # Requires 'admin' role
):
    """
    Sets the final control number for an application, usually after staff approval.
    """
    db_application = await crud.get_certificate_application_by_id(db, application_id)
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Optional: Check if the application is already approved before setting the control number
    if db_application.staff_status != "Approved":
        raise HTTPException(status_code=400, detail="Application must be approved before setting a control number")
        
    updated_application = await crud.update_certificate_control_number(
        db,
        db_application,
        control_update.control_number
    )
    return updated_application

@router.get(
    "/{application_id}/generate-pdf", 
    summary="Generate and download final certificate PDF (Staff/Admin only)",
) # ⬅️ The response_model is omitted, as we return a StreamingResponse
async def generate_certificate_pdf(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_staff: models.User = Depends(get_current_authorized_staff) # Ensure authorized access
):
    """
    Generates the final PDF certificate for an application that has been approved and numbered.
    """
    db_application = await crud.get_certificate_application_by_id(db, application_id)
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # 1. ENFORCEMENT: Check if the application is ready for PDF generation
    if not db_application.control_number:
        raise HTTPException(status_code=400, detail="Certificate must have a control number before PDF generation.")
    
    # 2. PDF GENERATION: This function must be implemented in your utility/service layer
    # The function should return the PDF content as a BytesIO object (in-memory file buffer).
    # pdf_buffer = await create_pdf_from_application(db_application) # ⬅️ Placeholder function
    
    # --- Dummy Buffer for demonstration ---
    # Replace this block with your actual PDF generation logic.
    pdf_buffer = BytesIO(b"This is a dummy PDF content.")
    filename = f"Certificate_{db_application.control_number}.pdf"
    # --- End Dummy Block ---

    # 3. RESPONSE: Use StreamingResponse to stream the in-memory PDF file
    pdf_buffer.seek(0) # Reset buffer position to the beginning
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            # Forces browser to download the file instead of displaying it inline
            "Content-Disposition": f"attachment; filename={filename}", 
        }
    )

# ----------------------------------------------------
#         USER ENDPOINTS
# ----------------------------------------------------

# ⭐ NEW ENDPOINT: This fixes the 404 error from the student dashboard.
@router.get("/my-requests", response_model=List[schemas.CertificateApplicationOut], summary="Get applications submitted by the current user")
async def get_my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Student/Alumni/General user
):
    """
    Retrieves all certificate applications submitted by the currently authenticated user.
    """
    # This requires a function in your crud.py file named get_certificate_applications_by_user_id
    applications = await crud.get_certificate_application_by_user_id(db, current_user.id)
    return applications
    
@router.post("/", response_model=schemas.CertificateApplicationOut, status_code=status.HTTP_201_CREATED, summary="Submit a new certificate application (All authenticated users)")
async def submit_application(
    application: schemas.CertificateApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Student/Alumni/General user
):
    """
    Submits a new certificate application on behalf of the current user.
    """
    # NOTE: You might want to add logic here to prevent duplicate submissions based on criteria.
    
    new_application = await crud.create_certificate_application(
        db,
        application,
        current_user.id,
        current_user.full_name,
        current_user.email
    )
    return new_application