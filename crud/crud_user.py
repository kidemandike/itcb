from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import Optional, List

import models
import schemas
from auth import get_password_hash # Assuming this is accessible

# --- User CRUD Operations ---

async def get_user_by_email(db: AsyncSession, email: str) -> models.User | None:
    """Fetches a user by their email address."""
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> models.User | None:
    """Fetches a user by their ID."""
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalars().first()

async def get_all_users(db: AsyncSession) -> list[models.User]:
    """Fetches all users from the database."""
    result = await db.execute(select(models.User))
    return list(result.scalars().all())

async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
    """Creates a new user in the database."""
    hashed_password = get_password_hash(user.password)
    full_name = f"{user.first_name} {user.last_name}".strip() if user.first_name and user.last_name else user.full_name

    db_user = models.User(
        full_name=full_name,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_password,
        is_active=True,
        role=user.role 
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user_id: int, user_update: schemas.UserUpdate) -> models.User | None:
    """Updates an existing user's information."""
    db_user = await get_user_by_id(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True) 

    for key, value in update_data.items():
        setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user

async def delete_user(db: AsyncSession, user_id: int) -> bool:
    """Deletes a user by their ID."""
    result = await db.execute(delete(models.User).where(models.User.id == user_id))
    await db.commit()
    return result.rowcount > 0