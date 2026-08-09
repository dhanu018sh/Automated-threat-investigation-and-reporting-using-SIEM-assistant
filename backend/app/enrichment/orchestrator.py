import asyncio
from .virustotal import check_virustotal
from .abuseipdb import check_abuseipdb

async def enrich_indicator(type_: str, value: str) -> dict:
    results = {}
    if type_ == "ip_address":
        vt, abuse = await asyncio.gather(
            check_virustotal("ip_addresses", value),
            check_abuseipdb(value)
        )
        results["virustotal"] = vt
        results["abuseipdb"] = abuse
    elif type_ == "file_hash":
        vt = await check_virustotal("files", value)
        results["virustotal"] = vt
    elif type_ == "domain":
        vt = await check_virustotal("domains", value)
        results["virustotal"] = vt
        
    return results
