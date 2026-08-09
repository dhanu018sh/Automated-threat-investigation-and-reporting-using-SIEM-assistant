import time
import redis
import logging
from fastapi import HTTPException, Request, Depends
from ..config import settings
from ..auth.rbac import get_current_user
from ..database import User

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, limit=10, window=60):
        self.limit = limit
        self.window = window
        try:
            self.redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception:
            self.redis = None
        
    async def __call__(self, request: Request, current_user: User = Depends(get_current_user)):
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role or "")
        if user_role == "soc_manager":
            return True
            
        key = f"rate_limit:{current_user.id}"
        now = time.time()
        
        try:
            if self.redis:
                pipeline = self.redis.pipeline()
                pipeline.zremrangebyscore(key, 0, now - self.window)
                pipeline.zcard(key)
                pipeline.zadd(key, {str(now): now})
                pipeline.expire(key, self.window)
                results = pipeline.execute()
                
                count = results[1]
                if count >= self.limit:
                    raise HTTPException(status_code=429, detail="Too Many Requests")
        except HTTPException:
            raise
        except Exception as e:
            logger.debug(f"Redis rate limiter bypassed: {e}")
            
        return True
