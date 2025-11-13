import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# ===== DEBUG SECTION =====
print("\n" + "="*80)
print("ALEMBIC DEBUG INFO")
print("="*80)
print(f"Current working directory: {os.getcwd()}")
print(f"Script location: {Path(__file__).parent}")
print(f"Config file: {context.config.config_file_name}")
print(f"Config file exists: {Path(context.config.config_file_name).exists() if context.config.config_file_name else 'N/A'}")
print("="*80 + "\n")
# ===== END DEBUG =====

# Add your project path to Python path
project_path = r"D:\ITCB\system\backend\.backend"
if project_path not in sys.path:
    sys.path.insert(0, project_path)

# Import your models
try:
    from models import Base
    import models
    target_metadata = Base.metadata
    print("✅ Models imported successfully")
except ImportError as e:
    print(f"❌ Could not import models: {e}")
    target_metadata = None

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Load DATABASE_URL from .env
from dotenv import load_dotenv

env_path = Path(project_path) / '.env'
print(f"Looking for .env at: {env_path}")
print(f".env exists: {env_path.exists()}")

load_dotenv(dotenv_path=env_path)

database_url = os.getenv("DATABASE_URL")
print(f"DATABASE_URL from .env: {database_url}")

# Get URL from alembic.ini
ini_url = config.get_main_option("sqlalchemy.url")
print(f"URL from alembic.ini: {ini_url}")

# Prefer .env over alembic.ini
if database_url:
    print(f"✅ Using DATABASE_URL from .env")
    config.set_main_option("sqlalchemy.url", database_url)
    final_url = database_url
else:
    print(f"⚠️  Using URL from alembic.ini")
    final_url = ini_url

# Ensure asyncpg driver
if final_url:
    if 'postgresql://' in final_url and 'asyncpg' not in final_url:
        final_url = final_url.replace('postgresql://', 'postgresql+asyncpg://')
        print(f"🔧 Converted to asyncpg: {final_url}")
    
    if 'psycopg2' in final_url:
        final_url = final_url.replace('psycopg2', 'asyncpg')
        print(f"🔧 Replaced psycopg2 with asyncpg: {final_url}")
    
    config.set_main_option("sqlalchemy.url", final_url)

print(f"🔗 Final URL: {final_url}")
print("="*80 + "\n")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Helper function to run migrations with a connection."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode using async engine."""
    url = config.get_main_option("sqlalchemy.url")
    
    if not url:
        raise ValueError("No database URL found!")
    
    if 'asyncpg' not in url:
        raise ValueError(f"URL must contain 'asyncpg': {url}")
    
    print(f"Creating engine with URL: {url}")
    
    connectable = create_async_engine(
        url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()