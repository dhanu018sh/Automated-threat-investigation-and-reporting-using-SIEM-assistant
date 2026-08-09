from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db, User
from .jwt_handler import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

ROLE_PERMISSIONS = {
    "analyst": ["read_queries", "run_playbooks", "view_reports"],
    "senior_analyst": ["read_queries", "run_playbooks", "view_reports", "generate_reports", "run_high_impact"],
    "soc_manager": ["read_queries", "run_playbooks", "view_reports", "generate_reports", "run_high_impact", "manage_users", "view_audit_logs"]
}

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

def _get_role_str(role) -> str:
    if hasattr(role, "value"):
        return role.value
    return str(role) if role else "analyst"

def require_role(required_role: str):
    async def role_dependency(current_user: User = Depends(get_current_user)):
        roles_hierarchy = {"analyst": 1, "senior_analyst": 2, "soc_manager": 3}
        user_role = _get_role_str(current_user.role)
        if roles_hierarchy.get(user_role, 0) < roles_hierarchy.get(required_role, 0):
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return role_dependency

def require_permission(permission: str):
    async def permission_dependency(current_user: User = Depends(get_current_user)):
        user_role = _get_role_str(current_user.role)
        perms = ROLE_PERMISSIONS.get(user_role, [])
        if permission not in perms:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return permission_dependency
