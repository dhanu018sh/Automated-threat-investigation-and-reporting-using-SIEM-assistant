from dataclasses import dataclass

@dataclass
class MITRETechnique:
    id: str
    name: str
    tactic: str

MAPPINGS = {
    "brute_force": MITRETechnique("T1110", "Brute Force", "Credential Access"),
    "phishing": MITRETechnique("T1566", "Phishing", "Initial Access"),
    "lateral_movement": MITRETechnique("T1021", "Remote Services", "Lateral Movement"),
    "credential_dumping": MITRETechnique("T1003", "OS Credential Dumping", "Credential Access"),
    "malware": MITRETechnique("T1059", "Command and Scripting Interpreter", "Execution")
}

def map_findings(findings: list) -> list[MITRETechnique]:
    mapped = set()
    for finding in findings:
        for keyword, technique in MAPPINGS.items():
            if keyword in str(finding).lower():
                mapped.add(technique)
    return list(mapped)
