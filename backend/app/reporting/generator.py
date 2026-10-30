import os
import json
import logging
import re
from datetime import datetime
from .mitre_mapper import map_findings
from ..utils.system_detector import get_system_hostname, get_system_os

logger = logging.getLogger(__name__)

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")


class ReportGenerator:
    def __init__(self, templates_dir=None):
        self.templates_dir = templates_dir

    def _ensure_dir(self, inv_id: str) -> str:
        path = os.path.join(REPORTS_DIR, str(inv_id))
        os.makedirs(path, exist_ok=True)
        return path

    def generate(self, investigation, findings, format="txt",
                 iocs=None, timeline=None, mitre_techniques=None,
                 enrichment_results=None, rf_analysis=None):
        """
        Generate an incident report in the requested format.
        Returns the file path of the saved report.
        """
        inv_id   = getattr(investigation, "id", "UNKNOWN")
        title    = getattr(investigation, "title", "Threat Investigation")
        created  = getattr(investigation, "created_at", datetime.utcnow())
        pb_name  = getattr(investigation, "playbook_name", "generic_investigation")

        date_str = (created.strftime("%Y-%m-%d %H:%M UTC")
                    if hasattr(created, "strftime") else str(created))

        if isinstance(findings, list) and findings and isinstance(findings[0], dict):
            finding_texts = [f.get("message", str(f)) for f in findings]
        else:
            finding_texts = [str(f) for f in (findings or [])]

        mitre = mitre_techniques or map_findings(finding_texts)
        iocs  = iocs or []
        tl    = timeline or []
        rf    = rf_analysis or {}
        enr   = enrichment_results or {}

        out_dir = self._ensure_dir(inv_id)

        if format == "txt":
            return self._generate_txt(out_dir, inv_id, title, date_str, pb_name,
                                      finding_texts, mitre, iocs, tl, rf, enr)
        elif format == "html":
            return self._generate_html(out_dir, inv_id, title, date_str, pb_name,
                                       finding_texts, mitre, iocs, tl, rf, enr)
        elif format == "pdf":
            html_path = self._generate_html(out_dir, inv_id, title, date_str, pb_name,
                                            finding_texts, mitre, iocs, tl, rf, enr)
            pdf_path = os.path.join(out_dir, "report.pdf")
            try:
                from weasyprint import HTML
                HTML(filename=html_path).write_pdf(pdf_path)
                return pdf_path
            except Exception as e:
                logger.warning(f"WeasyPrint unavailable ({e}). Returning HTML as fallback.")
                return html_path
        elif format == "json":
            return self._generate_json(out_dir, inv_id, title, date_str, pb_name,
                                       finding_texts, mitre, iocs, tl, rf, enr)
        elif format == "markdown":
            return self._generate_markdown(out_dir, inv_id, title, date_str, pb_name,
                                           finding_texts, mitre, iocs, tl, rf, enr)
        return self._generate_txt(out_dir, inv_id, title, date_str, pb_name,
                                  finding_texts, mitre, iocs, tl, rf, enr)

    # ─── Plain Text (.txt) ────────────────────────────────────────────
    def _generate_txt(self, out_dir, inv_id, title, date_str, pb_name,
                      findings, mitre, iocs, timeline, rf, enr):
        lines = []
        lines.append("=" * 80)
        lines.append("SIEM ASSISTANT -- THREAT INVESTIGATION REPORT")
        lines.append("=" * 80)
        lines.append(f"Report ID       : REP-{inv_id}")
        lines.append(f"Investigation   : {title}")
        lines.append(f"Target System   : {get_system_hostname()} ({get_system_os()})")
        lines.append(f"Attacked Date   : {date_str} (Incident Occurrence Window)")
        lines.append(f"Detection Time  : {date_str} (SIEM Automated Trigger)")
        lines.append(f"Playbook        : {pb_name}")

        if rf:
            lines.append(f"ML Severity     : {rf.get('threat_severity', 'UNKNOWN')}")
            lines.append(f"Malware Family  : {rf.get('malware_family', 'Unknown')}")
            lines.append(f"Risk Score      : {rf.get('attacked_system_risk_score', 'N/A')} / 100")
            lines.append(f"CVE Exploited   : {rf.get('attacking_vulnerability', 'N/A')}")
            lines.append(f"RF Confidence   : {rf.get('malware_confidence_pct', 'N/A')}%")

        lines.append("=" * 80)
        lines.append("")

        lines.append("1. EXECUTIVE SUMMARY")
        lines.append("-" * 80)
        lines.append(
            "Automated real-time investigation executed by SIEM Assistant. "
            "The system analyzed incoming SIEM event streams, extracted indicators of compromise (IOCs), "
            "evaluated threat severity using a Random Forest Machine Learning model (100 Decision Trees), "
            "correlated events with MITRE ATT&CK techniques, and enriched IOCs via VirusTotal and AbuseIPDB."
        )
        lines.append("")

        lines.append("2. RANDOM FOREST ML ANALYSIS")
        lines.append("-" * 80)
        if rf:
            lines.append(f"  Algorithm         : {rf.get('model_metadata', {}).get('algorithm', 'RandomForestClassifier & RandomForestRegressor')}")
            lines.append(f"  Trees in Ensemble : {rf.get('trees_in_ensemble', 100)}")
            lines.append(f"  Trees voted malicious: {rf.get('trees_voted_malicious', 'N/A')}/{rf.get('trees_in_ensemble', 100)}")
            lines.append(f"  Predicted Malware : {rf.get('malware_family', 'N/A')}")
            lines.append(f"  Confidence        : {rf.get('malware_confidence_pct', 'N/A')}%")
            lines.append(f"  Threat Severity   : {rf.get('threat_severity', 'N/A')}")
            lines.append(f"  Attacked System Risk Score: {rf.get('attacked_system_risk_score', 'N/A')}/100")
            lines.append(f"  Exploited CVE     : {rf.get('attacking_vulnerability', 'N/A')}")
            lines.append("  Feature Importances:")
            for feat, pct in rf.get("top_feature_importances", {}).items():
                lines.append(f"    - {feat}: {pct}%")
            lat = rf.get("model_metadata", {}).get("realtime_latency_ms", "N/A")
            lines.append(f"  Real-Time Latency : {lat} ms")
        else:
            lines.append("  No ML analysis data available.")
        lines.append("")

        lines.append("3. KEY INVESTIGATION FINDINGS")
        lines.append("-" * 80)
        for i, f in enumerate(findings, 1):
            lines.append(f"  [{i}] {f}")
        lines.append("")

        lines.append("4. INDICATORS OF COMPROMISE (IOCs)")
        lines.append("-" * 80)
        if iocs:
            for ioc in iocs:
                lines.append(f"  [{ioc.get('type','IOC').upper()}] {ioc.get('value', '')} -- {ioc.get('context', '')}")
        else:
            lines.append("  No IOCs extracted.")
        lines.append("")

        lines.append("5. THREAT INTELLIGENCE ENRICHMENT")
        lines.append("-" * 80)
        if enr:
            for indicator, data in enr.items():
                lines.append(f"  Indicator: {indicator}")
                vt = data.get("virustotal", {})
                ab = data.get("abuseipdb", {})
                if vt:
                    lines.append(f"    VirusTotal  : {vt.get('malicious_count', 0)}/{vt.get('total_engines', 70)} engines detected")
                if ab:
                    lines.append(f"    AbuseIPDB   : {ab.get('abuse_confidence_score', 0)}/100 confidence | Country: {ab.get('country', 'N/A')}")
                lines.append(f"    Threat Score: {data.get('threat_score', 'N/A')}/100")
        else:
            lines.append("  No enrichment data available (configure VIRUSTOTAL_API_KEY and ABUSEIPDB_API_KEY in .env).")
        lines.append("")

        lines.append("6. MITRE ATT&CK FRAMEWORK MAPPING")
        lines.append("-" * 80)
        for t in mitre:
            tid  = getattr(t, "id",     t.get("technique_id", ""))    if isinstance(t, dict) else t.id
            name = getattr(t, "name",   t.get("technique_name", ""))  if isinstance(t, dict) else t.name
            tac  = getattr(t, "tactic", t.get("tactic", ""))          if isinstance(t, dict) else t.tactic
            url  = getattr(t, "url",    "")                            if not isinstance(t, dict) else ""
            lines.append(f"  [{tid}] {name}  (Tactic: {tac})  {url}")
        lines.append("")

        lines.append("7. INVESTIGATION TIMELINE")
        lines.append("-" * 80)
        if timeline:
            for step in timeline:
                lines.append(f"  Step {step.get('step', '?')}: [{step.get('status','').upper()}] {step.get('node', '')} ({step.get('type', '')})")
        else:
            lines.append("  Timeline not available.")
        lines.append("")

        lines.append("8. RECOMMENDED REMEDIATION ACTIONS")
        lines.append("-" * 80)
        lines.append("  [1] Immediately isolate affected host endpoints and revoke active sessions.")
        lines.append("  [2] Block identified attacker IP addresses at perimeter firewall and WAF.")
        lines.append("  [3] Reset credentials for all affected user accounts and enforce MFA.")
        lines.append("  [4] Apply vendor patches for identified CVE vulnerabilities.")
        lines.append("  [5] Run full endpoint EDR scan across the affected network segment.")
        lines.append("  [6] Preserve forensic artifacts (memory dump, disk image) for analysis.")
        lines.append("  [7] Notify affected stakeholders and escalate if severity is CRITICAL.")
        lines.append("")

        lines.append("=" * 80)
        lines.append("END OF REPORT -- SIEM ASSISTANT SOC PLATFORM")
        lines.append("=" * 80)

        content = "\n".join(lines)
        path = os.path.join(out_dir, "report.txt")
        with open(path, "w", encoding="utf-8") as fp:
            fp.write(content)
        return path

    # ─── HTML ─────────────────────────────────────────────────────────
    def _generate_html(self, out_dir, inv_id, title, date_str, pb_name,
                       findings, mitre, iocs, timeline, rf, enr):
        sev = rf.get("threat_severity", "HIGH") if rf else "HIGH"
        sev_color = {"CRITICAL": "#dc2626", "HIGH": "#ea580c", "MEDIUM": "#ca8a04", "LOW": "#16a34a"}.get(sev, "#1e3a8a")

        mitre_rows = ""
        for t in mitre:
            tid  = getattr(t, "id",     "") if not isinstance(t, dict) else t.get("technique_id", "")
            name = getattr(t, "name",   "") if not isinstance(t, dict) else t.get("technique_name", "")
            tac  = getattr(t, "tactic", "") if not isinstance(t, dict) else t.get("tactic", "")
            url  = getattr(t, "url",    "") if not isinstance(t, dict) else ""
            mitre_rows += f"<tr><td><a href='{url}' target='_blank'>{tid}</a></td><td>{name}</td><td>{tac}</td></tr>"

        ioc_rows = "".join(
            f"<tr><td>{ioc.get('type','').upper()}</td><td><code>{ioc.get('value','')}</code></td><td>{ioc.get('context','')}</td></tr>"
            for ioc in iocs
        ) or "<tr><td colspan='3'>No IOCs detected</td></tr>"

        finding_html = "".join(f"<li>{f}</li>" for f in findings)

        feat_html = ""
        if rf:
            for feat, pct in rf.get("top_feature_importances", {}).items():
                feat_html += f"<tr><td>{feat}</td><td><progress value='{pct}' max='100'></progress> {pct}%</td></tr>"

        html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>SIEM Report — {title}</title>
