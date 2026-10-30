"""
Real-Time Live Attack & Log Collector Script
Simulates live network & system event streaming from Wazuh / Syslog / Elastic / Mail agents directly into SIEM Assistant API.
Dynamically uses your machine's active IP address as the attacker IP.

Usage:
  # Stream continuous attacks with your IP:
  python live_log_collector.py --continuous

  # Simulate only Phishing attacks from your IP:
  python live_log_collector.py --phishing

  # Specify a custom attacker IP:
  python live_log_collector.py --attacker-ip 192.168.1.150 --continuous
"""
import sys
import os
import requests
import time
import random
import argparse
import socket
from datetime import datetime

# Force UTF-8 output on Windows consoles
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://localhost:8000/api/siem/ingest"

def get_my_ip() -> str:
    """Returns local active IP address of this machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"

def build_attack_events(attacker_ip: str):
    return [
        {
            "source": "mail-gateway-01",
            "host": "MAIL-SEC-01",
            "event_type": "phishing_campaign",
            "raw_log": f"Postfix/smtpd[8912]: Inbound spearphishing email from {attacker_ip} targeting finance-dept with fake login link http://{attacker_ip}:8080/portal/login and credential harvesting payload",
        },
        {
            "source": "wazuh-agent-01",
            "host": "WS-FINANCE-01",
            "event_type": "ssh_brute_force",
            "raw_log": f"Aug 14 11:25:01 auth-server sshd[4912]: Failed password for root from {attacker_ip} port 44321 ssh2 -- 47 attempts in 3 minutes",
        },
        {
            "source": "syslog-router-core",
            "host": "GATEWAY-FW01",
            "event_type": "dns_exfiltration",
            "raw_log": f"Aug 14 11:25:12 dnsmasq[1092]: query[TXT] a3f9c.malicious-c2-tunnel.xyz from {attacker_ip} payload_size=450KB",
        },
        {
            "source": "elastic-agent",
            "host": "DEV-SERVER-04",
            "event_type": "powershell_malware",
            "raw_log": f"EventID: 4688 Process: powershell.exe -ExecutionPolicy Bypass -Enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA... Hash: d41d8cd98f00b204e9800998ecf8427e Attacker: {attacker_ip}",
        },
        {
            "source": "wazuh-agent-02",
            "host": "DC-PRIMARY-01",
            "event_type": "credential_dumping",
            "raw_log": f"EventID: 4656 LSASS memory access handle created by mimikatz.exe privilege_level=SYSTEM user=Administrator source_ip={attacker_ip}",
        },
        {
            "source": "syslog-switch",
            "host": "SW-CORE-02",
            "event_type": "port_scan",
            "raw_log": f"Aug 14 11:25:35 kernel: IPTables-DROP: IN=eth0 OUT= SRC={attacker_ip} DST=10.0.0.12 PROTO=TCP SPT=54210 DPT=3389 packet_rate=500/s",
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
    detected_ip = get_my_ip()
    parser = argparse.ArgumentParser(description="SIEM Live Log Streamer")
    parser.add_argument("--continuous", action="store_true", help="Continuously stream live events")
    parser.add_argument("--interval", type=int, default=5, help="Interval in seconds between events")
    parser.add_argument("--attacker-ip", type=str, default=detected_ip, help=f"Attacker IP to simulate (default: your IP {detected_ip})")
    parser.add_argument("--phishing", action="store_true", help="Stream only Phishing attack events")
    args = parser.parse_args()

    attacker_ip = args.attacker_ip
    events = build_attack_events(attacker_ip)

    if args.phishing:
        events = [events[0]]  # Phishing event

    print("================================================================================")
    print("      SIEM ASSISTANT -- REAL-TIME LIVE LOG INGESTION & THREAT STREAMER          ")
    print("================================================================================")
    print(f"Target API Endpoint : {API_URL}")
    print(f"Attacker Source IP  : {attacker_ip} (Your IP)")
    print(f"Attack Mode         : {'PHISHING ONLY' if args.phishing else 'ALL ATTACK VECTORS'}")
    print("================================================================================")
    print()

    if args.continuous:
        print(f"Streaming live attack logs every {args.interval} seconds... (Press Ctrl+C to stop)")
        try:
            while True:
                event = random.choice(events)
                send_log_event(event)
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nStopped live stream.")
    else:
        print(f"Sending {'phishing attack sample' if args.phishing else 'live attack samples'}...")
        for event in events:
            send_log_event(event)
            time.sleep(1)
        print("\nLive ingestion test complete! Open http://localhost:5173 to see dashboard/alerts.")

if __name__ == "__main__":
    main()
