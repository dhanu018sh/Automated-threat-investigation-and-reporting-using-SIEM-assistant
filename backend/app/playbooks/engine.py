import asyncio
import networkx as nx
import re
from typing import Dict, Any, List, Optional
from ..ml.random_forest_analyzer import rf_threat_analyzer
from ..enrichment.orchestrator import enrich_indicator
from ..reporting.mitre_mapper import map_findings

# ─────── MITRE ATT&CK Technique mapping per playbook node type ───────
MITRE_MAP = {
    "siem_query":       [{"technique_id": "T1078", "technique_name": "Valid Accounts",           "tactic": "Defense Evasion"}],
    "enrich_ip":        [{"technique_id": "T1071", "technique_name": "Application Layer Protocol","tactic": "Command & Control"}],
    "enrich_hash":      [{"technique_id": "T1204", "technique_name": "User Execution",            "tactic": "Execution"}],
    "correlation":      [{"technique_id": "T1110", "technique_name": "Brute Force",               "tactic": "Credential Access"}],
    "alert_triage":     [{"technique_id": "T1059", "technique_name": "Command & Scripting Interpreter","tactic":"Execution"}],
    "lateral_movement": [{"technique_id": "T1021", "technique_name": "Remote Services",           "tactic": "Lateral Movement"}],
    "default":          [{"technique_id": "T1566", "technique_name": "Phishing",                  "tactic": "Initial Access"}],
}


class PlaybookResult:
    def __init__(
        self,
        playbook_name: str,
        findings: List[Dict[str, Any]],
        iocs: List[Dict[str, Any]],
        timeline: List[Dict[str, Any]],
        mitre_techniques: List[Dict[str, Any]],
        enrichment_results: Dict[str, Any],
        rf_analysis: Dict[str, Any],
        node_log: List[Dict[str, Any]],
    ):
        self.playbook_name = playbook_name
        self.findings = findings
        self.iocs = iocs
        self.timeline = timeline
        self.mitre_techniques = mitre_techniques
        self.enrichment_results = enrichment_results
        self.rf_analysis = rf_analysis
        self.node_log = node_log


