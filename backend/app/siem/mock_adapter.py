import random
import uuid
import time
from .base import SIEMConnector, SIEMQuery, SIEMResult

class MockAdapter(SIEMConnector):
    async def test_connection(self) -> bool:
        return True
        
    async def execute_query(self, query: SIEMQuery) -> SIEMResult:
        query_str = query.raw_query.lower()
        events = []
        if "brute force" in query_str or "failed login" in query_str:
            for _ in range(20):
                events.append({
                    "id": str(uuid.uuid4()),
                    "timestamp": time.time(),
                    "event_type": "auth",
                    "action": "failed",
                    "src_ip": f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}",
                    "user": "admin"
                })
        elif "phishing" in query_str:
            for _ in range(5):
                events.append({
                    "id": str(uuid.uuid4()),
                    "timestamp": time.time(),
                    "event_type": "email",
                    "sender": f"info@suspicious-{random.randint(100, 999)}.com",
                    "subject": "Urgent: Account Verification"
                })
        else:
            events.append({"id": str(uuid.uuid4()), "message": "Generic mock event"})
            
        return SIEMResult(
            success=True,
            total_hits=len(events),
            events=events,
            aggregations={},
            raw_response={"mock": True},
            execution_time_ms=10.5,
            translated_query=self.translate_to_native(query)
        )
        
    def translate_to_native(self, query: SIEMQuery) -> str:
        return f"MOCK_QUERY: {query.raw_query}"
        
    async def get_alerts(self, severity=None, limit=50) -> list[dict]:
        return [{"id": "1", "alert": "High severity mock alert"}]
        
    async def get_events(self, filters: dict, time_range: dict) -> list[dict]:
        return [{"id": "2", "event": "Mock event"}]
