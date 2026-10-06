"""
Threat Intelligence Enrichment Orchestrator
Calls VirusTotal + AbuseIPDB in parallel and returns merged results.
Falls back to mock data when API keys are missing.
"""
import asyncio
from .virustotal import check_virustotal
from .abuseipdb import check_abuseipdb

async def enrich_indicator(type_: str, value: str) -> dict:
    """
    Enrich a single IOC (ip, file_hash, domain).
    Returns merged VirusTotal + AbuseIPDB results.
    """
    results = {}
    try:
        if type_ == "ip_address":
            vt, abuse = await asyncio.gather(
                check_virustotal("ip_addresses", value),
                check_abuseipdb(value),
                return_exceptions=True
            )
            results["virustotal"] = vt if not isinstance(vt, Exception) else {"error": str(vt)}
            results["abuseipdb"]  = abuse if not isinstance(abuse, Exception) else {"error": str(abuse)}

            # Derive a combined threat_score
            mal_count  = results["virustotal"].get("malicious_count", 0)
            abuse_score = results["abuseipdb"].get("abuse_confidence_score", 0)
            results["threat_score"] = round((mal_count / max(results["virustotal"].get("total_engines", 70), 1)) * 50
                                      + abuse_score * 0.5, 1)

        elif type_ == "file_hash":
            vt = await check_virustotal("files", value)
            if isinstance(vt, Exception):
                vt = {"error": str(vt)}
            results["virustotal"] = vt
            mal_count = vt.get("malicious_count", 0)
            total     = vt.get("total_engines", 70)
            results["threat_score"] = round((mal_count / max(total, 1)) * 100, 1)

        elif type_ == "domain":
            vt = await check_virustotal("domains", value)
            if isinstance(vt, Exception):
                vt = {"error": str(vt)}
            results["virustotal"] = vt
            mal_count = vt.get("malicious_count", 0)
            results["threat_score"] = round((mal_count / 70) * 100, 1)

        else:
            results["error"] = f"Unknown indicator type: {type_}"

    except Exception as e:
        results["error"] = str(e)

    return results


async def enrich_multiple(iocs: list) -> dict:
    """
    Enrich a list of IOCs concurrently.
    Each ioc should be {"type": "ip_address"|"file_hash"|"domain", "value": "..."}
    Returns dict keyed by value -> enrichment result.
    """
    tasks = [enrich_indicator(ioc["type"], ioc["value"]) for ioc in iocs]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return {
        ioc["value"]: (r if not isinstance(r, Exception) else {"error": str(r)})
        for ioc, r in zip(iocs, results)
    }
