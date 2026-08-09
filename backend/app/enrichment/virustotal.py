import httpx
from datetime import datetime
from .cache import cached
from ..config import settings

@cached(ttl=86400)
async def check_virustotal(type_: str, value: str) -> dict:
    if settings.USE_MOCK_DATA or not settings.VIRUSTOTAL_API_KEY:
        return {
            "malicious_count": 5 if type_ == "hash" else 0,
            "total_engines": 70,
            "last_analysis_date": datetime.utcnow().isoformat(),
            "threat_categories": ["trojan"] if type_ == "hash" else [],
            "detection_names": ["Win32.Trojan.Generic"] if type_ == "hash" else []
        }
        
    headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
    url = f"https://www.virustotal.com/api/v3/{type_}/{value}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            attrs = data.get("data", {}).get("attributes", {})
            stats = attrs.get("last_analysis_stats", {})
            return {
                "malicious_count": stats.get("malicious", 0),
                "total_engines": sum(stats.values()),
                "last_analysis_date": datetime.fromtimestamp(attrs.get("last_analysis_date", 0)).isoformat(),
                "threat_categories": attrs.get("popular_threat_classification", {}).get("popular_threat_category", []),
                "detection_names": []
            }
        return {"error": "Failed to fetch from VirusTotal"}
