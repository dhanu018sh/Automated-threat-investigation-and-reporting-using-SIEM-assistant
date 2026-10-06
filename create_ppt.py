from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# ─────────────────────── COLORS ───────────────────────
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
BLACK   = RGBColor(0x00, 0x00, 0x00)
DARK    = RGBColor(0x1A, 0x1A, 0x1A)
GREY    = RGBColor(0x55, 0x55, 0x55)
LGREY   = RGBColor(0xCC, 0xCC, 0xCC)
HEADING = RGBColor(0x1F, 0x3A, 0x6B)   # navy blue for slide titles only

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]

# ─────────────────────── HELPERS ────────────────────────
def add_bg(slide):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = WHITE

def rule(slide, top):
    """Thin horizontal rule"""
    box(slide, 0.4, top, 12.5, 0.02, bg=LGREY)

def box(slide, left, top, width, height, bg=None, border=None, bpt=0):
    from pptx.util import Inches, Pt
    sh = slide.shapes.add_shape(1,
        Inches(left), Inches(top), Inches(width), Inches(height))
    if bg:
        sh.fill.solid()
        sh.fill.fore_color.rgb = bg
    else:
        sh.fill.background()
    if border:
        sh.line.color.rgb = border
        sh.line.width = Pt(bpt)
    else:
        sh.line.fill.background()
    return sh

def txt(slide, text, left, top, width, height,
        size=14, bold=False, color=BLACK,
        align=PP_ALIGN.LEFT, italic=False):
    from pptx.util import Inches, Pt
    txb = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height))
    txb.word_wrap = True
    tf = txb.text_frame
    tf.word_wrap = True
    p  = tf.paragraphs[0]
    p.alignment = align
    r  = p.add_run()
    r.text = text
    r.font.size   = Pt(size)
    r.font.bold   = bold
    r.font.italic = italic
    r.font.color.rgb = color
    return txb

def slide_header(slide, title, subtitle=None):
    add_bg(slide)
    # Top accent bar - thin navy
    box(slide, 0, 0, 13.33, 0.07, bg=HEADING)
    # Bottom footer
    txt(slide, "Conversational SIEM Assistant  |  Phase 1 Project Report  |  Dhanush  |  2025",
        0.4, 7.22, 12.5, 0.25, size=9, color=GREY, align=PP_ALIGN.CENTER, italic=True)
    rule(slide, 7.2)
    # Title
    txt(slide, title, 0.4, 0.18, 12.5, 0.55, size=24, bold=True, color=HEADING)
    if subtitle:
        txt(slide, subtitle, 0.4, 0.72, 12.5, 0.32, size=12, color=GREY, italic=True)
    rule(slide, 0.95 if subtitle else 0.8)

# ════════════════════════════════════════════════════════
#  SLIDE 1 — TITLE SLIDE
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
add_bg(sl)
box(sl, 0, 0, 13.33, 0.07, bg=HEADING)
box(sl, 0, 7.43, 13.33, 0.07, bg=HEADING)

# Center box
box(sl, 1.2, 1.5, 10.9, 4.5, border=LGREY, bpt=1)

txt(sl, "Conversational SIEM Assistant",
    1.2, 1.9, 10.9, 0.9, size=34, bold=True, color=HEADING, align=PP_ALIGN.CENTER)
txt(sl, "Real-Time AI Threat Detection, Investigation & Incident Reporting Platform",
    1.2, 2.85, 10.9, 0.5, size=16, color=DARK, align=PP_ALIGN.CENTER)
rule(sl, 3.42)
txt(sl, "Phase 1 Project Report  |  2025",
    1.2, 3.52, 10.9, 0.38, size=14, color=GREY, align=PP_ALIGN.CENTER)
txt(sl, "Presented by: Dhanush",
    1.2, 3.95, 10.9, 0.38, size=14, color=BLACK, align=PP_ALIGN.CENTER, bold=True)
txt(sl, "Domain: Cybersecurity  |  Artificial Intelligence  |  Machine Learning",
    1.2, 4.38, 10.9, 0.35, size=13, color=GREY, align=PP_ALIGN.CENTER)
