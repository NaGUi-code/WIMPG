from pydantic import BaseModel


class AirportInfo(BaseModel):
    iata: str | None = None
    name: str | None = None
    city: str | None = None
    lat: float | None = None
    lng: float | None = None


class FlightResponse(BaseModel):
    flight_iata: str | None = None
    flight_icao: str | None = None
    airline_name: str | None = None
    airline_iata: str | None = None
    status: str | None = None
    lat: float | None = None
    lng: float | None = None
    alt: float | None = None
    speed: float | None = None
    dir: float | None = None
    dep_time: str | None = None
    dep_time_utc: str | None = None
    arr_time: str | None = None
    arr_time_utc: str | None = None
    dep_actual: str | None = None
    arr_actual: str | None = None
    aircraft_icao: str | None = None
    reg_number: str | None = None
    dep_terminal: str | None = None
    dep_gate: str | None = None
    arr_terminal: str | None = None
    arr_gate: str | None = None
    arr_baggage: str | None = None
    duration: int | None = None
    delayed: int | None = None
    eta: int | None = None
    dep_airport: AirportInfo | None = None
    arr_airport: AirportInfo | None = None