<style>
  body{{font-family:Arial,sans-serif;background:#f8f8f8;color:#222;margin:0;padding:0}}
  .header{{background:#1e3a8a;color:#fff;padding:24px 32px}}
  .header h1{{margin:0;font-size:22px}} .header p{{margin:4px 0;font-size:13px;opacity:.8}}
  .badge{{display:inline-block;background:{sev_color};color:#fff;padding:4px 14px;border-radius:4px;font-weight:bold;font-size:13px}}
  .container{{padding:24px 32px;max-width:960px;margin:auto}}
  h2{{color:#1e3a8a;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:28px}}
  table{{border-collapse:collapse;width:100%;margin-top:10px}}
  th{{background:#1e3a8a;color:#fff;padding:8px 12px;text-align:left}}
  td{{padding:7px 12px;border-bottom:1px solid #e5e7eb}}
  tr:nth-child(even){{background:#f0f4ff}}
  ul{{padding-left:20px}} li{{margin:6px 0;line-height:1.5}}
  code{{background:#f1f5f9;padding:2px 6px;border-radius:3px;font-size:12px}}
  .footer{{background:#1e3a8a;color:#fff;text-align:center;padding:12px;font-size:12px;margin-top:32px}}
</style></head><body>
<div class="header">
  <h1>SIEM Assistant &mdash; Threat Investigation Report</h1>
  <p>Report ID: REP-{inv_id} &nbsp;|&nbsp; {title} &nbsp;|&nbsp; Target: {get_system_hostname()} ({get_system_os()}) &nbsp;|&nbsp; {date_str} &nbsp;|&nbsp; Playbook: {pb_name}</p>
  <span class="badge">Severity: {sev}</span>
</div>
<div class="container">

<h2>1. Random Forest ML Analysis</h2>
<table>
  <tr><th>Property</th><th>Value</th></tr>
  <tr><td>Malware Family</td><td><strong>{rf.get('malware_family','N/A') if rf else 'N/A'}</strong></td></tr>
  <tr><td>Confidence</td><td>{rf.get('malware_confidence_pct','N/A') if rf else 'N/A'}%</td></tr>
  <tr><td>Threat Severity</td><td><span class="badge">{rf.get('threat_severity','N/A') if rf else 'N/A'}</span></td></tr>
  <tr><td>Attacked System Risk Score</td><td>{rf.get('attacked_system_risk_score','N/A') if rf else 'N/A'}/100</td></tr>
  <tr><td>Exploited CVE</td><td>{rf.get('attacking_vulnerability','N/A') if rf else 'N/A'}</td></tr>
  <tr><td>Trees Voted Malicious</td><td>{rf.get('trees_voted_malicious','N/A') if rf else 'N/A'}/{rf.get('trees_in_ensemble',100) if rf else 100}</td></tr>
</table>

<h2>2. Feature Importances</h2>
<table><tr><th>Feature</th><th>Importance</th></tr>{feat_html or '<tr><td colspan=2>No data</td></tr>'}</table>

<h2>3. Investigation Findings</h2>
<ul>{finding_html or '<li>No findings recorded.</li>'}</ul>

<h2>4. Indicators of Compromise</h2>
<table><tr><th>Type</th><th>Value</th><th>Context</th></tr>{ioc_rows}</table>

<h2>5. MITRE ATT&amp;CK Mapping</h2>
<table><tr><th>ID</th><th>Technique</th><th>Tactic</th></tr>{mitre_rows}</table>

<h2>6. Recommended Remediation</h2>
<ul>
  <li>Immediately isolate affected host endpoints and revoke active sessions.</li>
  <li>Block attacker IPs at the perimeter firewall and WAF.</li>
  <li>Reset credentials for all affected accounts and enforce MFA.</li>
  <li>Apply vendor patches for identified CVE vulnerabilities.</li>
  <li>Run full EDR scan across the affected network segment.</li>
  <li>Preserve forensic artifacts (memory dump, disk image) for analysis.</li>
  <li>Notify stakeholders and escalate if severity is CRITICAL.</li>
</ul>

</div>
<div class="footer">SIEM Assistant SOC Platform &mdash; Auto-Generated Report &mdash; {date_str}</div>
</body></html>"""

        path = os.path.join(out_dir, "report.html")
        with open(path, "w", encoding="utf-8") as fp:
            fp.write(html)
        return path

    # ─── JSON ──────────────────────────────────────────────────────────
    def _generate_json(self, out_dir, inv_id, title, date_str, pb_name,
                       findings, mitre, iocs, timeline, rf, enr):
        def _t(t):
            return {"id": getattr(t,"id",""), "name": getattr(t,"name",""), "tactic": getattr(t,"tactic","")} \
                   if not isinstance(t, dict) else t
        data = {
            "report_id": f"REP-{inv_id}",
            "title": title,
            "date": date_str,
            "playbook": pb_name,
            "rf_analysis": rf,
            "findings": findings,
            "iocs": iocs,
            "mitre_techniques": [_t(t) for t in mitre],
            "enrichment": enr,
            "timeline": timeline,
            "remediation": [
                "Isolate affected hosts and revoke sessions",
                "Block attacker IPs at firewall",
                "Reset credentials and enforce MFA",
                "Patch CVE vulnerabilities",
                "Run full EDR scan",
            ],
        }
        path = os.path.join(out_dir, "report.json")
        with open(path, "w", encoding="utf-8") as fp:
            json.dump(data, fp, indent=2, default=str)
        return path

    # ─── Markdown ─────────────────────────────────────────────────────
    def _generate_markdown(self, out_dir, inv_id, title, date_str, pb_name,
                           findings, mitre, iocs, timeline, rf, enr):
        lines = [
            f"# SIEM Assistant — Threat Investigation Report",
            f"",
            f"| Field | Value |",
            f"|---|---|",
            f"| Report ID | REP-{inv_id} |",
            f"| Title | {title} |",
            f"| Target System | {get_system_hostname()} ({get_system_os()}) |",
            f"| Date | {date_str} |",
            f"| Playbook | {pb_name} |",
        ]
        if rf:
            lines += [
                f"| Malware Family | {rf.get('malware_family','N/A')} |",
                f"| Severity | {rf.get('threat_severity','N/A')} |",
                f"| Risk Score | {rf.get('attacked_system_risk_score','N/A')}/100 |",
                f"| CVE | {rf.get('attacking_vulnerability','N/A')} |",
            ]

        lines += ["", "## Findings", ""]
        for i, f in enumerate(findings, 1):
            lines.append(f"{i}. {f}")

        lines += ["", "## IOCs", ""]
        for ioc in iocs:
            lines.append(f"- `[{ioc.get('type','').upper()}]` `{ioc.get('value','')}` — {ioc.get('context','')}")

        lines += ["", "## MITRE ATT&CK Techniques", ""]
        for t in mitre:
            tid  = getattr(t, "id",     "") if not isinstance(t, dict) else t.get("technique_id", "")
            name = getattr(t, "name",   "") if not isinstance(t, dict) else t.get("technique_name", "")
            tac  = getattr(t, "tactic", "") if not isinstance(t, dict) else t.get("tactic", "")
            lines.append(f"- **{tid}** {name} *(Tactic: {tac})*")

        lines += ["", "## Remediation", ""]
        for r in ["Isolate hosts and revoke sessions", "Block attacker IPs", "Reset credentials, enforce MFA",
                  "Patch CVE vulnerabilities", "Run EDR scan", "Preserve forensic artifacts"]:
            lines.append(f"- {r}")

        content = "\n".join(lines)
        path = os.path.join(out_dir, "report.md")
        with open(path, "w", encoding="utf-8") as fp:
            fp.write(content)
        return path


# Singleton
report_generator = ReportGenerator()
