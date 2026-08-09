from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum, JSON
import enum
import logging
import os
from datetime import datetime
from .config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
# When running outside Docker container, host 'postgres' won't resolve/connect -> use SQLite
if "postgres:5432" in db_url or "localhost:5432" in db_url:
    try:
        import socket
        host = "postgres" if "postgres:5432" in db_url else "localhost"
        s = socket.create_connection((host, 5432), timeout=1)
        s.close()
    except Exception:
        logger.info("PostgreSQL service not reachable locally; using SQLite database at ./siem.db")
        db_url = "sqlite+aiosqlite:///./siem.db"

engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

class RoleEnum(str, enum.Enum):
    analyst = "analyst"
    senior_analyst = "senior_analyst"
    soc_manager = "soc_manager"

class InvestigationStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"

class ReportFormat(str, enum.Enum):
    pdf = "pdf"
    html = "html"
    markdown = "markdown"
    json = "json"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.analyst)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer)
    role = Column(Enum(MessageRole))
    content = Column(String)
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer)
    user_id = Column(Integer)
    title = Column(String)
    status = Column(Enum(InvestigationStatus), default=InvestigationStatus.pending)
    playbook_name = Column(String)
    findings_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer)
    user_id = Column(Integer)
    format = Column(Enum(ReportFormat))
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    action = Column(String)
    resource = Column(String)
    details_json = Column(JSON)
    ip_address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def create_all_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
