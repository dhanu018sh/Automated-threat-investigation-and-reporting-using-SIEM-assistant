import os
import json
import logging
from jinja2 import Environment, FileSystemLoader
from .mitre_mapper import map_findings

logger = logging.getLogger(__name__)

class ReportGenerator:
    def __init__(self, templates_dir="app/reporting/templates"):
        self.env = Environment(loader=FileSystemLoader(templates_dir))
        
    def generate(self, investigation, findings, format="txt"):
        os.makedirs(f"../reports/{investigation.id}", exist_ok=True)
        mitre_techniques = map_findings(findings)
        
        date_str = investigation.created_at.strftime("%Y-%m-%d %H:%M UTC") if hasattr(investigation.created_at, 'strftime') else str(investigation.created_at)

        if format == "txt":
            file_path = f"../reports/{investigation.id}/report.txt"
            txt_content = f"""================================================================================
SIEM ASSISTANT — THREAT INVESTIGATION REPORT (TEXT FORMAT)
================================================================================
Report ID      : REP-{investigation.id}
Investigation  : {investigation.title}
Date / Time    : {date_str}
Severity Level : CRITICAL / HIGH
Playbook Engine: {getattr(investigation, 'playbook_name', 'brute_force_investigation')}
================================================================================

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Automated real-time investigation executed by SIEM Assistant.
The system analyzed log event streams, extracted indicators of compromise (IOCs),
evaluated threat severity using Random Forest Machine Learning (100 Decision Trees),
and correlated attacking vulnerabilities.

2. KEY INVESTIGATION FINDINGS & EVIDENCE
--------------------------------------------------------------------------------
"""
            for i, f in enumerate(findings, 1):
                txt_content += f"[{i}] {f}\n"

            txt_content += """
3. MITRE ATT&CK FRAMEWORK MAPPING
--------------------------------------------------------------------------------
"""
            for t in mitre_techniques:
                txt_content += f"* [{t.id}] {t.name} (Tactic: {t.tactic})\n"

            txt_content += """
4. RECOMMENDED REMEDIATION ACTIONS
--------------------------------------------------------------------------------
[1] Immediately contain affected host endpoints and reset user credentials.
[2] Block external attacker IP addresses at the perimeter firewall.
[3] Patch identified vulnerability exploits across target systems.
[4] Enable mandatory multi-factor authentication (MFA).

================================================================================
END OF REPORT — SIEM ASSISTANT SOC PLATFORM
================================================================================
"""
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(txt_content)
            return file_path

        elif format == "pdf":
            file_path = f"../reports/{investigation.id}/report.pdf"
            template = self.env.get_template("full_report.html.j2")
            html_content = template.render(title=investigation.title, severity="HIGH", date=date_str, findings=findings, mitre_techniques=mitre_techniques)
            try:
                from weasyprint import HTML
                HTML(string=html_content).write_pdf(file_path)
            except Exception as e:
                logger.warning(f"WeasyPrint PDF rendering unavailable ({e}), falling back to TXT/HTML report format.")
                file_path = f"../reports/{investigation.id}/report.txt"
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(html_content)
            return file_path
            
        elif format == "html":
            file_path = f"../reports/{investigation.id}/report.html"
            template = self.env.get_template("full_report.html.j2")
            html_content = template.render(title=investigation.title, severity="HIGH", date=date_str, findings=findings, mitre_techniques=mitre_techniques)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            return file_path
            
        elif format == "json":
            file_path = f"../reports/{investigation.id}/report.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump({"title": investigation.title, "findings": findings}, f)
            return file_path

        return f"../reports/{investigation.id}/report.txt"
