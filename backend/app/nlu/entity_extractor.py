"""
Entity Extractor — Objective A: NLP Entity Recognition
Extracts: IP addresses, file hashes, domains, usernames, CVE IDs, timeframes
Returns grouped dict format for easy downstream use.
"""
import re
from typing import Dict, List, Any


class EntityExtractor:
    # Regex patterns
    _IP     = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
    _HASH   = re.compile(r"\b[A-Fa-f0-9]{32}\b|\b[A-Fa-f0-9]{40}\b|\b[A-Fa-f0-9]{64}\b")
    _CVE    = re.compile(r"CVE-\d{4}-\d{4,7}", re.I)
    _DOMAIN = re.compile(r"\b(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|co|ru|cn|info|biz|gov|edu|xyz)\b")
    _USER   = re.compile(r"(?:user|username|account|admin|login)\s+['\"]?([a-zA-Z0-9_\-\.]+)['\"]?", re.I)
    _TIME_FRAME = re.compile(r"\b(last\s+\d+\s+(?:hours?|days?|minutes?|weeks?)|yesterday|today|now[-\d\w]*|past\s+\d+\s+\w+)\b", re.I)
    _DATE   = re.compile(r"\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b", re.I)
    _TIME_OF_DAY = re.compile(r"\b(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|UTC|GMT|IST))?)\b", re.I)

    def extract(self, text: str) -> Dict[str, Any]:
        """
        Returns a grouped dict:
        {
          "ip_addresses": [...],
          "file_hashes": [...],
          "cve_ids": [...],
          "domains": [...],
          "usernames": [...],
          "timeframes": [...],
          "dates": [...],
          "times": [...],
          "raw": [{"type":..., "value":..., "confidence":...}, ...]
        }
        """
        ips     = list(set(self._IP.findall(text)))
        hashes  = list(set(self._HASH.findall(text)))
        cves    = list(set(self._CVE.findall(text)))
        domains = list(set(self._DOMAIN.findall(text)))
        # filter domains that look like IPs
        domains = [d for d in domains if not self._IP.match(d)]
        users   = list(set(self._USER.findall(text)))
        timeframes = list(set(self._TIME_FRAME.findall(text)))
        dates   = list(set(self._DATE.findall(text)))
        times   = list(set(self._TIME_OF_DAY.findall(text)))

        raw = []
        for v in ips:        raw.append({"type": "ip_address", "value": v, "confidence": 1.0})
        for v in hashes:     raw.append({"type": "file_hash",  "value": v, "confidence": 1.0})
        for v in cves:       raw.append({"type": "cve_id",     "value": v, "confidence": 1.0})
        for v in domains:    raw.append({"type": "domain",     "value": v, "confidence": 0.9})
        for v in users:      raw.append({"type": "username",   "value": v, "confidence": 0.85})
        for v in timeframes: raw.append({"type": "timeframe",  "value": v, "confidence": 1.0})
        for v in dates:      raw.append({"type": "date",       "value": v, "confidence": 1.0})
        for v in times:      raw.append({"type": "time",       "value": v, "confidence": 1.0})

        return {
            "ip_addresses": ips,
            "file_hashes":  hashes,
            "cve_ids":      cves,
            "domains":      domains,
            "usernames":    users,
            "timeframes":   timeframes,
            "dates":        dates,
            "times":        times,
            "raw":          raw,
        }