class PlaybookEngine:
    def __init__(self, definition):
        self.definition = definition
        self.graph = nx.DiGraph()
        self.build_graph()

    # ─── Build NetworkX DAG from definition ─────────────────────────
    def build_graph(self):
        nodes = self.definition.nodes if hasattr(self.definition, "nodes") else {}
        if isinstance(nodes, dict):
            for node_id, node in nodes.items():
                self.graph.add_node(node_id, data=node)
                for dep in getattr(node, "depends_on", []):
                    self.graph.add_edge(dep, node_id)

    # ─── Execute each DAG node based on its type ────────────────────
    async def _execute_node(
        self,
        node_id: str,
        node,
        event_context: Dict[str, Any],
        collected: Dict[str, Any],
    ) -> Dict[str, Any]:
        node_type = getattr(node, "type", "default")
        config = getattr(node, "config", {})
        await asyncio.sleep(0.05)  # simulate async latency

        result: Dict[str, Any] = {"node_id": node_id, "type": node_type, "status": "success"}

        # ── SIEM Query node ──────────────────────────────────────────
        if node_type == "siem_query":
            query_str = config.get("query", event_context.get("query", ""))
            result["output"] = f"SIEM query executed: {query_str}"
            result["total_hits"] = event_context.get("total_events", 12)

        # ── IP Enrichment ────────────────────────────────────────────
        elif node_type in ("enrich_ip", "enrich_indicator"):
            ips = self._extract_ips(event_context)
            enriched = {}
            for ip in ips[:3]:  # limit to first 3 IPs
                try:
                    data = await enrich_indicator("ip_address", ip)
                    enriched[ip] = data
                    collected.setdefault("enrichment", {})[ip] = data
                    # IOC from enrichment
                    abuse_score = data.get("abuseipdb", {}).get("abuse_confidence_score", 0)
                    collected.setdefault("iocs", []).append({
                        "type": "ip",
                        "value": ip,
                        "context": f"AbuseIPDB Score: {abuse_score}/100 | VT Malicious: {data.get('virustotal', {}).get('malicious_count', 0)}",
                    })
                except Exception as e:
                    enriched[ip] = {"error": str(e)}
            result["output"] = enriched

        # ── Hash Enrichment ──────────────────────────────────────────
        elif node_type == "enrich_hash":
            hashes = self._extract_hashes(event_context)
            enriched = {}
            for h in hashes[:2]:
                try:
                    data = await enrich_indicator("file_hash", h)
                    enriched[h] = data
                    collected.setdefault("enrichment", {})[h] = data
                    mal = data.get("virustotal", {}).get("malicious_count", 0)
                    collected.setdefault("iocs", []).append({
                        "type": "hash",
                        "value": h,
                        "context": f"VirusTotal: {mal}/70 engines detected as malicious",
                    })
                except Exception as e:
                    enriched[h] = {"error": str(e)}
            result["output"] = enriched

        # ── Domain Enrichment ────────────────────────────────────────
        elif node_type == "enrich_domain":
            domains = self._extract_domains(event_context)
            enriched = {}
            for d in domains[:2]:
                try:
                    data = await enrich_indicator("domain", d)
                    enriched[d] = data
                    collected.setdefault("enrichment", {})[d] = data
                    collected.setdefault("iocs", []).append({
                        "type": "domain",
                        "value": d,
                        "context": f"VT reputation check: {data.get('virustotal', {}).get('malicious_count', 0)} malicious engines",
                    })
                except Exception as e:
                    enriched[d] = {"error": str(e)}
            result["output"] = enriched

        # ── Correlation / Pattern Matching ───────────────────────────
        elif node_type == "correlation":
            threshold = config.get("threshold", 5)
            failed_logins = event_context.get("failed_logins", 0)
            is_brute = failed_logins >= threshold
            result["output"] = {
                "pattern_matched": is_brute,
                "evidence": f"{failed_logins} failed login attempts (threshold={threshold})",
                "verdict": "Brute Force Attack Confirmed" if is_brute else "Below threshold",
            }
            if is_brute:
                collected.setdefault("findings", []).append(
                    f"Brute force pattern detected: {failed_logins} failed logins exceeded threshold of {threshold}."
                )

        # ── Alert Triage ─────────────────────────────────────────────
        elif node_type == "alert_triage":
            rf = rf_threat_analyzer.analyze_realtime(event_context)
            result["output"] = {
                "severity": rf["threat_severity"],
                "malware": rf["malware_family"],
                "risk_score": rf["attacked_system_risk_score"],
            }
            collected["rf_triage"] = rf

        # ── Containment / Remediation (with approval gate) ──────────
        elif node_type in ("containment", "remediation", "block_ip"):
            action = config.get("action", "isolate_host")
            result["output"] = {
                "action": action,
                "status": "PENDING_APPROVAL",
                "note": "High-impact action queued. Analyst approval required before execution.",
            }
            result["requires_approval"] = True

        # ── Default fallback ─────────────────────────────────────────
        else:
            result["output"] = f"Node '{node_id}' of type '{node_type}' executed."

        return result

    # ─── Main execution entry point ──────────────────────────────────
    async def execute(self, event_context: Optional[Dict[str, Any]] = None) -> PlaybookResult:
        event_context = event_context or {}
        collected: Dict[str, Any] = {"iocs": [], "findings": [], "enrichment": {}}
        node_log: List[Dict[str, Any]] = []
        mitre_techniques: List[Dict[str, Any]] = []

        # Topological sort for ordered DAG execution
        ordered = list(nx.topological_sort(self.graph)) if self.graph.nodes else []

        for node_id in ordered:
            node = self.graph.nodes[node_id].get("data")
            if node is None:
                continue
            node_result = await self._execute_node(node_id, node, event_context, collected)
            node_log.append(node_result)

            # Collect MITRE techniques from node type
            node_type = getattr(node, "type", "default")
            for tech in MITRE_MAP.get(node_type, MITRE_MAP["default"]):
                if tech not in mitre_techniques:
                    mitre_techniques.append(tech)

        # ── Run Random Forest ML Engine ──────────────────────────────
        rf_analysis = collected.get("rf_triage") or rf_threat_analyzer.analyze_realtime(event_context)

        # ── Build final findings ─────────────────────────────────────
        base_findings = collected.get("findings", [])
        base_findings.append(
            f"Random Forest ML Classifier (100 trees): "
            f"Identified '{rf_analysis['malware_family']}' with {rf_analysis['malware_confidence_pct']}% confidence. "
            f"Attacked system risk score: {rf_analysis['attacked_system_risk_score']}/100. "
            f"Exploited vulnerability: {rf_analysis['attacking_vulnerability']}."
        )

        # ── Auto-extract IOCs from context ───────────────────────────
        iocs = collected.get("iocs", [])
        for ip in self._extract_ips(event_context):
            if not any(i["value"] == ip for i in iocs):
                iocs.append({"type": "ip", "value": ip, "context": "Extracted from event context"})
        for h in self._extract_hashes(event_context):
            if not any(i["value"] == h for i in iocs):
                iocs.append({"type": "hash", "value": h, "context": "Extracted from event context"})

        # ── Build timeline ───────────────────────────────────────────
        timeline = [
            {"step": idx + 1, "node": log["node_id"], "status": log["status"], "type": log["type"]}
            for idx, log in enumerate(node_log)
        ]

        pb_name = getattr(self.definition, "name", "generic_investigation")
        return PlaybookResult(
            playbook_name=pb_name,
            findings=[{"message": f, "severity": rf_analysis["threat_severity"]} for f in base_findings],
            iocs=iocs,
            timeline=timeline,
            mitre_techniques=mitre_techniques,
            enrichment_results=collected.get("enrichment", {}),
            rf_analysis=rf_analysis,
            node_log=node_log,
        )

    # ─── Helpers ─────────────────────────────────────────────────────
    def _extract_ips(self, ctx: Dict[str, Any]) -> List[str]:
        text = str(ctx)
        return list(set(re.findall(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", text)))

    def _extract_hashes(self, ctx: Dict[str, Any]) -> List[str]:
        text = str(ctx)
        return list(set(re.findall(r"\b[a-fA-F0-9]{32,64}\b", text)))

    def _extract_domains(self, ctx: Dict[str, Any]) -> List[str]:
        text = str(ctx)
        return list(set(re.findall(r"\b(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|co|ru|cn|info)\b", text)))
