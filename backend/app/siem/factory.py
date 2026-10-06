from .base import SIEMConnector
from .real_system_adapter import RealSystemAdapter
from .mock_adapter import MockAdapter
from .elastic_adapter import ElasticAdapter
from .splunk_adapter import SplunkAdapter
from .sentinel_adapter import SentinelAdapter
from .qradar_adapter import QRadarAdapter

def get_siem_connector(platform: str) -> SIEMConnector:
    if platform == "elastic":
        return ElasticAdapter()
    elif platform == "splunk":
        return SplunkAdapter()
    elif platform == "sentinel":
        return SentinelAdapter()
    elif platform == "qradar":
        return QRadarAdapter()
    elif platform == "mock":
        return MockAdapter()
    else:
        # Default to REAL local system security inspector!
        return RealSystemAdapter()
