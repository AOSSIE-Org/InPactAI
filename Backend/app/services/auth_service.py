from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    """Hashes a plain text password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """Verifies a plain text password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """Generates a secure JWT access token with a timezone-aware expiry."""
    to_encode = data.copy()
    # Using timezone-aware UTC to fix CodeRabbit's 'Minor' issue
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)