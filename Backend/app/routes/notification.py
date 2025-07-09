from fastapi import APIRouter, Depends, HTTPException, status, Body, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from typing import List
from app.models.models import Notification
from app.db.db import get_db
import jwt
import os
from supabase import create_client, Client
from datetime import datetime, timezone
import uuid
import logging
from fastapi.responses import JSONResponse

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    logger.error("SUPABASE_URL and SUPABASE_KEY environment variables must be set")
    raise RuntimeError("Missing required Supabase configuration")
supabase: Client = create_client(supabase_url, supabase_key)

# Set up logging
logger = logging.getLogger("notification")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
handler.setFormatter(formatter)
if not logger.hasHandlers():
    logger.addHandler(handler)

def insert_notification_to_supabase(notification_dict):
    try:
        supabase.table("notifications").insert(notification_dict).execute()
        logger.info(f"Notification {notification_dict['id']} inserted into Supabase.")
        return True
    except Exception as e:
        logger.error(f"Failed to insert notification {notification_dict['id']} into Supabase: {e}")
        # Optionally, add to a retry queue here
        return False

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Use the Supabase JWT public key for RS256 verification
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
SUPABASE_JWT_PUBLIC_KEY = os.environ.get("SUPABASE_JWT_PUBLIC_KEY")
SUPABASE_JWT_AUDIENCE = os.environ.get("SUPABASE_JWT_AUDIENCE", "padhvzdttdlxbvldvdhz")

# Dependency to verify JWT and extract user id
# Make sure to set SUPABASE_JWT_PUBLIC_KEY in your environment (from Supabase Project Settings > API > JWT Verification Key)
def get_current_user(authorization: str = Header(...)):
    logger.info(f"Authorization header received: {authorization}")
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("Missing or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    # Try RS256 first
    try:
        if SUPABASE_JWT_PUBLIC_KEY:
            logger.info("Trying RS256 verification...")
            payload = jwt.decode(
                token,
                SUPABASE_JWT_PUBLIC_KEY,
                algorithms=["RS256"],
                audience=SUPABASE_JWT_AUDIENCE,
            )
            logger.info("RS256 verification succeeded.")
            user_id = payload.get("sub")
            if not user_id:
                logger.error("No user_id in payload (RS256)")
                raise HTTPException(status_code=401, detail="Invalid token payload: no user id (RS256)")
            return {"id": user_id}
        else:
            logger.warning("No RS256 public key set, skipping RS256 check.")
    except Exception as e:
        logger.error(f"RS256 verification failed: {str(e)}")
    # Try HS256 as fallback
    try:
        if SUPABASE_JWT_SECRET:
            logger.info("Trying HS256 verification...")
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience=SUPABASE_JWT_AUDIENCE,
            )
            logger.info("HS256 verification succeeded.")
            user_id = payload.get("sub")
            if not user_id:
                logger.error("No user_id in payload (HS256)")
                raise HTTPException(status_code=401, detail="Invalid token payload: no user id (HS256)")
            return {"id": user_id}
        else:
            logger.warning("No HS256 secret set, skipping HS256 check.")
    except Exception as e:
        logger.error(f"HS256 verification failed: {str(e)}")
    logger.error("Both RS256 and HS256 verification failed.")
    raise HTTPException(status_code=401, detail="Invalid token: could not verify with RS256 or HS256.")

@router.get("/", response_model=List[dict])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    try:
        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == user["id"])
            .order_by(Notification.created_at.desc())
        )
        notifs = result.scalars().all()
        return [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "category": n.category,
                "created_at": n.created_at,
                "type": n.type,
                "link": n.link,
            }
            for n in notifs
        ]
    except Exception as e:
        logger.error(f"Failed to fetch notifications: {e}")
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": "Failed to fetch notifications."})

