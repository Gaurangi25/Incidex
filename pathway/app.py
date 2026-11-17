
"""
Incident Intelligence - Real Pathway RAG Pipeline
==================================================
Run in WSL2 Ubuntu:

    source ~/pathway-env/bin/activate
    cd /mnt/c/Users/shubh/Downloads/shubh/pathway
    python app.py
"""

import os
import re
import json
import time
import logging
import threading
import requests
import hashlib
import asyncio

from typing import List, Dict, Any, Optional
from warnings import warn

import pathway as pw
from pathway.xpacks.llm.question_answering import SummaryQuestionAnswerer
from pathway.xpacks.llm.servers import QASummaryRestServer
from pydantic import BaseModel, ConfigDict, InstanceOf
from dotenv import load_dotenv
from aiohttp import web


# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")

if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv(
        dotenv_path="/mnt/c/Users/shubh/Downloads/shubh/.env"
    )

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

POLLING_INTERVAL = int(
    os.environ.get("PATHWAY_POLL_INTERVAL", "5")
)

CACHE_DIR = os.path.expanduser("~/pathway-cache")

INCIDENTS_PORT = 8082
RAG_PORT = 8081

pw.set_license_key("demo-license-key-with-telemetry")


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

cached_incidents: List[Dict[str, Any]] = []


# ============================================================
# SUPABASE FETCH
# ============================================================

def fetch_incidents_from_supabase() -> Optional[List[Dict[str, Any]]]:
    """
    Fetch incidents from Supabase.

    Returns:
        List of incidents on success.
        None if fetching fails.
    """

    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase credentials not configured")
        return None

    try:
        url = f"{SUPABASE_URL}/rest/v1/incidents"

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
        }

        params = {
            "select": "*",
            "order": "created_at.desc",
            "limit": "1000",
            "deleted_at": "is.null",
        }

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=10,
        )

        response.raise_for_status()

        incidents = response.json()

        logger.info(
            f"Fetched {len(incidents)} incidents from Supabase"
        )

        return incidents

    except Exception as e:
        logger.error(f"Error fetching from Supabase: {e}")
        return None


# ============================================================
# INCIDENT FORMATTING
# ============================================================

def format_incident_as_text(
    incident: Dict[str, Any]
) -> str:

    incident_id = incident.get(
        "incident_id",
        incident.get("id", "unknown"),
    )

    return f"""Incident ID: {incident_id}
Title: {incident.get('title', 'N/A')}
Status: {incident.get('status', 'N/A')}
Severity: {incident.get('severity', 'N/A')}
Location: {incident.get('location', 'N/A')}
Description: {incident.get('description', 'N/A')}
Timestamp: {incident.get('timestamp', 'N/A')}
---"""


# ============================================================
# WRITE INCIDENTS TO CACHE
# ============================================================

def write_incidents_to_files(
    cache_dir: str,
    incidents: List[Dict[str, Any]],
):
    """
    Write every incident to an individual text file.

    Legacy IDs are included for now.
    """

    os.makedirs(cache_dir, exist_ok=True)

    # Remove old text files before writing fresh data.
    for filename in os.listdir(cache_dir):
        if filename.endswith(".txt"):
            filepath = os.path.join(cache_dir, filename)

            if os.path.isfile(filepath):
                os.remove(filepath)

    # Handle empty incident list.
    if not incidents:
        placeholder = os.path.join(
            cache_dir,
            "placeholder.txt",
        )

        with open(
            placeholder,
            "w",
            encoding="utf-8",
        ) as f:
            f.write("No incidents loaded yet.")

        logger.info("No incidents available. Placeholder created.")
        return

    canonical_pattern = re.compile(
        r"^INC-\d{8}-\d{6}$"
    )

    legacy_pattern = re.compile(
        r"^INC-\d+$"
    )

    written_count = 0
    legacy_count = 0

    for incident in incidents:

        inc_id = str(
            incident.get(
                "incident_id",
                incident.get("id", "unknown"),
            )
        )

        # Keep legacy incidents in RAG for now.
        if (
            legacy_pattern.match(inc_id)
            and not canonical_pattern.match(inc_id)
        ):
            logger.warning(
                f"Legacy ID detected: {inc_id} - "
                "Including in RAG for now"
            )
            legacy_count += 1

        # Sanitize filename.
        safe_id = re.sub(
            r"[^a-zA-Z0-9_-]",
            "_",
            inc_id,
        )

        filepath = os.path.join(
            cache_dir,
            f"{safe_id}.txt",
        )

        with open(
            filepath,
            "w",
            encoding="utf-8",
        ) as f:
            f.write(format_incident_as_text(incident))

        written_count += 1

    logger.info(
        f"Wrote {written_count} incident files to {cache_dir}"
    )

    if legacy_count:
        logger.warning(
            f"{legacy_count} legacy incident IDs included in RAG"
        )


# ============================================================
# SUPABASE BACKGROUND POLLER
# ============================================================

def get_incidents_hash(
    incidents: List[Dict[str, Any]]
) -> str:

    serialized = json.dumps(
        incidents,
        sort_keys=True,
        default=str,
    )

    return hashlib.sha256(
        serialized.encode("utf-8")
    ).hexdigest()


