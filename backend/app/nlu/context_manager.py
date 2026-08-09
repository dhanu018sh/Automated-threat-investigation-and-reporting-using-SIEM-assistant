import json
import redis
from ..config import settings

class ContextManager:
    def __init__(self):
        try:
            self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception:
            self.redis_client = None
        self._memory_store = {}
        
    def add_turn(self, session_id: str, role: str, content: str, entities: list):
        key = f"context:{session_id}"
        turn_data = {"role": role, "content": content, "entities": entities}
        try:
            if self.redis_client:
                turn_str = json.dumps(turn_data)
                self.redis_client.lpush(key, turn_str)
                self.redis_client.ltrim(key, 0, 9)
                return
        except Exception:
            pass
        # Fallback to in-memory store
        if session_id not in self._memory_store:
            self._memory_store[session_id] = []
        self._memory_store[session_id].insert(0, turn_data)
        self._memory_store[session_id] = self._memory_store[session_id][:10]
        
    def get_context(self, session_id: str):
        key = f"context:{session_id}"
        try:
            if self.redis_client:
                turns = self.redis_client.lrange(key, 0, -1)
                return [json.loads(turn) for turn in turns]
        except Exception:
            pass
        return self._memory_store.get(session_id, [])
        
    def resolve_references(self, session_id: str, new_query: str) -> str:
        return new_query
        
    def clear_context(self, session_id: str):
        key = f"context:{session_id}"
        try:
            if self.redis_client:
                self.redis_client.delete(key)
        except Exception:
            pass
        self._memory_store.pop(session_id, None)
