from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
import socket

# Load environment variables from .env
load_dotenv()

# Fetch database credentials
USER = os.getenv("user")
PASSWORD = quote_plus(os.getenv("password") or "")

HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Resolve IPv4 address for HOST to avoid intermittent DNS issues on Windows
if HOST and PORT:
    try:
        addrinfo = socket.getaddrinfo(
            HOST,
            int(PORT),
            socket.AF_INET,
            socket.SOCK_STREAM,
        )
        HOST_IP = addrinfo[0][4][0] if addrinfo else HOST
    except Exception:
        HOST_IP = HOST
else:
    HOST_IP = HOST

# Build async SQLAlchemy connection string
DATABASE_URL = f"postgresql+asyncpg://{USER}:{PASSWORD}@{HOST_IP}:{PORT}/{DBNAME}"
print(f"DB URL: postgresql+asyncpg://{USER}:***@{HOST_IP}:{PORT}/{DBNAME}")

# Initialize async SQLAlchemy components
try:
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        connect_args={"ssl": "require"},
    )

    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    Base = declarative_base()
    print("✅ Database connected successfully!")
except SQLAlchemyError as e:
    print(f"❌ Error connecting to the database: {e}")
    engine = None
    AsyncSessionLocal = None
    Base = None


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