txt(sl, "Stack: Python 3.11  |  FastAPI  |  React 18  |  scikit-learn  |  NetworkX  |  SQLite",
    1.2, 4.75, 10.9, 0.35, size=12, color=GREY, align=PP_ALIGN.CENTER, italic=True)

# ════════════════════════════════════════════════════════
#  SLIDE 2 — PROBLEM STATEMENT
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "1.  Problem Statement",
             "Security Operations Centers struggle to scale threat detection using traditional rule-based SIEM systems.")

problems = [
    "Modern enterprises generate millions of security events per day — analysts cannot manually triage them all.",
    "Traditional SIEM platforms require complex query languages (SPL, KQL, AQL) that most Tier-1 analysts cannot use efficiently.",
    "Rule-based correlation engines produce 70-90% FALSE POSITIVES, causing severe analyst fatigue.",
    "Investigation workflows are fragmented — analysts switch between 5-8 separate tools per incident (SIEM, VirusTotal, AbuseIPDB, ticketing systems).",
    "Incident reports are manually written, inconsistent, and often delayed by 24-72 hours after an attack.",
    "Static thresholds miss zero-day attacks, polymorphic malware, and slow-burn lateral movement campaigns.",
    "No unified, AI-powered, conversational threat investigation platform exists for SME SOC teams.",
]
for i, p in enumerate(problems):
    txt(sl, f"{i+1}.  {p}", 0.5, 1.15 + i * 0.83, 12.3, 0.78, size=13, color=BLACK)

# ════════════════════════════════════════════════════════
#  SLIDE 3 — OBJECTIVES
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "2.  Objectives",
             "Five core technical objectives driving the SIEM Assistant platform.")

objs = [
    ("a.  Intent and Entity Recognition using Advanced NLP  [STATUS: COMPLETED]",
     "Natural language classification into 7 intents (investigate, enrich, report, correlate, remediate, help, unknown). "
     "Entity extraction: IP addresses, SHA256/MD5 hashes, domains, usernames, CVE IDs, timeframes. "
     "GPT-4 primary engine with Regex fallback. Pronoun/reference resolution from 10-turn session history."),
    ("b.  AI-Based Threat Detection  [STATUS: COMPLETED]",
     "Real-time RandomForestClassifier (100 decision trees) predicts malware families: Ransomware.Ryuk, Trojan.AsyncRAT, "
     "CobaltStrike.Beacon, Emotet.Botnet. RandomForestRegressor computes attacked system risk scores (0-100). "
     "Identifies exploited CVEs: CVE-2024-30078, CVE-2024-21412, CVE-2023-38831, CVE-2023-23397."),
    ("c.  Intelligent Threat Correlation & Dynamic Report Generation  [STATUS: PARTIALLY DONE]",
     "NetworkX DAG playbook engine runs YAML investigation workflows (brute force, phishing, malware analysis, lateral movement). "
     "Auto-generates reports in Plain Text (.txt), PDF, HTML, Markdown, and JSON. "
     "MITRE ATT&CK framework mapping (T1110, T1566, T1021, T1059, T1071, etc.). "
     "Enrichment pipeline (VirusTotal v3, AbuseIPDB v2) - live API connection pending."),
    ("d.  Context-Aware Multi-Turn Conversations  [STATUS: COMPLETED]",
     "Redis + in-memory session state maintains last 10 conversation turns per analyst. "
     "Analysts interact entirely in plain English - no SIEM query language required. "
     "Conversation titles auto-update from first search query. Persistent chat history via localStorage."),
]

top_y = 1.08
for title, desc in objs:
    h = 1.45
    box(sl, 0.4, top_y, 12.53, h, border=LGREY, bpt=1)
    txt(sl, title, 0.55, top_y + 0.07, 12.2, 0.32, size=12, bold=True, color=HEADING)
    txt(sl, desc,  0.55, top_y + 0.42, 12.2, h - 0.5, size=11, color=DARK)
    top_y += h + 0.08

