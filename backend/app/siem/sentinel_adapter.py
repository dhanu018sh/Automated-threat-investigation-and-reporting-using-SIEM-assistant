from .base import SIEMConnector, SIEMQuery, SIEMResult

class SentinelAdapter(SIEMConnector):
    async def test_connection(self) -> bool:
        return True
        
    async def execute_query(self, query: SIEMQuery) -> SIEMResult:
        return SIEMResult(
            success=True,
            total_hits=0,
            events=[],
            aggregations={},
            raw_response={"message": "OAuth2 flow needed for Sentinel"},
            execution_time_ms=0,
            translated_query=self.translate_to_native(query)
        )
        
    def translate_to_native(self, query: SIEMQuery) -> str:
        return f'SecurityEvent | search "{query.raw_query}"'
        
    async def get_alerts(self, severity=None, limit=50) -> list[dict]:
        return []
        
    async def get_events(self, filters: dict, time_range: dict) -> list[dict]:
        return []
