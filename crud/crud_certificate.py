from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

import models
import schemas
from datetime import datetime # Added for the 'issue_certificate' CRUD function

# --- Certificate Application CRUD Operations ---

async def get_all_certificate_applications(db: AsyncSession) -> list[models.CertificateApplication]:
    """Retrieves all certificate application records."""
    stmt = select(models.CertificateApplication)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_certificate_application_by_user_id(db: AsyncSession, user_id: int) -> List[models.CertificateApplication]:
    """Fetches all certificate applications belonging to a specific user ID."""
    stmt = select(models.CertificateApplication).where(models.CertificateApplication.user_id == user_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_certificate_application_by_id(db: AsyncSession, application_id: int) -> Optional[models.CertificateApplication]:
    """Fetches a certificate application by its ID."""
    stmt = select(models.CertificateApplication).where(models.CertificateApplication.id == application_id)
    result = await db.execute(stmt)
    # Using .first() because application_id is typically the primary key
    return result.scalars().first()

async def create_certificate_application(
    db: AsyncSession, 
    application: schemas.CertificateApplicationCreate, 
    user_id: int,
    user_name: str,
    user_email: str
) -> models.CertificateApplication:
    """
    Creates a new certificate application record, handling the mapping of
    'phone_number' from the schema to 'contact_phone' in the model.
    """
    
    app_data = application.model_dump()
    
    # 1. Extract the phone number using the schema key ('phone_number')
    contact_phone_value = app_data.pop("phone_number")
    
    # 2. Create the model instance, passing the user info and the mapped data
    # The remaining fields in app_data (type, purpose, notes, department, 
    # graduation_year, registration_number) are unpacked using **app_data.
    db_application = models.CertificateApplication(
        user_id=user_id,
        user_name=user_name,
        user_email=user_email,
        contact_phone=contact_phone_value, # Explicit mapping to DB column
        staff_status="Pending Review", # Set initial status (if not handled by model default)
        **app_data
    )
    
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    return db_application

async def update_certificate_application_status(
    db: AsyncSession, 
    db_application: models.CertificateApplication, 
    status_update: schemas.CertificateApplicationUpdateStatus,
    staff_id: int
) -> models.CertificateApplication:
    """Updates the staff status of a certificate application."""
    db_application.staff_status = status_update.staff_status
    
    # Set the approver ID if status is 'Approved', clear it otherwise
    if status_update.staff_status == "Approved":
        db_application.approved_by_staff_id = staff_id
    else:
        db_application.approved_by_staff_id = None
        
    await db.commit()
    await db.refresh(db_application)
    return db_application

async def update_certificate_control_number(
    db: AsyncSession, 
    db_application: models.CertificateApplication, 
    control_number: str
) -> models.CertificateApplication:
    """Updates the final control number for a certificate application."""
    db_application.control_number = control_number
    await db.commit()
    await db.refresh(db_application)
    return db_application

async def issue_certificate(
    db: AsyncSession, 
    db_application: models.CertificateApplication
) -> models.CertificateApplication:
    """Marks a certificate application as officially 'issued'."""
    # Assuming your CertificateApplication model has a 'staff_status' field
    # and possibly an 'issued_at' field (if not, you can remove this line)
    db_application.staff_status = "Issued"
    
    await db.commit()
    await db.refresh(db_application)
    return db_application