from dataclasses import dataclass
from typing import List

@dataclass
class MITRETechnique:
    id: str
    name: str
    tactic: str
    url: str = ""

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        return isinstance(other, MITRETechnique) and self.id == other.id

# Extended MITRE ATT&CK mapping
MAPPINGS = {
    "brute_force":          MITRETechnique("T1110", "Brute Force",                        "Credential Access",   "https://attack.mitre.org/techniques/T1110"),
    "brute":                MITRETechnique("T1110", "Brute Force",                        "Credential Access",   "https://attack.mitre.org/techniques/T1110"),
    "password spray":       MITRETechnique("T1110.003","Password Spraying",               "Credential Access",   "https://attack.mitre.org/techniques/T1110/003"),
    "phishing":             MITRETechnique("T1566", "Phishing",                           "Initial Access",      "https://attack.mitre.org/techniques/T1566"),
    "spear":                MITRETechnique("T1566.001","Spearphishing Attachment",        "Initial Access",      "https://attack.mitre.org/techniques/T1566/001"),
    "lateral_movement":     MITRETechnique("T1021", "Remote Services",                   "Lateral Movement",    "https://attack.mitre.org/techniques/T1021"),
    "lateral movement":     MITRETechnique("T1021", "Remote Services",                   "Lateral Movement",    "https://attack.mitre.org/techniques/T1021"),
    "credential":           MITRETechnique("T1003", "OS Credential Dumping",             "Credential Access",   "https://attack.mitre.org/techniques/T1003"),
    "malware":              MITRETechnique("T1059", "Command and Scripting Interpreter",  "Execution",           "https://attack.mitre.org/techniques/T1059"),
    "ransomware":           MITRETechnique("T1486", "Data Encrypted for Impact",         "Impact",              "https://attack.mitre.org/techniques/T1486"),
    "exfiltration":         MITRETechnique("T1041", "Exfiltration Over C2 Channel",      "Exfiltration",        "https://attack.mitre.org/techniques/T1041"),
    "c2":                   MITRETechnique("T1071", "Application Layer Protocol",        "Command & Control",   "https://attack.mitre.org/techniques/T1071"),
    "command and control":  MITRETechnique("T1071", "Application Layer Protocol",        "Command & Control",   "https://attack.mitre.org/techniques/T1071"),
    "privilege escalation": MITRETechnique("T1068", "Exploitation for Privilege Escalation","Privilege Escalation","https://attack.mitre.org/techniques/T1068"),
    "persistence":          MITRETechnique("T1053", "Scheduled Task/Job",               "Persistence",         "https://attack.mitre.org/techniques/T1053"),
    "discovery":            MITRETechnique("T1082", "System Information Discovery",      "Discovery",           "https://attack.mitre.org/techniques/T1082"),
    "port scan":            MITRETechnique("T1046", "Network Service Discovery",         "Discovery",           "https://attack.mitre.org/techniques/T1046"),
    "defense evasion":      MITRETechnique("T1027", "Obfuscated Files or Information",  "Defense Evasion",     "https://attack.mitre.org/techniques/T1027"),
    "trojan":               MITRETechnique("T1204", "User Execution",                    "Execution",           "https://attack.mitre.org/techniques/T1204"),
    "cobalt":               MITRETechnique("T1059.001","PowerShell",                     "Execution",           "https://attack.mitre.org/techniques/T1059/001"),
    "emotet":               MITRETechnique("T1566.001","Spearphishing Attachment",       "Initial Access",      "https://attack.mitre.org/techniques/T1566/001"),
    "failed login":         MITRETechnique("T1110", "Brute Force",                       "Credential Access",   "https://attack.mitre.org/techniques/T1110"),
    "login":                MITRETechnique("T1078", "Valid Accounts",                    "Defense Evasion",     "https://attack.mitre.org/techniques/T1078"),
    "inject":               MITRETechnique("T1055", "Process Injection",                 "Defense Evasion",     "https://attack.mitre.org/techniques/T1055"),
    "remote":               MITRETechnique("T1021", "Remote Services",                   "Lateral Movement",    "https://attack.mitre.org/techniques/T1021"),
    "powershell":           MITRETechnique("T1059.001","PowerShell",                     "Execution",           "https://attack.mitre.org/techniques/T1059/001"),
    "wmi":                  MITRETechnique("T1047", "Windows Management Instrumentation","Execution",           "https://attack.mitre.org/techniques/T1047"),
    "dns":                  MITRETechnique("T1071.004","Application Layer Protocol: DNS","Command & Control",   "https://attack.mitre.org/techniques/T1071/004"),
    "http":                 MITRETechnique("T1071.001","Application Layer Protocol: Web","Command & Control",   "https://attack.mitre.org/techniques/T1071/001"),
    "upload":               MITRETechnique("T1041", "Exfiltration Over C2 Channel",      "Exfiltration",        "https://attack.mitre.org/techniques/T1041"),
    "download":             MITRETechnique("T1105", "Ingress Tool Transfer",             "Command & Control",   "https://attack.mitre.org/techniques/T1105"),
}

def map_findings(findings: list) -> List[MITRETechnique]:
    """Map free-text findings to MITRE ATT&CK techniques."""
    mapped: set = set()
    text = " ".join(str(f) for f in findings).lower()
    for keyword, technique in MAPPINGS.items():
        if keyword in text:
            mapped.add(technique)
    # Always include at least one technique
    if not mapped:
        mapped.add(MITRETechnique("T1190", "Exploit Public-Facing Application", "Initial Access", "https://attack.mitre.org/techniques/T1190"))
    return list(mapped)
