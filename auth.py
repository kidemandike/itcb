import os
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import User

# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# OAuth2PasswordBearer for handling token in Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hashes a plain password."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Fetches a user by their email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """Dependency to get the current authenticated user from a JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

# --- Role-Based Dependencies ---

async def get_current_admin(current_user: User = Depends(get_current_user)):
    """
    Dependency to check if the current user is authenticated AND has the 'admin' role.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Admin privileges required"
        )
    return current_user

async def get_current_language_staff(current_user: User = Depends(get_current_user)):
    """
    Dependency to check if the current user is authenticated AND has the 'language_staff' role
    (or is an admin for oversight).
    """
    if current_user.role not in ["language_staff", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Language Staff or Admin privileges required"
        )
    return current_user
    
async def get_current_teacher(current_user: User = Depends(get_current_user)):
    """
    ⭐ NEW: Dependency to check for the 'teacher' role (or admin).
    """
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Teacher or Admin privileges required"
        )
    return current_user

async def get_current_engineering_staff(current_user: User = Depends(get_current_user)):
    """
    ⭐ NEW: Dependency to check for the 'engineering_staff' role (or admin).
    """
    if current_user.role not in ["engineering_staff", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Engineering Staff or Admin privileges required"
        )
    return current_user

async def get_current_ice_staff(current_user: User = Depends(get_current_user)):
    """
    ⭐ NEW: Dependency to check for the 'ice_staff' role (or admin).
    """
    if current_user.role not in ["ice_staff", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: ICE Staff or Admin privileges required"
        )
    return current_user