# ════════════════════════════════════════════════════════
#  SLIDE 4 — PROPOSED METHODOLOGY
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "3.  Proposed Methodology",
             "End-to-end pipeline from natural language input to structured threat report output.")

steps = [
    ("Step 1", "User Query Input",
     "Analyst types a natural language query in Copilot Chat (e.g. 'Investigate ransomware from 45.33.32.156')."),
    ("Step 2", "NLP Processing",
     "Intent classification (GPT-4 / Regex fallback) + entity extraction: IP, hash, user, domain, CVE, timeframe."),
    ("Step 3", "Context Resolution",
     "Redis session manager resolves pronouns and references from conversation history (last 10 turns)."),
    ("Step 4", "SIEM Query Execution",
     "QueryTranslator generates platform-specific query (SPL / DSL / KQL / AQL / Mock). SIEM Connector executes and returns event results."),
    ("Step 5", "Random Forest ML Analysis",
     "100-tree ensemble predicts malware family, severity, system risk score, and exploited CVE in under 4ms."),
    ("Step 6", "Playbook Orchestration",
     "NetworkX DAG engine runs YAML playbooks: IOC extraction, enrichment (VirusTotal/AbuseIPDB), MITRE technique mapping."),
    ("Step 7", "Report Auto-Generation",
     "Plain Text / HTML / PDF / JSON reports auto-saved to Incident & Threat Reports store and localStorage."),
]

for i, (step, title, desc) in enumerate(steps):
    top = 1.08 + i * 0.875
    box(sl, 0.4, top, 1.2, 0.75, bg=HEADING)
    txt(sl, step, 0.4, top + 0.18, 1.2, 0.38, size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    box(sl, 1.65, top, 11.25, 0.75, border=LGREY, bpt=1)
    txt(sl, title, 1.78, top + 0.06, 11.0, 0.28, size=12, bold=True, color=HEADING)
    txt(sl, desc,  1.78, top + 0.36, 11.0, 0.35, size=11, color=DARK)

# ════════════════════════════════════════════════════════
#  SLIDE 5 — TECHNOLOGY STACK
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "4.  Technology Stack",
             "Full production technology stack across all layers of the platform.")

cols = [
    ("Backend Core", [
        "Python 3.11",
        "FastAPI + Uvicorn",
        "SQLAlchemy 2.0 (Async)",
        "SQLite / PostgreSQL",
        "Pydantic v2 Settings",
        "python-jose (JWT Auth)",
        "passlib + bcrypt 4.0.1",
        "Alembic Migrations",
    ]),
    ("Machine Learning", [
        "scikit-learn 1.9.0",
        "RandomForestClassifier",
        "RandomForestRegressor",
        "numpy 2.4.6",
        "pandas 3.0.5",
        "scipy 1.17.1",
        "Gini Impurity Criterion",
        "100 Estimators Ensemble",
    ]),
    ("NLP & Orchestration", [
        "OpenAI GPT-4 (primary)",
        "Regex NLP (fallback)",
        "networkx (DAG engine)",
        "PyYAML (playbooks)",
        "Redis (session state)",
        "Celery (async tasks)",
        "httpx (API clients)",
        "Jinja2 (templates)",
    ]),
    ("Frontend", [
        "React 18 + TypeScript",
        "Vite 5.4",
        "Zustand (state mgmt)",
        "React Router v6",
        "Lucide React icons",
        "ReactMarkdown",
        "WebSocket real-time",
        "localStorage persist",
    ]),
    ("DevOps / Integrations", [
        "Docker + Compose",
        "Kubernetes Manifests",
        "Nginx (frontend proxy)",
        "GitHub (version control)",
        "python-pptx",
        "WeasyPrint (PDF)",
        "VirusTotal API v3",
        "AbuseIPDB API v2",
    ]),
]

col_w = 2.5
for j, (cat, items) in enumerate(cols):
    left = 0.3 + j * 2.6
    box(sl, left, 1.08, 2.55, 6.1, border=LGREY, bpt=1)
    txt(sl, cat, left + 0.1, 1.12, 2.35, 0.32, size=12, bold=True, color=HEADING)
    rule(sl, 1.46) if j == 0 else None
    for k, it in enumerate(items):
        txt(sl, f"- {it}", left + 0.15, 1.48 + k * 0.57, 2.3, 0.55, size=11, color=BLACK)

