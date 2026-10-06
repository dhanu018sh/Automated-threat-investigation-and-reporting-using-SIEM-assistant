from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
import logging
from .database import create_all_tables, AsyncSessionLocal, User, RoleEnum
from .api import chat, investigations, reports, auth, live_siem
from .siem.factory import get_siem_connector
from .config import settings
from .auth.jwt_handler import get_password_hash

logger = logging.getLogger(__name__)

app = FastAPI(title="SIEM Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def seed_demo_users():
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(User).where(User.username == "analyst"))
            if not result.scalars().first():
                demo_analyst = User(
                    username="analyst",
                    email="analyst@siem.local",
                    hashed_password=get_password_hash("analyst123"),
                    role=RoleEnum.analyst
                )
                session.add(demo_analyst)
            
            result_mgr = await session.execute(select(User).where(User.username == "manager"))
            if not result_mgr.scalars().first():
                demo_mgr = User(
                    username="manager",
                    email="manager@siem.local",
                    hashed_password=get_password_hash("manager123"),
                    role=RoleEnum.soc_manager
                )
                session.add(demo_mgr)
            
            await session.commit()
            logger.info("Demo users (analyst/analyst123, manager/manager123) verified/seeded.")
    except Exception as e:
        logger.warning(f"Error seeding demo users: {e}")

@app.on_event("startup")
async def startup_event():
    await create_all_tables()
    await seed_demo_users()
    connector = get_siem_connector(settings.SIEM_PLATFORM)
    await connector.test_connection()

@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    response = await call_next(request)
    return response

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(investigations.router)
app.include_router(reports.router)
app.include_router(live_siem.router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "siem_platform": settings.SIEM_PLATFORM,
        "version": "1.0.0"
    }
