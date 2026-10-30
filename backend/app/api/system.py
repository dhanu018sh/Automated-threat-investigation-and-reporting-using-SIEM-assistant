"""
System Telemetry & Live Endpoint Status API
Provides real-time machine hardware, OS, network, and live socket connection metrics.
"""
from fastapi import APIRouter
from typing import Dict, Any, List
import subprocess
from ..utils.system_detector import get_full_system_telemetry

router = APIRouter(prefix="/api/system", tags=["system-telemetry"])

@router.get("/telemetry")
async def get_telemetry() -> Dict[str, Any]:
    """Returns live host machine specifications, OS, network, and clocks."""
    return get_full_system_telemetry()

@router.get("/sockets")
async def get_active_sockets(limit: int = 25) -> Dict[str, Any]:
    """Returns real active established network socket connections."""
    sockets: List[Dict[str, Any]] = []
    try:
        out = subprocess.check_output("netstat -ano", shell=True, text=True, stderr=subprocess.DEVNULL)
        for line in out.splitlines():
            if "ESTABLISHED" in line:
                parts = line.split()
                if len(parts) >= 5:
                    local_addr = parts[1]
                    remote_addr = parts[2]
                    pid = parts[4]
                    sockets.append({
                        "protocol": parts[0],
                        "local_address": local_addr,
                        "remote_address": remote_addr,
                        "status": "ESTABLISHED",
                        "pid": pid,
                    })
                    if len(sockets) >= limit:
                        break
    except Exception:
        pass

    return {
        "total_sockets": len(sockets),
        "sockets": sockets,
    }