# ════════════════════════════════════════════════════════
#  SLIDE 6 — DATASET / INPUT DETAILS
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "5.  Dataset / Input Details",
             "Training data, live SIEM inputs, and threat intelligence sources used in the system.")

sections = [
    ("Random Forest Training Dataset",
     [
         "600 synthetic security event samples x 10 numerical features per event.",
         "Features: failed_logins, payload_size_kb, file_entropy, port_number, packet_rate,",
         "          is_outbound_c2, privilege_level, has_encoded_cmd, ip_reputation_score, is_after_hours.",
         "Labels: Malware Family (5 classes) + Severity (4 classes) + CVE ID (5 classes).",
         "Regression target: Attacked System Risk Score (0-100 continuous output).",
         "Generated using NumPy seeded random distributions simulating real SOC telemetry.",
     ]),
    ("Live SIEM Event Sources",
     [
         "Mock SIEM Adapter: 20+ synthetic event generators (brute force, phishing, lateral movement, malware).",
         "Elasticsearch DSL Adapter, Splunk SPL Adapter, Sentinel KQL Stub, QRadar AQL Stub (configurable).",
         "Real event features from: EDR logs, firewall syslog, Active Directory auth events, network flow records.",
     ]),
    ("Threat Intelligence Enrichment Feeds",
     [
         "VirusTotal API v3: File hash reputation, URL scan, detection ratio (58/72 engines).",
         "AbuseIPDB API v2: IP reputation scoring (0-100 confidence score).",
         "MITRE ATT&CK Navigator: 30+ TTP technique mappings (T1110, T1566, T1021, T1059, T1071).",
         "CVE Database: CVE-2024-30078 (CVSS 9.8), CVE-2024-21412 (CVSS 8.1), CVE-2023-38831 (CVSS 7.8),",
         "              CVE-2023-23397 (CVSS 9.8), CVE-2024-1709 (CVSS 10.0).",
     ]),
]

top_y = 1.08
for title, items in sections:
    h = 0.42 + len(items) * 0.34
    box(sl, 0.4, top_y, 12.53, h, border=LGREY, bpt=1)
    txt(sl, title, 0.55, top_y + 0.07, 12.2, 0.3, size=13, bold=True, color=HEADING)
    for k, it in enumerate(items):
        txt(sl, it, 0.65, top_y + 0.4 + k * 0.34, 12.1, 0.33, size=11, color=BLACK)
    top_y += h + 0.12

# ════════════════════════════════════════════════════════
#  SLIDE 7 — MODULE DESIGN
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "6.  Module Design",
             "Seven interconnected modules forming the complete system architecture.")

modules = [
    ("M1", "NLU Engine",
     "Intent Classifier + Entity Extractor + Context Manager + Query Translator"),
    ("M2", "SIEM Connector Layer",
     "Abstract SIEMConnector -> Mock / Elastic / Splunk / Sentinel / QRadar adapters + Query Sanitizer"),
    ("M3", "Random Forest ML Engine",
     "RandomForestClassifier (malware + severity) + RandomForestRegressor (risk 0-100) + Feature Extractor"),
    ("M4", "Playbook Orchestration Engine",
     "NetworkX DAG Engine + YAML Loader + Async Node Executor (Brute Force, Phishing, Malware, Lateral Movement)"),
    ("M5", "Threat Intelligence Enrichment",
     "VirusTotal v3 + AbuseIPDB v2 + Redis TTL Cache + Parallel Orchestrator -> IOC enrichment pipeline"),
    ("M6", "Report Generation Engine",
     "Jinja2 templates -> Plain Text (.txt) / PDF (WeasyPrint) / HTML / Markdown / JSON + MITRE ATT&CK Mapper"),
    ("M7", "SOC Dashboard & Copilot UI",
     "React 18 + Zustand (chatStore + reportStore) + WebSocket real-time + localStorage persistence"),
]

