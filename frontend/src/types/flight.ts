export interface AirportInfo {
  iata: string | null;
  name: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
}

export interface FlightData {
  flight_iata: string | null;
  flight_icao: string | null;
  airline_name: string | null;
  airline_iata: string | null;
  status: string | null;
  lat: number | null;
  lng: number | null;
  alt: number | null;
  speed: number | null;
  dir: number | null;
  dep_time: string | null;
  dep_time_utc: string | null;
  arr_time: string | null;
  arr_time_utc: string | null;
  dep_actual: string | null;
  arr_actual: string | null;
  aircraft_icao: string | null;
  reg_number: string | null;
  dep_terminal: string | null;
  dep_gate: string | null;
  arr_terminal: string | null;
  arr_gate: string | null;
  arr_baggage: string | null;
  duration: number | null;
  delayed: number | null;
  eta: number | null;
  dep_airport: AirportInfo | null;
  arr_airport: AirportInfo | null;
}
