# routes/department.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

# Assuming your project structure has these imports available
import schemas
import crud
from database import get_db # Dependency for database session
# from auth import get_current_active_user, get_current_active_admin # For authentication

router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
    # dependencies=[Depends(get_current_active_user)] # Example: require login for all department operations
)

# Placeholder for Auth Dependency (uncomment and adjust as needed)
# async def get_current_active_admin(user: schemas.UserOut = Depends(get_current_active_user)):
#     if user.role != "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Only administrators can manage departments."
#         )
#     return user

@router.post(
    "/", 
    response_model=schemas.DepartmentOut, 
    status_code=status.HTTP_201_CREATED
    # dependencies=[Depends(get_current_active_admin)] # Restrict creation to Admin
)
async def create_new_department(
    department: schemas.DepartmentCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Create a new academic or institutional department."""
    # Check if a department with the same name already exists
    db_department = await crud.get_department_by_name(db, name=department.name)
    if db_department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department name already registered."
        )
    return await crud.create_department(db=db, department=department)


@router.get(
    "/", 
    response_model=List[schemas.DepartmentOut]
)
async def read_departments(db: AsyncSession = Depends(get_db)):
    """Retrieve a list of all departments."""
    departments = await crud.get_all_departments(db)
    return departments


@router.get(
    "/{department_id}", 
    response_model=schemas.DepartmentOut
)
async def read_department(department_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific department by its ID."""
    db_department = await crud.get_department_by_id(db, department_id=department_id)
    if db_department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Department not found"
        )
    return db_department


@router.patch(
    "/{department_id}", 
    response_model=schemas.DepartmentOut
    # dependencies=[Depends(get_current_active_admin)] # Restrict update to Admin
)
async def update_existing_department(
    department_id: int, 
    department_update: schemas.DepartmentUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update details for an existing department."""
    db_department = await crud.update_department(db, department_id, department_update)
    if db_department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Department not found"
        )
    return db_department


@router.delete(
    "/{department_id}", 
    status_code=status.HTTP_204_NO_CONTENT
    # dependencies=[Depends(get_current_active_admin)] # Restrict deletion to Admin
)
async def delete_existing_department(department_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a department by its ID."""
    success = await crud.delete_department(db, department_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Department not found"
        )
    return