for i, (num, title, desc) in enumerate(modules):
    top = 1.08 + i * 0.875
    box(sl, 0.4, top, 0.9, 0.75, bg=HEADING)
    txt(sl, num, 0.4, top + 0.2, 0.9, 0.35, size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    box(sl, 1.35, top, 11.6, 0.75, border=LGREY, bpt=1)
    txt(sl, title, 1.48, top + 0.06, 11.3, 0.3, size=13, bold=True, color=HEADING)
    txt(sl, desc,  1.48, top + 0.38, 11.3, 0.33, size=11, color=DARK)

# ════════════════════════════════════════════════════════
#  SLIDE 8 — WORK COMPLETED
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "7.  Work Completed",
             "All major backend, ML engine, and frontend components implemented and verified.")

done_items = [
    ("M1 - NLU Engine (DONE)", [
        "Intent classifier: GPT-4 primary + Regex fallback covering 7 security intents.",
        "Entity extractor: IPv4/IPv6, MD5/SHA256 hashes, domain names, usernames, timeframes.",
        "Context manager: Redis + in-memory fallback, resolves pronouns from last 10 turns.",
        "Query translator: generates SPL / DSL / KQL / AQL / generic queries.",
    ]),
    ("M2 - SIEM Connectors (DONE)", [
        "Abstract SIEMConnector base class with SIEMQuery and SIEMResult dataclasses.",
        "Mock adapter with 20+ synthetic event generators covering all threat categories.",
        "Elasticsearch DSL, Splunk SPL adapters implemented. Sentinel and QRadar stubs ready.",
        "Query injection sanitizer and adapter factory pattern implemented.",
    ]),
    ("M3 - Random Forest ML Engine (DONE)", [
        "RandomForestClassifier: 100 trees, 5 malware families, 4 severity levels.",
        "RandomForestRegressor: attacked system risk score (0-100 continuous regression).",
        "CVE vulnerability correlation and Gini feature importance extraction.",
        "Integrated into chat REST API, WebSocket stream, and playbook engine.",
    ]),
    ("M4 - Playbook Engine (PARTIALLY DONE)", [
        "NetworkX DAG async execution engine implemented.",
        "YAML definitions: brute_force, phishing, malware_analysis, lateral_movement.",
        "Random Forest predictions embedded into playbook findings.",
        "PENDING: Live enrichment API calls inside playbook nodes + ApprovalGate blocking.",
    ]),
    ("M6 - Report Generation (DONE)", [
        "Plain Text (.txt) report generator with full incident structure.",
        "PDF / HTML / Markdown / JSON fallback engine (WeasyPrint + Jinja2 templates).",
        "MITRE ATT&CK mapper (30+ TTP techniques). Auto-save from chat to Reports store.",
    ]),
    ("M7 - SOC Dashboard UI (DONE)", [
        "Dashboard, Copilot Chat, Investigations, Reports pages built and verified.",
        "RandomForestCard component with live ML predictions inside message bubbles.",
        "Persistent chat history + report auto-storage across browser sessions (localStorage).",
    ]),
]

cols = [done_items[:3], done_items[3:]]
for ci, col in enumerate(cols):
    left = 0.4 + ci * 6.5
    top_y = 1.08
    for title, bullets in col:
        h = 0.38 + len(bullets) * 0.295 + 0.1
        box(sl, left, top_y, 6.25, h, border=LGREY, bpt=1)
        txt(sl, title, left + 0.12, top_y + 0.06, 6.0, 0.28, size=11, bold=True, color=HEADING)
        for k, b in enumerate(bullets):
            txt(sl, f"- {b}", left + 0.15, top_y + 0.36 + k * 0.295, 6.0, 0.28, size=10, color=BLACK)
        top_y += h + 0.1

# ════════════════════════════════════════════════════════
#  SLIDE 9 — CURRENT PROGRESS
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "8.  Current Progress",
             "Completion percentage across all 7 project modules as of August 2025.")

