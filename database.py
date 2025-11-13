import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# --- Configuration ---

# Create an asynchronous SQLAlchemy engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Configure an asynchronous sessionmaker
AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
)

# Base class for our declarative models
Base = declarative_base()

# --- Database Dependency ---

async def get_db():
    """
    Provides a new AsyncSession for each request.
    Automatically commits on success and rolls back on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# --- Cleanup Function (New) ---

async def close_db():
    """
    Disposes of the SQLAlchemy engine to close all database connections.
    """
    await engine.dispose()
    print("Database engine disposed and connections closed.")

# --- Initialization Function ---

async def init_db():
    """Function to create all database tables based on Base metadata."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized/checked.")