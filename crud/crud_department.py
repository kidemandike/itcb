from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import Optional, List

import models
import schemas

# --- Department CRUD Operations ---

async def get_department_by_id(db: AsyncSession, department_id: int) -> models.Department | None:
    """Fetches a department by its ID."""
    result = await db.execute(select(models.Department).where(models.Department.id == department_id))
    return result.scalars().first()

async def get_department_by_name(db: AsyncSession, name: str) -> models.Department | None:
    """Fetches a department by its unique name."""
    result = await db.execute(select(models.Department).where(models.Department.name == name))
    return result.scalars().first()

async def get_all_departments(db: AsyncSession) -> list[models.Department]:
    """Fetches all departments from the database."""
    result = await db.execute(select(models.Department))
    return list(result.scalars().all())

async def create_department(db: AsyncSession, department: schemas.DepartmentCreate) -> models.Department:
    """Creates a new department."""
    db_department = models.Department(**department.model_dump())
    db.add(db_department)
    await db.commit()
    await db.refresh(db_department)
    return db_department

async def update_department(
    db: AsyncSession, 
    department_id: int, 
    department_update: schemas.DepartmentUpdate
) -> models.Department | None:
    """Updates an existing department's information."""
    db_department = await get_department_by_id(db, department_id)
    if not db_department:
        return None

    update_data = department_update.model_dump(exclude_unset=True) 

    for key, value in update_data.items():
        setattr(db_department, key, value)

    await db.commit()
    await db.refresh(db_department)
    return db_department

async def delete_department(db: AsyncSession, department_id: int) -> bool:
    """Deletes a department by its ID."""
    result = await db.execute(delete(models.Department).where(models.Department.id == department_id))
    await db.commit()
    return result.rowcount > 0