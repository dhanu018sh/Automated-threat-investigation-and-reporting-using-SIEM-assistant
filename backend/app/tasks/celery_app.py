from celery import Celery
import os

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("siem_tasks", broker=redis_url, backend=redis_url)

@celery_app.task
def run_playbook_task(investigation_id: int, playbook_name: str):
    # Stub task
    return f"Playbook {playbook_name} completed for investigation {investigation_id}"

@celery_app.task
def enrich_indicator_task(type_: str, value: str):
    return f"Enrichment completed for {type_}:{value}"

@celery_app.task
def generate_report_task(investigation_id: int, format: str):
    return f"Report generated in {format} format for investigation {investigation_id}"
