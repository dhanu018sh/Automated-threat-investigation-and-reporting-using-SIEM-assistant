"""
Real-Time Live Attack & Log Collector Script
Simulates live network & system event streaming from Wazuh / Syslog / Elastic agents directly into SIEM Assistant API.

Usage:
  python live_log_collector.py [--continuous] [--interval SECONDS]
"""
import sys
import os
import requests
import time
import random
import argparse
from datetime import datetime

# Force UTF-8 output on Windows consoles
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://localhost:8000/api/siem/ingest"

SAMPLE_ATTACK_EVENTS = [
    {
        "source": "wazuh-agent-01",
        "host": "WS-FINANCE-01",
        "event_type": "ssh_brute_force",
        "raw_log": "Aug 14 11:25:01 auth-server sshd[4912]: Failed password for root from 185.220.101.34 port 44321 ssh2 -- 47 attempts in 3 minutes",
    },
    {
        "source": "syslog-router-core",
        "host": "GATEWAY-FW01",
        "event_type": "dns_exfiltration",
        "raw_log": "Aug 14 11:25:12 dnsmasq[1092]: query[TXT] a3f9c.malicious-c2-tunnel.xyz from 10.0.1.105 payload_size=450KB",
    },
    {
        "source": "elastic-agent",
        "host": "DEV-SERVER-04",
        "event_type": "powershell_malware",
        "raw_log": "EventID: 4688 Process: powershell.exe -ExecutionPolicy Bypass -Enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA... Hash: d41d8cd98f00b204e9800998ecf8427e",
    },
    {
        "source": "wazuh-agent-02",
        "host": "DC-PRIMARY-01",
        "event_type": "credential_dumping",
        "raw_log": "EventID: 4656 LSASS memory access handle created by mimikatz.exe privilege_level=SYSTEM user=Administrator",
    },
    {
        "source": "syslog-switch",
        "host": "SW-CORE-02",
        "event_type": "port_scan",
        "raw_log": "Aug 14 11:25:35 kernel: IPTables-DROP: IN=eth0 OUT= SRC=45.33.32.156 DST=10.0.0.12 PROTO=TCP SPT=54210 DPT=3389 packet_rate=500/s",
    }
]

def send_log_event(event: dict):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Streaming Live Event from [{event['host']} / {event['source']}]...")
    try:
        resp = requests.post(API_URL, json=event, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            sev = data.get("threat_severity", "UNKNOWN")
            family = data.get("malware_family", "N/A")
            score = data.get("risk_score", 0)
            print(f"   -> INGESTED! Threat: {sev} | Classification: {family} | Risk Score: {score}/100 | Alert ID: {data.get('alert_id')}")
        else:
            print(f"   -> Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"   -> Connection Error: Make sure backend is running on http://localhost:8000! ({e})")

def main():
    parser = argparse.ArgumentParser(description="SIEM Live Log Streamer")
    parser.add_argument("--continuous", action="store_true", help="Continuously stream live events")
    parser.add_argument("--interval", type=int, default=5, help="Interval in seconds between events")
    args = parser.parse_args()

    print("================================================================================")
    print("      SIEM ASSISTANT -- REAL-TIME LIVE LOG INGESTION & THREAT STREAMER          ")
    print("================================================================================")
    print(f"Target API Endpoint: {API_URL}")
    print()

    if args.continuous:
        print(f"Streaming live attack logs every {args.interval} seconds... (Press Ctrl+C to stop)")
        try:
            while True:
                event = random.choice(SAMPLE_ATTACK_EVENTS)
                send_log_event(event)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nStopped live stream.")
    else:
        print("Sending 3 live attack log samples...")
        for event in SAMPLE_ATTACK_EVENTS[:3]:
            send_log_event(event)
            time.sleep(1)
        print("\nLive ingestion test complete! Open http://localhost:3000 to see dashboard/alerts.")

if __name__ == "__main__":
    main()
