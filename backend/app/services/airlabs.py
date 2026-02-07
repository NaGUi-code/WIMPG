import asyncio
import json
import re
from pathlib import Path

import httpx
from cachetools import TTLCache

from app.config import settings

AIRLABS_BASE = "https://airlabs.co/api/v9"
FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "fixtures"

_flight_cache: TTLCache = TTLCache(maxsize=256, ttl=25)
_airport_cache: TTLCache = TTLCache(maxsize=1024, ttl=3600)

_client: httpx.AsyncClient | None = None

# IATA: 2-letter airline code + 1-4 digit flight number (e.g. UA123, AA1)
_IATA_RE = re.compile(r"^[A-Z\d]{2}\d{1,4}[A-Z]?$")
# ICAO: 3-letter airline code + 1-4 digit flight number (e.g. UAL123, BAW117)
_ICAO_RE = re.compile(r"^[A-Z]{3}\d{1,4}[A-Z]?$")

# --- Fixture index (built once at import if USE_FIXTURES) ---
_fixture_flights: dict[str, dict] = {}  # keyed by both iata and icao
_fixture_airports: dict[str, dict] = {}  # keyed by iata_code


def _load_fixtures() -> None:
    if not FIXTURES_DIR.is_dir():
        return
    for p in FIXTURES_DIR.glob("flight_*.json"):
        data = json.loads(p.read_text())
        if iata := data.get("flight_iata"):
            _fixture_flights[iata.upper()] = data
        if icao := data.get("flight_icao"):
            _fixture_flights[icao.upper()] = data
    for p in FIXTURES_DIR.glob("airport_*.json"):
        data = json.loads(p.read_text())
        if code := data.get("iata_code"):
            _fixture_airports[code.upper()] = data


if settings.USE_FIXTURES:
    _load_fixtures()


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=10.0)
    return _client


def classify_flight_code(code: str) -> list[tuple[str, str]]:
    """Return a prioritized list of (param_name, value) to try against AirLabs."""
    code = code.strip().upper()
    attempts: list[tuple[str, str]] = []

    if _ICAO_RE.match(code):
        attempts.append(("flight_icao", code))
    if _IATA_RE.match(code):
        attempts.append(("flight_iata", code))

    # If nothing matched (unusual format), try both anyway
    if not attempts:
        attempts.append(("flight_icao", code))
        attempts.append(("flight_iata", code))

    return attempts


# ---- Fixture-based implementations ----

async def _fixture_fetch_flight(code: str) -> dict | None:
    return _fixture_flights.get(code.upper())


async def _fixture_fetch_airport(iata: str) -> dict | None:
    if not iata:
        return None
    return _fixture_airports.get(iata.upper())


# ---- Live API implementations ----

async def _fetch_flight_by_param(param: str, value: str) -> dict | None:
    cache_key = f"flight:{param}:{value}"
    if cache_key in _flight_cache:
        return _flight_cache[cache_key]

    client = _get_client()
    resp = await client.get(
        f"{AIRLABS_BASE}/flight",
        params={"api_key": settings.AIRLABS_API_KEY, param: value},
    )
    resp.raise_for_status()
    data = resp.json().get("response")
    if not data:
        return None
    _flight_cache[cache_key] = data
    return data


async def _live_fetch_flight(code: str) -> dict | None:
    attempts = classify_flight_code(code)
    for param, value in attempts:
        result = await _fetch_flight_by_param(param, value)
        if result is not None:
            return result
    return None


async def _live_fetch_airport(iata: str) -> dict | None:
    if not iata:
        return None
    cache_key = f"airport:{iata}"
    if cache_key in _airport_cache:
        return _airport_cache[cache_key]

    client = _get_client()
    resp = await client.get(
        f"{AIRLABS_BASE}/airports",
        params={"api_key": settings.AIRLABS_API_KEY, "iata_code": iata},
    )
    resp.raise_for_status()
    items = resp.json().get("response", [])
    if not items:
        return None
    airport = items[0]
    _airport_cache[cache_key] = airport
    return airport


# ---- Dispatcher ----

async def fetch_flight(code: str) -> dict | None:
    if settings.USE_FIXTURES:
        return await _fixture_fetch_flight(code)
    return await _live_fetch_flight(code)


async def fetch_airport(iata: str) -> dict | None:
    if settings.USE_FIXTURES:
        return await _fixture_fetch_airport(iata)
    return await _live_fetch_airport(iata)


async def get_flight_with_airports(code: str) -> dict | None:
    flight = await fetch_flight(code)
    if flight is None:
        return None

    dep_iata = flight.get("dep_iata")
    arr_iata = flight.get("arr_iata")

    dep_info, arr_info = await asyncio.gather(
        fetch_airport(dep_iata),
        fetch_airport(arr_iata),
    )

    result = {
        "flight_iata": flight.get("flight_iata"),
        "flight_icao": flight.get("flight_icao"),
        "airline_name": flight.get("airline_name"),
        "airline_iata": flight.get("airline_iata"),
        "status": flight.get("status"),
        "lat": flight.get("lat"),
        "lng": flight.get("lng"),
        "alt": flight.get("alt"),
        "speed": flight.get("speed"),
        "dir": flight.get("dir"),
        "dep_time": flight.get("dep_time"),
        "dep_time_utc": flight.get("dep_time_utc"),
        "arr_time": flight.get("arr_time"),
        "arr_time_utc": flight.get("arr_time_utc"),
        "dep_actual": flight.get("dep_actual"),
        "arr_actual": flight.get("arr_actual"),
        "aircraft_icao": flight.get("aircraft_icao"),
        "reg_number": flight.get("reg_number"),
        "dep_terminal": flight.get("dep_terminal"),
        "dep_gate": flight.get("dep_gate"),
        "arr_terminal": flight.get("arr_terminal"),
        "arr_gate": flight.get("arr_gate"),
        "arr_baggage": flight.get("arr_baggage"),
        "duration": flight.get("duration"),
        "delayed": flight.get("delayed"),
        "eta": flight.get("eta"),
    }

    if dep_info:
        result["dep_airport"] = {
            "iata": dep_info.get("iata_code"),
            "name": dep_info.get("name"),
            "city": dep_info.get("city"),
            "lat": dep_info.get("lat"),
            "lng": dep_info.get("lng"),
        }

    if arr_info:
        result["arr_airport"] = {
            "iata": arr_info.get("iata_code"),
            "name": arr_info.get("name"),
            "city": arr_info.get("city"),
            "lat": arr_info.get("lat"),
            "lng": arr_info.get("lng"),
        }

    return result
