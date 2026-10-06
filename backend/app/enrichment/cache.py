"""
Threat Intelligence Enrichment Cache
TTL-based in-memory cache with Redis fallback.
"""
import asyncio
import time
from typing import Any, Callable, Optional
from functools import wraps

# Simple TTL in-memory cache (Redis drop-in when not available)
_cache: dict = {}

def cached(ttl: int = 900):
    """Decorator: cache async function results for `ttl` seconds."""
    def decorator(fn: Callable):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            key = str(args) + str(sorted(kwargs.items()))
            entry = _cache.get(key)
            if entry and (time.time() - entry["ts"] < ttl):
                return entry["val"]
            result = await fn(*args, **kwargs)
            _cache[key] = {"val": result, "ts": time.time()}
            return result
        return wrapper
    return decorator

def clear_cache():
    _cache.clear()
