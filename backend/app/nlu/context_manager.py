"""
Context Manager — Objective D: Context-Aware Multi-Turn Conversations
- Stores last 10 conversation turns per session (Redis + in-memory fallback)
- Resolves pronouns and references from conversation history
"""
import json
import re
from typing import List, Dict, Any

try:
    import redis as redis_lib
    _REDIS_OK = True
except ImportError:
    _REDIS_OK = False

from ..config import settings


class ContextManager:
    def __init__(self):
        self.redis_client = None
        if _REDIS_OK:
            try:
                self.redis_client = redis_lib.Redis.from_url(
                    settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1
                )
                self.redis_client.ping()
            except Exception:
                self.redis_client = None
        self._memory_store: Dict[str, List[Dict]] = {}

    # ── Store a new turn ───────────────────────────────────────────
    def add_turn(self, session_id: str, role: str, content: str, entities: dict = None):
        turn_data = {"role": role, "content": content, "entities": entities or {}}
        key = f"ctx:{session_id}"
        try:
            if self.redis_client:
                self.redis_client.lpush(key, json.dumps(turn_data))
                self.redis_client.ltrim(key, 0, 9)
                self.redis_client.expire(key, 3600)
                return
        except Exception:
            pass
        store = self._memory_store.setdefault(session_id, [])
        store.insert(0, turn_data)
        self._memory_store[session_id] = store[:10]

    def update_context(self, session_id: str, message: str, entities: dict = None):
        """Alias for add_turn as 'user' role."""
        self.add_turn(session_id, "user", message, entities)

    # ── Retrieve context ───────────────────────────────────────────
    def get_context(self, session_id: str) -> List[Dict]:
        key = f"ctx:{session_id}"
        try:
            if self.redis_client:
                raw = self.redis_client.lrange(key, 0, -1)
                return [json.loads(r) for r in raw]
        except Exception:
            pass
        return self._memory_store.get(session_id, [])

    # ── Resolve pronouns and references ────────────────────────────
    def resolve_references(self, query: str, context: List[Dict]) -> str:
        """
        Objective D: Replace vague references with extracted entities from history.
        e.g. 'that IP' → '45.33.32.156', 'that hash' → 'abc123...'
        """
        if not context:
            return query

        q = query.lower()

        # Collect historical entities
        prev_ips     = []
        prev_hashes  = []
        prev_domains = []
        prev_users   = []

        for turn in context:
            ents = turn.get("entities") or {}
            if isinstance(ents, dict):
                prev_ips     += ents.get("ip_addresses", [])
                prev_hashes  += ents.get("file_hashes", [])
                prev_domains += ents.get("domains", [])
                prev_users   += ents.get("usernames", [])

        # Pronoun / reference patterns → substitute first matching entity
        ip_refs     = re.compile(r"\b(that ip|the ip|same ip|this ip|it|that address|the address)\b", re.I)
        hash_refs   = re.compile(r"\b(that hash|the hash|same hash|this hash|the file|that file)\b", re.I)
        domain_refs = re.compile(r"\b(that domain|the domain|same domain|that site|the site)\b", re.I)
        user_refs   = re.compile(r"\b(that user|the user|same user|this user)\b", re.I)

        resolved = query
        if prev_ips and ip_refs.search(q):
            resolved = ip_refs.sub(prev_ips[0], resolved, count=1)
        if prev_hashes and hash_refs.search(q):
            resolved = hash_refs.sub(prev_hashes[0], resolved, count=1)
        if prev_domains and domain_refs.search(q):
            resolved = domain_refs.sub(prev_domains[0], resolved, count=1)
        if prev_users and user_refs.search(q):
            resolved = user_refs.sub(prev_users[0], resolved, count=1)

        return resolved

    # ── Clear context ──────────────────────────────────────────────
    def clear_context(self, session_id: str):
        key = f"ctx:{session_id}"
        try:
            if self.redis_client:
                self.redis_client.delete(key)
        except Exception:
            pass
        self._memory_store.pop(session_id, None)