def start_supabase_poller(
    cache_dir: str,
    initial_incidents: List[Dict[str, Any]],
):
    """
    Poll Supabase periodically and update the cache
    whenever incident data changes.
    """

    global cached_incidents

    last_hash = get_incidents_hash(initial_incidents)

    def poll_loop():

        nonlocal last_hash
        global cached_incidents

        while True:

            try:
                incidents = fetch_incidents_from_supabase()

                # Do not overwrite existing data on API failure.
                if incidents is None:
                    time.sleep(POLLING_INTERVAL)
                    continue

                current_hash = get_incidents_hash(incidents)

                if current_hash != last_hash:

                    logger.info(
                        "Incident data changed. Updating cache..."
                    )

                    cached_incidents = incidents

                    write_incidents_to_files(
                        cache_dir,
                        incidents,
                    )

                    last_hash = current_hash

            except Exception as e:
                logger.error(f"Polling error: {e}")

            time.sleep(POLLING_INTERVAL)

    thread = threading.Thread(
        target=poll_loop,
        daemon=True,
    )

    thread.start()

    logger.info(
        f"Started Supabase polling "
        f"(interval: {POLLING_INTERVAL}s)"
    )


# ============================================================
# PATHWAY RAG APPLICATION
# ============================================================

class App(BaseModel):

    question_answerer: InstanceOf[
        SummaryQuestionAnswerer
    ]

    host: str = "0.0.0.0"
    port: int = RAG_PORT

    with_cache: bool | None = None

    persistence_backend: pw.persistence.Backend | None = None

    persistence_mode: pw.PersistenceMode | None = (
        pw.PersistenceMode.UDF_CACHING
    )

    terminate_on_error: bool = False

    model_config = ConfigDict(
        extra="forbid",
        arbitrary_types_allowed=True,
    )

    def run(self):

        server = QASummaryRestServer(
            self.host,
            self.port,
            self.question_answerer,
        )

        if self.persistence_mode is None:

            if self.with_cache is True:
                warn(
                    "`with_cache` is deprecated.",
                    DeprecationWarning,
                )

                persistence_mode = (
                    pw.PersistenceMode.UDF_CACHING
                )

            else:
                persistence_mode = None

        else:
            persistence_mode = self.persistence_mode

        if persistence_mode is not None:

            if self.persistence_backend is None:

                persistence_backend = (
                    pw.persistence.Backend.filesystem(
                        "./Cache"
                    )
                )

            else:
                persistence_backend = self.persistence_backend

            persistence_config = pw.persistence.Config(
                persistence_backend,
                persistence_mode=persistence_mode,
            )

        else:
            persistence_config = None

        logger.info(
            f"Starting Pathway RAG Server "
            f"on {self.host}:{self.port}"
        )

        logger.info(
            f"RAG Endpoint: "
            f"http://localhost:{self.port}/v2/answer"
        )

        pw.run(
            persistence_config=persistence_config,
            terminate_on_error=self.terminate_on_error,
            monitoring_level=pw.MonitoringLevel.NONE,
        )


# ============================================================
# INCIDENTS REST API
# ============================================================

async def handle_incidents(request):

    return web.json_response(cached_incidents)


async def handle_health(request):

    return web.json_response({
        "status": "ok",
        "incidents_count": len(cached_incidents),
    })


def start_incidents_api():

    def run_server():

        app = web.Application()

        app.router.add_get(
            "/incidents",
            handle_incidents,
        )

        app.router.add_get(
            "/health",
            handle_health,
        )

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        runner = web.AppRunner(app)

        loop.run_until_complete(
            runner.setup()
        )

        site = web.TCPSite(
            runner,
            "0.0.0.0",
            INCIDENTS_PORT,
        )

        loop.run_until_complete(
            site.start()
        )

        logger.info(
            f"Incidents API running at "
            f"http://localhost:{INCIDENTS_PORT}/incidents"
        )

        loop.run_forever()

    thread = threading.Thread(
        target=run_server,
        daemon=True,
    )

    thread.start()


# ============================================================
# MAIN
# ============================================================

def main():

    global cached_incidents

    print("=" * 60)
    print("Incident Intelligence - REAL Pathway RAG Pipeline")
    print("=" * 60)

    print(f"Pathway Version: {pw.__version__}")

    print(
        f"Supabase: {SUPABASE_URL[:40]}..."
        if SUPABASE_URL
        else "Supabase: Not configured"
    )

    print(f"Cache Directory: {CACHE_DIR}")

    print("=" * 60)

    # Initial fetch.
    incidents = fetch_incidents_from_supabase()

    if incidents is None:
        logger.error(
            "Initial Supabase fetch failed. "
            "Check your .env configuration."
        )
        incidents = []

    cached_incidents = incidents

    # Write initial data to cache.
    write_incidents_to_files(
        CACHE_DIR,
        incidents,
    )

    # Start background polling.
    start_supabase_poller(
        CACHE_DIR,
        incidents,
    )

    # Start incidents REST API.
    start_incidents_api()

    # Load Pathway YAML configuration.
    yaml_path = os.path.join(
        os.path.dirname(__file__),
        "app.yaml",
    )

    try:

        with open(
            yaml_path,
            encoding="utf-8",
        ) as f:

            config = pw.load_yaml(f)

        app = App(**config)

        app.run()

    except KeyboardInterrupt:

        print("\nShutting down...")

    except Exception as e:

        logger.exception(
            f"Pipeline error: {e}"
        )

        raise


if __name__ == "__main__":
    main()
