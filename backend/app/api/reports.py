from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db, Report
from ..auth.rbac import get_current_user, User
from ..tasks.celery_app import generate_report_task
from pydantic import BaseModel

router = APIRouter(prefix="/api/reports", tags=["reports"])

class ReportRequest(BaseModel):
    investigation_id: int
    format: str

@router.get("/")
async def list_reports(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Report).where(Report.user_id == user.id))
    return result.scalars().all()

@router.post("/generate")
async def generate_report(req: ReportRequest, user: User = Depends(get_current_user)):
    generate_report_task.delay(req.investigation_id, req.format)
    return {"message": "Report generation started"}

@router.get("/{id}/download")
async def download_report(id: int, format: str = "pdf", db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Report).where(Report.id == id, Report.user_id == user.id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    # Stub: Return file stream in real implementation
    return {"download_url": f"/files/{report.file_path}"}
