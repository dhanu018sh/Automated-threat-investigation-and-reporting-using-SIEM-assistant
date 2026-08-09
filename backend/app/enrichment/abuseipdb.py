import httpx
from .cache import cached
from ..config import settings

@cached(ttl=86400)
async def check_abuseipdb(ip: str) -> dict:
    if settings.USE_MOCK_DATA or not settings.ABUSEIPDB_API_KEY:
        return {
            "abuse_confidence_score": 85 if ip.startswith("1") else 0,
            "country": "US",
            "isp": "Mock ISP",
            "usage_type": "Data Center/Web Hosting",
            "is_tor": False,
            "total_reports": 15 if ip.startswith("1") else 0
        }
        
    headers = {"Key": settings.ABUSEIPDB_API_KEY, "Accept": "application/json"}
    url = "https://api.abuseipdb.com/api/v2/check"
    params = {"ipAddress": ip, "maxAgeInDays": 90}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json().get("data", {})
            return {
                "abuse_confidence_score": data.get("abuseConfidenceScore", 0),
                "country": data.get("countryCode", ""),
                "isp": data.get("isp", ""),
                "usage_type": data.get("usageType", ""),
                "is_tor": data.get("isTor", False),
                "total_reports": data.get("totalReports", 0)
            }
        return {"error": "Failed to fetch from AbuseIPDB"}
