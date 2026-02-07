import { useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { FlightData } from "../types/flight";
import { greatCirclePath, closestPointIndex } from "../utils/geo";

interface Props {
  flight: FlightData;
  progress: number;
}

// SVG plane icon points UP. `dir` is compass heading (0=N, 90=E).
function createPlaneIcon(heading: number) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
      <div class="plane-marker-ring" style="width:30px;height:30px;border-radius:50%;background:rgba(37,99,235,0.12);border:2px solid #2563eb;display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#2563eb" style="transform:rotate(${heading}deg);transform-origin:center;">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createAirportIcon(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="width:12px;height:12px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.15);"></div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;color:${color};text-shadow:0 0 4px white, 0 0 4px white, 0 0 4px white;letter-spacing:0.03em;">${label}</div>
    </div>`,
    iconSize: [44, 32],
    iconAnchor: [22, 6],
  });
}

function createProgressLabel(pct: number) {
  return L.divIcon({
    className: "",
    html: `<div class="progress-label">${Math.round(pct)}%</div>`,
    iconSize: [48, 22],
    iconAnchor: [24, 32],
  });
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
  }, [map, bounds]);
  return null;
}

export default function MapView({ flight, progress }: Props) {
  const depLat = flight.dep_airport?.lat;
  const depLng = flight.dep_airport?.lng;
  const arrLat = flight.arr_airport?.lat;
  const arrLng = flight.arr_airport?.lng;
  const planeLat = flight.lat;
  const planeLng = flight.lng;
  const hasRoute =
    depLat != null && depLng != null && arrLat != null && arrLng != null;
  const hasPlane = planeLat != null && planeLng != null;

  const fullPath = useMemo(() => {
    if (!hasRoute) return [];
    return greatCirclePath(depLat!, depLng!, arrLat!, arrLng!);
  }, [depLat, depLng, arrLat, arrLng, hasRoute]);

  const { traveled, remaining, snappedPos } = useMemo(() => {
    if (!hasRoute || !hasPlane || fullPath.length === 0) {
      return {
        traveled: [] as [number, number][],
        remaining: fullPath,
        snappedPos: null as [number, number] | null,
      };
    }
    const idx = closestPointIndex(fullPath, planeLat!, planeLng!);
    const snapped = fullPath[idx];
    return {
      traveled: fullPath.slice(0, idx + 1),
      remaining: fullPath.slice(idx),
      snappedPos: snapped,
    };
  }, [fullPath, planeLat, planeLng, hasRoute, hasPlane]);

  // Place the progress label at midpoint of traveled segment
  const labelPos = useMemo<[number, number] | null>(() => {
    if (!hasPlane || traveled.length < 3) return null;
    const mid = Math.floor(traveled.length / 2);
    return traveled[mid];
  }, [traveled, hasPlane]);

  const bounds = useMemo<L.LatLngBoundsExpression>(() => {
    const pts: [number, number][] = [];
    if (depLat != null && depLng != null) pts.push([depLat, depLng]);
    if (arrLat != null && arrLng != null) pts.push([arrLat, arrLng]);
    if (hasPlane) pts.push([planeLat!, planeLng!]);
    if (pts.length < 2)
      return [
        [-60, -170],
        [60, 170],
      ];
    return pts as L.LatLngBoundsExpression;
  }, [depLat, depLng, arrLat, arrLng, planeLat, planeLng, hasPlane]);

  const depIcon = useMemo(
    () => createAirportIcon("#059669", flight.dep_airport?.iata ?? "DEP"),
    [flight.dep_airport?.iata],
  );
  const arrIcon = useMemo(
    () => createAirportIcon("#dc2626", flight.arr_airport?.iata ?? "ARR"),
    [flight.arr_airport?.iata],
  );

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="w-full h-full"
      scrollWheelZoom
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitBounds bounds={bounds} />

      {/* Full route shadow */}
      {fullPath.length > 1 && (
        <Polyline
          positions={fullPath}
          pathOptions={{ color: "#cbd5e1", weight: 4, opacity: 0.5 }}
        />
      )}

      {/* Planned route (dashed blue) for scheduled flights */}
      {!hasPlane && fullPath.length > 1 && (
        <Polyline
          positions={fullPath}
          pathOptions={{
            color: "#2563eb",
            weight: 3,
            opacity: 0.35,
            dashArray: "12 8",
          }}
        />
      )}

      {/* Remaining (dashed) - only when airborne */}
      {hasPlane && remaining.length > 1 && (
        <Polyline
          positions={remaining}
          pathOptions={{
            color: "#94a3b8",
            weight: 3,
            opacity: 0.4,
            dashArray: "8 8",
          }}
        />
      )}

      {/* Traveled (solid blue) */}
      {traveled.length > 1 && (
        <Polyline
          positions={traveled}
          pathOptions={{ color: "#2563eb", weight: 3.5, opacity: 0.9 }}
        />
      )}

      {/* Progress label on the route — uses same value as header */}
      {hasPlane && labelPos && (
        <Marker
          position={labelPos}
          icon={createProgressLabel(progress)}
          interactive={false}
        />
      )}

      {depLat != null && depLng != null && (
        <Marker position={[depLat, depLng]} icon={depIcon}>
          <Popup>
            <strong>{flight.dep_airport?.iata}</strong>
            <br />
            {flight.dep_airport?.name}
          </Popup>
        </Marker>
      )}
      {arrLat != null && arrLng != null && (
        <Marker position={[arrLat, arrLng]} icon={arrIcon}>
          <Popup>
            <strong>{flight.arr_airport?.iata}</strong>
            <br />
            {flight.arr_airport?.name}
          </Popup>
        </Marker>
      )}

      {hasPlane && (
        <Marker
          position={snappedPos ?? [planeLat!, planeLng!]}
          icon={createPlaneIcon(flight.dir ?? 0)}
        >
          <Popup>
            <strong>{flight.flight_iata ?? flight.flight_icao}</strong>
            {flight.aircraft_icao && <> &middot; {flight.aircraft_icao}</>}
            <br />
            {flight.reg_number && (
              <>
                <span style={{ opacity: 0.6 }}>{flight.reg_number}</span>
                <br />
              </>
            )}
            Alt:{" "}
            {flight.alt != null
              ? `${Math.round(flight.alt).toLocaleString()} m`
              : "--"}
            <br />
            Speed:{" "}
            {flight.speed != null ? `${Math.round(flight.speed)} km/h` : "--"}
            <br />
            Heading: {flight.dir != null ? `${Math.round(flight.dir)}°` : "--"}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
