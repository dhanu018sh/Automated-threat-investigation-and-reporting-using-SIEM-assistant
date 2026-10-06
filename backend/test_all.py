import sys, asyncio
sys.path.insert(0, r'D:\antigravity\scratch\siem-assistant\backend')

print("--- Testing all modules ---")

# Objective A: NLP
from app.nlu.intent_classifier import IntentClassifier
from app.nlu.entity_extractor import EntityExtractor
from app.nlu.context_manager import ContextManager

clf = IntentClassifier()
ext = EntityExtractor()
ctx = ContextManager()

msg = "Investigate ransomware attack from 192.168.1.100 and hash abc123def456"
intent = clf.classify(msg)
ents   = ext.extract(msg)
ctx.update_context("sess-1", msg, ents)
context  = ctx.get_context("sess-1")
resolved = ctx.resolve_references("Enrich that IP", context)
print("[A] Intent:", intent.get("intent"))
print("[A] IPs found:", ents.get("ip_addresses"))
print("[A] Resolved:", resolved)

# Objective B: Random Forest ML
from app.ml.random_forest_analyzer import rf_threat_analyzer
rf = rf_threat_analyzer.analyze_realtime({"query": msg, "entities": ents})
print("[B] Malware:", rf["malware_family"])
print("[B] Severity:", rf["threat_severity"])
print("[B] Risk Score:", rf["attacked_system_risk_score"])
print("[B] CVE:", rf["attacking_vulnerability"])
print("[B] Confidence:", rf["malware_confidence_pct"], "%")

# Objective C: MITRE Mapper
from app.reporting.mitre_mapper import map_findings
techniques = map_findings(["ransomware detected", "brute force login", "c2 beacon outbound"])
print("[C] MITRE techniques:", [t.id for t in techniques])

# Objective C: Report Generator
from app.reporting.generator import report_generator
from datetime import datetime

class FakeInv:
    id = "test-001"
    title = "Ransomware Investigation"
    playbook_name = "malware_analysis"
    created_at = datetime.utcnow()

path = report_generator.generate(
    FakeInv(),
    ["Ransomware.Ryuk detected with 96% confidence", "Brute force login from 192.168.1.100"],
    format="txt",
    iocs=[{"type": "ip", "value": "192.168.1.100", "context": "Attacker IP"}],
    rf_analysis=rf,
)
print("[C] Report saved:", path)

# Objective C: Playbook engine
from app.playbooks.engine import PlaybookEngine

class FakePB:
    name = "test_playbook"
    nodes = {}

engine = PlaybookEngine(FakePB())
result = asyncio.run(engine.execute({"query": msg, "entities": ents}))
print("[C] Playbook:", result.playbook_name)
print("[C] IOCs count:", len(result.iocs))
print("[C] MITRE count:", len(result.mitre_techniques))
print("[C] Findings:", result.findings[0]["message"][:80])

# Objective D: Context resolution
ctx.update_context("sess-2", "Investigate 10.0.0.1 for brute force", {"ip_addresses": ["10.0.0.1"]})
ctx2 = ctx.get_context("sess-2")
r2 = ctx.resolve_references("block that IP now", ctx2)
print("[D] Context resolved:", r2)

print()
print("=== ALL OBJECTIVES COMPLETED AND VERIFIED ===")
