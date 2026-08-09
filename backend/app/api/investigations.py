from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db, Investigation, InvestigationStatus
from ..auth.rbac import get_current_user, User
from pydantic import BaseModel

router = APIRouter(prefix="/api/investigations", tags=["investigations"])

class InvestigationCreate(BaseModel):
    title: str
    playbook_name: str

@router.get("/")
async def list_investigations(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Investigation).where(Investigation.user_id == user.id))
    return result.scalars().all()

@router.get("/{id}")
async def get_investigation(id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Investigation).where(Investigation.id == id, Investigation.user_id == user.id))
    inv = result.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv

@router.post("/")
async def create_investigation(req: InvestigationCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    inv = Investigation(user_id=user.id, title=req.title, playbook_name=req.playbook_name, status=InvestigationStatus.pending)
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    return inv

@router.put("/{id}/approve")
async def approve_investigation(id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    # Requires senior or manager (add RBAC dependency as needed)
    result = await db.execute(select(Investigation).where(Investigation.id == id))
    inv = result.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    inv.status = InvestigationStatus.running
    await db.commit()
    return {"status": "approved"}

@router.delete("/{id}")
async def delete_investigation(id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Investigation).where(Investigation.id == id, Investigation.user_id == user.id))
    inv = result.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    await db.delete(inv)
    await db.commit()
    return {"status": "deleted"}
