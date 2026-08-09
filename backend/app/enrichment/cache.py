import json
import redis
from functools import wraps
from ..config import settings

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def cached(ttl=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = f"cache:{func.__name__}:{str(args)}:{str(kwargs)}"
            try:
                cached_val = redis_client.get(key)
                if cached_val:
                    return json.loads(cached_val)
            except Exception:
                pass
                
            result = await func(*args, **kwargs)
            
            try:
                redis_client.setex(key, ttl, json.dumps(result))
            except Exception:
                pass
                
            return result
        return wrapper
    return decorator