progress = [
    ("M1 - NLU Engine",                    95),
    ("M2 - SIEM Connector Layer",           90),
    ("M3 - Random Forest ML Engine",       100),
    ("M4 - Playbook Orchestration Engine",  80),
    ("M5 - Threat Intel Enrichment",        70),
    ("M6 - Report Generation Engine",       90),
    ("M7 - SOC Dashboard & Copilot UI",     88),
    ("OVERALL PROJECT COMPLETION",          87),
]

bar_x = 4.0
bar_w = 8.5
for i, (label, pct) in enumerate(progress):
    top = 1.15 + i * 0.73
    is_total = "OVERALL" in label
    txt(sl, label, 0.45, top + 0.12, 3.5, 0.35,
        size=12 if not is_total else 13,
        bold=is_total, color=BLACK)
    # Background bar
    box(sl, bar_x, top + 0.1, bar_w, 0.38, bg=RGBColor(0xEE, 0xEE, 0xEE))
    # Filled bar
    filled = bar_w * pct / 100
    box(sl, bar_x, top + 0.1, filled, 0.38, bg=HEADING)
    # Percentage label
    txt(sl, f"{pct}%", bar_x + bar_w + 0.12, top + 0.12, 0.65, 0.35,
        size=12, bold=True, color=HEADING)

# ════════════════════════════════════════════════════════
#  SLIDE 10 — CHALLENGES FACED
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "9.  Challenges Faced",
             "Technical and architectural challenges encountered during development.")

challenges = [
    ("1. bcrypt 5.0.0 + passlib Compatibility",
     "passlib internally benchmarks bcrypt and crashes with bcrypt >= 5.0.0 raising ValueError for 72+ byte passwords. "
     "SOLUTION: Pin bcrypt==4.0.1 and add [:72] truncation in verify_password() inside jwt_handler.py."),
    ("2. WeasyPrint GTK Native Libraries on Windows",
     "WeasyPrint requires libgobject / libpango C native DLLs. Without GTK installed, importing at startup crashes uvicorn. "
     "SOLUTION: Lazy import inside try/except in generator.py; fall back to Plain Text / HTML output."),
    ("3. SQLAlchemy Async PostgreSQL vs SQLite Fallback",
     "In local development without PostgreSQL running, asyncpg connections fail on startup. "
     "SOLUTION: Socket probe checks port 5432; auto-switches DATABASE_URL to sqlite+aiosqlite:///./siem.db."),
    ("4. React Double /api/ Proxy Duplication Bug",
     "Vite proxied /api to http://localhost:8000, but axios baseURL set to '/api', causing /api/api/ double-prefix 404 errors. "
     "SOLUTION: Set axios baseURL to '/api' and all endpoint strings to relative paths (e.g. '/auth/login')."),
    ("5. RBAC Role Enum / String Type Mismatch",
     "SQLAlchemy stored roles as Enum objects; string comparison in require_role() always failed. "
     "SOLUTION: Added .value extraction guard in rbac.py to handle both str and Enum role types."),
    ("6. WebSocket Auth Token Forwarding Limitation",
     "WebSocket API in browsers does not support custom headers for auth tokens. "
     "SOLUTION: REST API fallback in useWebSocket.ts hook activates whenever WS readyState is not OPEN."),
]

top_y = 1.08
for title, desc in challenges:
    h = 0.92
    box(sl, 0.4, top_y, 12.53, h, border=LGREY, bpt=1)
    txt(sl, title, 0.55, top_y + 0.06, 12.2, 0.28, size=12, bold=True, color=HEADING)
    txt(sl, desc,  0.55, top_y + 0.36, 12.2, 0.5,  size=11, color=BLACK)
    top_y += h + 0.07

# ════════════════════════════════════════════════════════
#  SLIDE 11 — WORK PLAN
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "10.  Work Plan - Remaining Development Tasks",
             "Planned tasks to complete the remaining 13% of the project scope.")

