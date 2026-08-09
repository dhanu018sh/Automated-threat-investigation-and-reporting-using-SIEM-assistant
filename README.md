# SIEM Assistant

> **An AI-powered Conversational Security Operations Center (SOC) Intelligence Platform**

## 🎯 Overview

SIEM Assistant is a production-ready conversational SIEM platform that integrates with **any SIEM** via REST APIs. Use natural language to investigate threats, run automated playbooks, and generate structured incident reports.

```
"Investigate brute force attacks from 192.168.1.100 in the last 24 hours"
→ Runs automated playbook → Enriches IPs → Maps MITRE ATT&CK → Generates PDF report
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SIEM Assistant Stack                      │
├────────────────┬────────────────┬───────────────────────────┤
│  React Frontend│  FastAPI Backend│  Celery Workers           │
│  (Port 3000)  │  (Port 8000)   │  (async playbooks)        │
├────────────────┼────────────────┼───────────────────────────┤
│  PostgreSQL    │  Redis         │  SIEM Adapters            │
│  (user data)   │  (cache+queue) │  Mock/Elastic/Splunk/etc  │
└────────────────┴────────────────┴───────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- 4GB RAM minimum

### 1-Minute Setup

```bash
# Clone/navigate to project
cd D:\antigravity\scratch\siem-assistant

# Copy environment file
copy .env.example .env

# Start all services
docker compose up -d

# Wait ~30 seconds for services to start
# Open browser to http://localhost:3000

# Login with demo credentials:
# Username: analyst / Password: analyst123
# Username: manager / Password: manager123
```

## 📁 Project Structure

```
siem-assistant/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/               # REST + WebSocket endpoints
│   │   │   ├── auth.py        # JWT authentication
│   │   │   ├── chat.py        # WebSocket chat + REST fallback
│   │   │   ├── investigations.py
│   │   │   └── reports.py
│   │   ├── siem/              # SIEM adapter layer
│   │   │   ├── base.py        # Abstract SIEMConnector
│   │   │   ├── mock_adapter.py  # Realistic mock data
│   │   │   ├── elastic_adapter.py  # Elasticsearch
│   │   │   ├── splunk_adapter.py   # Splunk Enterprise
│   │   │   ├── sentinel_adapter.py # Microsoft Sentinel
│   │   │   ├── qradar_adapter.py   # IBM QRadar
│   │   │   └── factory.py
│   │   ├── nlu/               # Natural Language Understanding
│   │   │   ├── intent_classifier.py  # GPT-4 + regex fallback
│   │   │   ├── entity_extractor.py   # IP/hash/user extraction
│   │   │   ├── context_manager.py    # Redis conversation context
│   │   │   └── query_translator.py   # NL → SIEM query
│   │   ├── playbooks/         # DAG-based playbook engine
│   │   │   ├── engine.py      # Async DAG executor
│   │   │   ├── loader.py      # YAML loader
│   │   │   └── definitions/   # Playbook YAML files
│   │   │       ├── brute_force.yaml
│   │   │       ├── phishing.yaml
│   │   │       ├── malware_analysis.yaml
│   │   │       └── lateral_movement.yaml
│   │   ├── enrichment/        # Threat intelligence
│   │   │   ├── virustotal.py
│   │   │   ├── abuseipdb.py
│   │   │   ├── cache.py       # Redis TTL cache
│   │   │   └── orchestrator.py
│   │   ├── reporting/         # Report generation
│   │   │   ├── generator.py   # PDF/HTML/MD/JSON
│   │   │   ├── mitre_mapper.py # MITRE ATT&CK mapping
│   │   │   └── templates/     # Jinja2 templates
│   │   ├── auth/              # JWT + RBAC
│   │   ├── tasks/             # Celery async tasks
│   │   ├── utils/             # Sanitizer, masker, rate limiter
│   │   ├── config.py          # Pydantic settings
│   │   ├── database.py        # SQLAlchemy async models
│   │   └── main.py            # FastAPI app
│   └── requirements.txt
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── pages/             # Dashboard, Chat, Investigations, Reports
│   │   ├── components/        # ChatInterface, Sidebar, PlaybookProgress, etc.
│   │   ├── store/             # Zustand state management
│   │   ├── api/               # Axios API clients
│   │   ├── hooks/             # useWebSocket
│   │   └── types/             # TypeScript interfaces
│   └── package.json
├── k8s/                       # Kubernetes manifests
│   └── deployment.yaml
├── docker-compose.yml
└── .env.example
```

## 🔌 SIEM Integration

| Platform | Status | Query Language |
|----------|--------|----------------|
| **Mock** (default) | ✅ Ready | N/A |
| **Elasticsearch/ELK** | ✅ Ready | Query DSL |
| **Splunk Enterprise** | ✅ Ready | SPL |
| **Microsoft Sentinel** | 🔧 Skeleton | KQL |
| **IBM QRadar** | 🔧 Skeleton | AQL |

### Connecting to Elasticsearch
```env
SIEM_PLATFORM=elastic
USE_MOCK_DATA=false
SIEM_URL=https://your-elastic-host:9200
SIEM_API_TOKEN=your-api-key
```

### Connecting to Splunk
```env
SIEM_PLATFORM=splunk
USE_MOCK_DATA=false
SIEM_URL=https://your-splunk:8089
SIEM_USERNAME=admin
SIEM_PASSWORD=your-password
```

## 🤖 Playbooks

| Playbook | Trigger Keywords | Nodes |
|----------|-----------------|-------|
| `brute_force_investigation` | brute force, failed login, credential stuffing | 7 |
| `phishing_investigation` | phishing, suspicious email, malicious link | 6 |
| `malware_analysis` | malware, ransomware, trojan, file hash | 8 |
| `lateral_movement` | lateral movement, SMB, pass the hash | 8 |

## 💬 Example Queries

```bash
# Brute force investigation
"Investigate brute force attacks from 192.168.1.100 in the last 24 hours"

# Phishing detection  
"Show phishing attempts in the past 72 hours"

# Malware analysis
"Analyze malware hash d41d8cd98f00b204e9800998ecf8427e"

# Lateral movement
"Investigate lateral movement from WS-FINANCE-01"

# Slash commands
/enrich 192.168.1.100       # IP reputation check
/enrich d41d8cd98f00b204e9800998ecf8427e  # Hash analysis
/report                     # Generate PDF report
/playbook brute_force       # Force specific playbook
```

## 🔐 RBAC Roles

| Role | Permissions |
|------|-------------|
| **analyst** | Read queries, run playbooks, view reports |
| **senior_analyst** | All analyst + generate reports, enrich indicators |
| **soc_manager** | All senior + user management, audit logs, approve actions |

## 📊 Tech Stack

**Backend:** Python 3.11 · FastAPI · SQLAlchemy · Celery · Redis · PostgreSQL  
**Frontend:** React 18 · TypeScript · Vite · Zustand · WebSockets  
**AI/NLU:** OpenAI GPT-4 (optional) · Regex fallback (no key needed)  
**Integrations:** VirusTotal · AbuseIPDB · Elasticsearch · Splunk  
**DevOps:** Docker Compose · Kubernetes  

## 🧪 API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health:** http://localhost:8000/health

## ⚙️ Configuration

See [`.env.example`](.env.example) for all configuration options.

Key settings:
- `SIEM_PLATFORM` — Choose your SIEM backend
- `OPENAI_API_KEY` — Enable GPT-4 NLU (optional, has regex fallback)
- `VIRUSTOTAL_API_KEY` — Enable real threat intel (optional, has mock)
- `ABUSEIPDB_API_KEY` — Enable IP reputation (optional, has mock)
