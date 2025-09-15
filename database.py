# database.py
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Create an asynchronous SQLAlchemy engine
# echo=True will log all SQL statements, useful for debugging
engine = create_async_engine(DATABASE_URL, echo=True)

# Configure an asynchronous sessionmaker
# expire_on_commit=False prevents objects from being expired after commit
# which can be useful for keeping them in memory for further operations
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for our declarative models
Base = declarative_base()

# Dependency to get a database session
# This will be used in our FastAPI route functions
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Function to create all database tables based on Base metadata
async def init_db():
    async with engine.begin() as conn:
        # Drop all tables (USE WITH CAUTION IN PRODUCTION)
        # await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized/checked.")