remaining = [
    ("M4 - Playbook Engine Completion (20% Remaining)", [
        "Implement full async node execution with live SIEM event data (currently uses dummy execution).",
        "Add ApprovalGate blocking for high-impact actions (isolate host, block IP) inside DAG flow.",
        "Integrate enrichment pipeline (VirusTotal + AbuseIPDB) directly inside playbook nodes.",
        "Add real-time playbook progress streaming over WebSocket (node-by-node status updates).",
    ]),
    ("M5 - Threat Intel Enrichment (30% Remaining)", [
        "Connect live VirusTotal v3 and AbuseIPDB v2 API calls (API keys loaded via .env config).",
        "Implement Redis TTL cache (15-minute expiry) to avoid repeated API calls for same IOCs.",
        "Add Shodan API integration for open port and attack surface enrichment.",
        "Feed enrichment results back into Random Forest feature vector for dynamic re-scoring.",
    ]),
    ("M3 - RF Model Improvement", [
        "Expand training dataset from 600 to 10,000+ synthetic events with broader class distribution.",
        "Add model persistence using joblib.dump / load to avoid retraining on every server restart.",
        "Introduce online learning (partial_fit) so the model improves from analyst feedback over time.",
    ]),
    ("Integration Testing, Docker Deployment & Cloud", [
        "Run end-to-end integration tests: login > chat > playbook > RF analysis > report > download.",
        "Containerize backend and frontend with Docker Compose (production Nginx + uvicorn workers).",
        "Deploy to cloud environment (Azure / AWS / GCP) for live SOC demonstration.",
    ]),
]

top_y = 1.08
for title, items in remaining:
    h = 0.42 + len(items) * 0.33
    box(sl, 0.4, top_y, 12.53, h, border=LGREY, bpt=1)
    txt(sl, title, 0.55, top_y + 0.07, 12.2, 0.3, size=12, bold=True, color=HEADING)
    for k, it in enumerate(items):
        txt(sl, f"  - {it}", 0.65, top_y + 0.4 + k * 0.33, 12.1, 0.31, size=11, color=BLACK)
    top_y += h + 0.1

# ════════════════════════════════════════════════════════
#  SLIDE 12 — EXPECTED OUTCOMES
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "11.  Expected Outcomes",
             "Measurable deliverables and benefits upon full project completion.")

outcomes = [
    ("1. Mean Time to Detect (MTTD) Reduction",
     "Threat detection time reduced from 45 minutes (manual SOC triage) to under 3 seconds using "
     "Real-Time Random Forest ML classification of incoming SIEM event streams."),
    ("2. False Positive Reduction",
     "Reduction of false positive alerts by 60-70% through RF ensemble voting (100 decision trees must "
     "reach consensus) compared to single-threshold rule-based triggers."),
    ("3. Analyst Productivity Improvement",
     "SOC Tier-1 analysts investigate threats entirely in plain English - no SPL/KQL/AQL expertise required. "
     "Estimated 40% reduction in mean investigation turnaround time."),
    ("4. Automated Incident Documentation",
     "Instant generation of structured incident reports (Plain Text / PDF / HTML) upon investigation "
     "completion, with MITRE ATT&CK technique mappings and recommended remediation actions."),
    ("5. Multi-Platform SIEM Coverage",
     "Single conversational interface supporting Splunk, Elastic Stack, Microsoft Sentinel, IBM QRadar, "
     "and any REST-based SIEM via the pluggable adapter pattern."),
    ("6. Persistent SOC Knowledge Base",
     "All investigation conversations and auto-generated incident reports are persistently stored, "
     "creating a searchable and auditable SOC knowledge library over time."),
]

top_y = 1.08
for title, desc in outcomes:
    h = 0.92
    box(sl, 0.4, top_y, 12.53, h, border=LGREY, bpt=1)
    txt(sl, title, 0.55, top_y + 0.06, 12.2, 0.28, size=12, bold=True, color=HEADING)
    txt(sl, desc,  0.55, top_y + 0.36, 12.2, 0.5,  size=11, color=BLACK)
    top_y += h + 0.07

# ════════════════════════════════════════════════════════
#  SLIDE 13 — GANTT CHART / TIMELINE
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_header(sl, "12.  Timeline - Gantt Chart",
             "8-week development schedule from project initiation to final deployment.")

weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
tasks = [
    ("Project Architecture & Environment Setup",     [1,0,0,0,0,0,0,0], True),
    ("NLU Engine + SIEM Adapter Layer",              [1,1,0,0,0,0,0,0], True),
    ("Random Forest ML Engine",                      [0,1,1,0,0,0,0,0], True),
    ("Playbook Orchestration Engine (DAG)",          [0,0,1,1,0,0,0,0], False),
    ("Threat Intel Enrichment (VT / AbuseIPDB)",     [0,0,0,1,1,0,0,0], False),
    ("Report Generation Engine",                     [0,0,0,0,1,1,0,0], True),
    ("SOC Dashboard UI (React 18)",                  [0,1,1,1,1,0,0,0], True),
    ("Integration Testing & Bug Fixes",              [0,0,0,0,0,1,1,0], False),
    ("Docker Compose Deployment & Cloud",            [0,0,0,0,0,0,1,1], False),
    ("Final Documentation & Project Report",         [0,0,0,0,0,0,0,1], False),
]

cell_w = 1.25
start_x = 3.8
hdr_top = 1.1
txt(sl, "Module / Task", 0.4, hdr_top, 3.35, 0.35, size=11, bold=True, color=HEADING)
for wi, wk in enumerate(weeks):
    txt(sl, wk, start_x + wi * cell_w, hdr_top, cell_w, 0.35,
        size=11, bold=True, color=HEADING, align=PP_ALIGN.CENTER)
rule(sl, 1.44)

for ri, (task, wks, done) in enumerate(tasks):
    top = 1.5 + ri * 0.582
    label = ("Done: " if done else "Pending: ") + task
    txt(sl, label, 0.4, top + 0.08, 3.35, 0.38,
        size=9, bold=done, color=HEADING if done else GREY)
    for wi, active in enumerate(wks):
        cell_left = start_x + wi * cell_w + 0.04
        if active:
            fill_color = HEADING if done else RGBColor(0x99, 0xAA, 0xCC)
            box(sl, cell_left, top + 0.09, cell_w - 0.08, 0.36, bg=fill_color)
        else:
            box(sl, cell_left, top + 0.09, cell_w - 0.08, 0.36, bg=RGBColor(0xEE, 0xEE, 0xEE))

txt(sl, "Dark fill = Completed    |    Light fill = Remaining / In Progress",
    0.4, 7.12, 9.0, 0.26, size=9, color=GREY, italic=True)

# ════════════════════════════════════════════════════════
#  SLIDE 14 — THANK YOU
# ════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
add_bg(sl)
box(sl, 0, 0, 13.33, 0.07, bg=HEADING)
box(sl, 0, 7.43, 13.33, 0.07, bg=HEADING)

box(sl, 1.5, 1.8, 10.33, 4.0, border=LGREY, bpt=1)

txt(sl, "Thank You",
    1.5, 2.1, 10.33, 1.0, size=44, bold=True, color=HEADING, align=PP_ALIGN.CENTER)
txt(sl, "Conversational SIEM Assistant",
    1.5, 3.1, 10.33, 0.5, size=20, color=BLACK, align=PP_ALIGN.CENTER)
rule(sl, 3.65)
txt(sl, "Real-Time AI Threat Detection  |  Random Forest ML  |  Automated Incident Reporting",
    1.5, 3.75, 10.33, 0.4, size=13, color=GREY, align=PP_ALIGN.CENTER, italic=True)
txt(sl, "Dhanush  |  Phase 1  |  August 2025",
    1.5, 4.2, 10.33, 0.38, size=14, color=BLACK, align=PP_ALIGN.CENTER, bold=True)
txt(sl, "Stack: Python 3.11 | FastAPI | React 18 | scikit-learn 1.9 | NetworkX | SQLite",
    1.5, 4.62, 10.33, 0.35, size=12, color=GREY, align=PP_ALIGN.CENTER)

# ─────────────────────── SAVE ────────────────────────────────
prs.save(r"D:\antigravity\scratch\siem-assistant\dhanushphse.pptx")
print("[DONE] Presentation saved: D:\\antigravity\\scratch\\siem-assistant\\dhanushphse.pptx")
print(f"       Total slides: {len(prs.slides)}")
