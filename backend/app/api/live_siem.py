"""
Real-Time Live Log Ingestion API & Alert Engine
Enables live network log ingestion from Wazuh, Elastic, Syslog, or custom agents.
Processes incoming logs using NLP + Random Forest ML → Triggers Playbooks → Broadcasts alerts.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio

from ..nlu.intent_classifier import IntentClassifier
from ..nlu.entity_extractor import EntityExtractor
from ..ml.random_forest_analyzer import rf_threat_analyzer
from ..playbooks.engine import PlaybookEngine
from ..playbooks.loader import PlaybookLoader
from ..reporting.generator import report_generator
from ..reporting.mitre_mapper import map_findings
import os

router = APIRouter(prefix="/api/siem", tags=["live-siem"])

classifier = IntentClassifier()
extractor = EntityExtractor()

PLAYBOOKS_DIR = os.path.join(os.path.dirname(__file__), "..", "playbooks", "definitions")
pb_loader = PlaybookLoader(PLAYBOOKS_DIR)
PLAYBOOK_DEFS = pb_loader.load_all()

# In-memory store for live ingested alerts
LIVE_ALERTS_FEED: List[Dict[str, Any]] = []

class LogIngestRequest(BaseModel):
    source: str = "wazuh"  # wazuh, elastic, syslog, custom_agent
    host: Optional[str] = "localhost"
    event_type: str = "failed_login"
    raw_log: str
    metadata: Optional[Dict[str, Any]] = None

class SimpleObject:
    def __init__(self, inv_id, title):
        self.id = inv_id
        self.title = title
        self.created_at = datetime.utcnow()
        self.playbook_name = "live_threat_playbook"

def _pick_playbook(query: str):
    q = query.lower()
    if "brute" in q or "failed" in q or "ssh" in q:
        return PLAYBOOK_DEFS.get("brute_force_investigation")
    if "malware" in q or "hash" in q or "ransomware" in q:
        return PLAYBOOK_DEFS.get("malware_analysis")
    if "phish" in q or "email" in q:
        return PLAYBOOK_DEFS.get("phishing_investigation")
    return next(iter(PLAYBOOK_DEFS.values())) if PLAYBOOK_DEFS else None


@router.post("/ingest")
async def ingest_live_log(log_req: LogIngestRequest):
    """
    Real-Time Ingestion Endpoint:
    Receives live log event → NLP extraction → Random Forest ML threat detection → Playbook execution → Incident Report
    """
    raw_text = log_req.raw_log
    entities = extractor.extract(raw_text)
    intent_data = classifier.classify(raw_text)
    intent = intent_data.get("intent", "investigate")

    # 1. Real-Time RF Analysis
    event_ctx = {
        "query": raw_text,
        "entities": entities,
        "source": log_req.source,
        "host": log_req.host,
        "event_type": log_req.event_type,
    }
    rf_result = rf_threat_analyzer.analyze_realtime(event_ctx)

    # 2. Playbook Execution
    pb_def = _pick_playbook(raw_text)
    pb_result = None
    if pb_def:
        try:
            engine = PlaybookEngine(pb_def)
            pb_result = await engine.execute(event_ctx)
        except Exception:
            pass

    # 3. Report Generation
    inv_id = f"LIVE-{len(LIVE_ALERTS_FEED)+1001}"
    report_path = None
    try:
        inv = SimpleObject(inv_id, f"Live Attack Alert: {raw_text[:50]}")
        findings = pb_result.findings if pb_result else [{"message": f"RF Analysis: {rf_result['malware_family']} detected", "severity": rf_result["threat_severity"]}]
        report_path = report_generator.generate(
            inv, findings, format="txt",
            iocs=pb_result.iocs if pb_result else [],
            timeline=pb_result.timeline if pb_result else [],
            mitre_techniques=pb_result.mitre_techniques if pb_result else [],
            rf_analysis=rf_result,
        )
    except Exception:
        pass

    # 4. Record Alert
    alert_record = {
        "id": inv_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": log_req.source,
        "host": log_req.host,
        "event_type": log_req.event_type,
        "raw_log": raw_text,
        "intent": intent,
        "entities": entities,
        "threat_severity": rf_result["threat_severity"],
        "malware_family": rf_result["malware_family"],
        "confidence_pct": rf_result["malware_confidence_pct"],
        "risk_score": rf_result["attacked_system_risk_score"],
        "cve": rf_result["attacking_vulnerability"],
        "report_path": report_path,
        "status": "CRITICAL_ALERT" if rf_result["threat_severity"] in ["CRITICAL", "HIGH"] else "MONITORED"
    }

    LIVE_ALERTS_FEED.insert(0, alert_record)
    if len(LIVE_ALERTS_FEED) > 100:
        LIVE_ALERTS_FEED.pop()

    return {
        "status": "ingested",
        "alert_id": inv_id,
        "threat_severity": rf_result["threat_severity"],
        "malware_family": rf_result["malware_family"],
        "risk_score": rf_result["attacked_system_risk_score"],
        "report_path": report_path,
        "analysis": rf_result
    }


@router.get("/alerts")
async def get_live_alerts(limit: int = 20):
    """Fetch live alerts feed for the Dashboard UI."""
    return {
        "total_alerts": len(LIVE_ALERTS_FEED),
        "alerts": LIVE_ALERTS_FEED[:limit]
    }
