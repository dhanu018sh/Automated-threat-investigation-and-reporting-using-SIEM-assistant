from .base import SIEMConnector
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
    else:
        return MockAdapter()
