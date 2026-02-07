import type { FlightData } from '../types/flight';

export async function fetchFlight(flightIata: string): Promise<FlightData> {
  const res = await fetch(`/api/flight/${encodeURIComponent(flightIata)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}