@router.post("/", status_code=201)
async def create_notification(
    notification: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    try:
        # Generate a UUID for the notification
        notif_id = str(uuid.uuid4())
        now_utc = datetime.now(timezone.utc)
        created_at = notification.get("created_at")
        if created_at:
            # Parse and convert to UTC if needed
            try:
                created_at = datetime.fromisoformat(created_at)
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                else:
                    created_at = created_at.astimezone(timezone.utc)
            except Exception as e:
                logger.warning(f"Invalid created_at format, using now: {e}")
                created_at = now_utc
        else:
            created_at = now_utc

        notif_obj = Notification(
            id=notif_id,
            user_id=user["id"],
            type=notification.get("type"),
            title=notification["title"],
            message=notification["message"],
            link=notification.get("link"),
            is_read=notification.get("is_read", False),
            category=notification.get("category"),
            created_at=created_at,
        )
        db.add(notif_obj)
        await db.commit()
        await db.refresh(notif_obj)
        # Insert into Supabase for realtime
        notif_dict = {
            "id": notif_obj.id,
            "user_id": notif_obj.user_id,
            "type": notif_obj.type,
            "title": notif_obj.title,
            "message": notif_obj.message,
            "link": notif_obj.link,
            "is_read": notif_obj.is_read,
            "category": notif_obj.category,
            "created_at": notif_obj.created_at.astimezone(timezone.utc).isoformat() if notif_obj.created_at else None,
        }
        supabase_ok = insert_notification_to_supabase(notif_dict)
        if not supabase_ok:
            logger.error(f"Notification {notif_id} saved locally but failed to push to Supabase.")
            return JSONResponse(status_code=202, content={"error": "Notification saved locally, but failed to push to Supabase. Realtime delivery may be delayed."})
        logger.info(f"Notification {notif_id} created for user {user['id']}.")
        return notif_dict
    except Exception as e:
        logger.error(f"Failed to create notification: {e}")
        await db.rollback()
        return JSONResponse(status_code=500, content={"error": f"Failed to create notification: {str(e)}"})

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notifications(
    ids: List[str] = Body(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    from fastapi.responses import JSONResponse
    if not ids or not isinstance(ids, list) or len(ids) == 0:
        logger.warning("Delete notifications called with empty or invalid ids list.")
        return JSONResponse(status_code=400, content={"error": "No notification IDs provided for deletion."})
    try:
        result = await db.execute(
            delete(Notification)
            .where(Notification.user_id == user["id"])
            .where(Notification.id.in_(ids))
        )
        await db.commit()
        if result.rowcount == 0:
            logger.warning(f"No notifications deleted for user {user['id']} with ids: {ids}")
            return JSONResponse(status_code=404, content={"error": "No notifications found to delete."})
        return
    except Exception as e:
        logger.error(f"Failed to delete notifications: {e}")
        await db.rollback()
        return JSONResponse(status_code=500, content={"error": "Failed to delete notifications."})

@router.patch("/mark-read", status_code=status.HTTP_200_OK)
async def mark_notifications_read(
    ids: List[str] = Body(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    from fastapi.responses import JSONResponse
    if not ids or not isinstance(ids, list) or len(ids) == 0:
        logger.warning("Mark notifications read called with empty or invalid ids list.")
        return JSONResponse(status_code=400, content={"error": "No notification IDs provided to mark as read."})
    try:
        result = await db.execute(
            update(Notification)
            .where(Notification.user_id == user["id"])
            .where(Notification.id.in_(ids))
            .values(is_read=True)
        )
        await db.commit()
        if result.rowcount == 0:
            logger.warning(f"No notifications marked as read for user {user['id']} with ids: {ids}")
            return JSONResponse(status_code=404, content={"error": "No notifications found to mark as read."})
        return {"success": True}
    except Exception as e:
        logger.error(f"Failed to mark notifications as read: {e}")
        await db.rollback()
        return JSONResponse(status_code=500, content={"error": "Failed to mark notifications as read."}) 