from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from ..db.db import get_db
from ..models.models import Collaboration

router = APIRouter(prefix="/collaboration", tags=["Collaboration"])

@router.put("/update-status/{collab_id}")
async def update_collab_status(
    collab_id: str, 
    status: str, 
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Updates the status of a collaboration request.
    Includes validation to ensure the record exists.
    """
    if status not in ["accepted", "denied"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    query = update(Collaboration).where(Collaboration.id == collab_id).values(status=status)
    result = await db.execute(query)
    await db.commit()
    
    # Major fix: Check if the row actually existed
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail=f"Collaboration {collab_id} not found")
        
    return {"message": f"Collaboration {status} successfully"}