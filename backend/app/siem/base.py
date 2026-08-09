from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum


class QueryType(Enum):
    SEARCH = "search"
    AGGREGATE = "aggregate"
    TIMELINE = "timeline"
    ALERT = "alert"


@dataclass
class SIEMQuery:
    raw_query: str
    query_type: QueryType
    time_range: dict  # {"from": "now-24h", "to": "now"}
    limit: int = 100
    platform_hint: str = ""


@dataclass
class SIEMResult:
    success: bool
    total_hits: int
    events: list[dict]
    aggregations: dict
    raw_response: dict
    execution_time_ms: float
    translated_query: str
    error_message: str = ""


class SIEMConnector(ABC):

    @abstractmethod
    async def test_connection(self) -> bool:
        ...

    @abstractmethod
    async def execute_query(self, query: SIEMQuery) -> SIEMResult:
        ...

    @abstractmethod
    def translate_to_native(self, query: SIEMQuery) -> str:
        ...

    @abstractmethod
    async def get_alerts(self, severity=None, limit=50) -> list[dict]:
        ...

    @abstractmethod
    async def get_events(
        self, filters: dict, time_range: dict
    ) -> list[dict]:
        ...