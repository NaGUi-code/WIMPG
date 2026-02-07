import { useQuery } from '@tanstack/react-query';
import { fetchFlight } from '../api/flights';
import type { FlightData } from '../types/flight';

export function useFlightData(flightIata: string | null) {
  return useQuery<FlightData, Error>({
    queryKey: ['flight', flightIata],
    queryFn: () => fetchFlight(flightIata!),
    enabled: !!flightIata,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'landed') return false;
      return 30_000;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    staleTime: 20_000,
  });
}
