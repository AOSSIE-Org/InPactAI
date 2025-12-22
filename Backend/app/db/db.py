from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Fetch database credentials
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Corrected async SQLAlchemy connection string (removed `sslmode=require`)
DATABASE_URL = f"postgresql+asyncpg://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

# Initialize async SQLAlchemy components
try:
    # Supabase (and some other cloud providers) may have issues with IPv6.
    # We can try to force parameters or handle connection logic robustly.
    # For now, we wrap the engine creation in a try-except block to prevent
    # the entire app from crashing if credentials are wrong or DB is unreachable.

    # "ssl": "require" is critical for Supabase connections
    engine = create_async_engine(
        DATABASE_URL, echo=True, connect_args={"ssl": "require"}
    )

    AsyncSessionLocal = sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )
    Base = declarative_base()
    print("✅ Database connected successfully!")
except SQLAlchemyError as e:
    print(f"❌ Error connecting to the database: {e}")
    # Set to None so main.py can check against them
    engine = None
    AsyncSessionLocal = None
    Base = None


async def get_db():
    """
    Dependency generator for database sessions.

    Yields:
        AsyncSession: An asynchronous database session.

    Raises:
        RuntimeError: If the database engine is not initialized.
    """
    if AsyncSessionLocal is None:
        raise RuntimeError("Database engine is not initialized. Check your connection settings.")
    
    async with AsyncSessionLocal() as session:
        yield session
