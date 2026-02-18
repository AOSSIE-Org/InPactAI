from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from ..db.db import get_db
from ..models.models import Collaboration # Verify this name in models/models.py

router = APIRouter(prefix="/collaboration", tags=["Collaboration"])

@router.put("/update-status/{collab_id}")
async def update_collab_status(collab_id: str, status: str, db: AsyncSession = Depends(get_db)):
    if status not in ["accepted", "denied"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # This matches the 'status' column in your sql.txt collaborations table
    query = update(Collaboration).where(Collaboration.id == collab_id).values(status=status)
    await db.execute(query)
    await db.commit()
    return {"message": f"Collaboration {status} successfully"}