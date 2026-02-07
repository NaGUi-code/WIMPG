import { useEffect, useRef, useCallback, useMemo } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import type { FlightData } from "../types/flight";
import { greatCirclePath, closestPointIndex } from "../utils/geo";

interface Props {
  flight: FlightData;
}

interface ArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  dashGap: number;
  dashLength: number;
  stroke: number;
}

interface PointDatum {
  lat: number;
  lng: number;
  color: string;
  size: number;
  label: string;
}

export default function GlobeView({ flight }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const depLat = flight.dep_airport?.lat;
  const depLng = flight.dep_airport?.lng;
  const arrLat = flight.arr_airport?.lat;
  const arrLng = flight.arr_airport?.lng;
  const planeLat = flight.lat;
  const planeLng = flight.lng;
  const hasRoute =
    depLat != null && depLng != null && arrLat != null && arrLng != null;
  const hasPlane = planeLat != null && planeLng != null;

  const arcsData = useMemo<ArcDatum[]>(() => {
    if (!hasRoute) return [];
    if (hasPlane) {
      const path = greatCirclePath(depLat!, depLng!, arrLat!, arrLng!);
      const idx = closestPointIndex(path, planeLat!, planeLng!);
      const midPoint = path[idx];
      return [
        {
          startLat: depLat!,
          startLng: depLng!,
          endLat: midPoint[0],
          endLng: midPoint[1],
          color: "rgba(59, 130, 246, 0.9)",
          dashGap: 0,
          dashLength: 1,
          stroke: 1.5,
        },
        {
          startLat: midPoint[0],
          startLng: midPoint[1],
          endLat: arrLat!,
          endLng: arrLng!,
          color: "rgba(147, 197, 253, 0.8)",
          dashGap: 0.5,
          dashLength: 0.5,
          stroke: 1.2,
        },
      ];
    }
    return [
      {
        startLat: depLat!,
        startLng: depLng!,
        endLat: arrLat!,
        endLng: arrLng!,
        color: "rgba(147, 197, 253, 0.8)",
        dashGap: 0.5,
        dashLength: 0.5,
        stroke: 1.2,
      },
    ];
  }, [depLat, depLng, arrLat, arrLng, planeLat, planeLng, hasRoute, hasPlane]);

  const pointsData = useMemo<PointDatum[]>(() => {
    const pts: PointDatum[] = [];
    if (depLat != null && depLng != null) {
      pts.push({
        lat: depLat,
        lng: depLng,
        color: "#22c55e",
        size: 0.5,
        label: flight.dep_airport?.iata ?? "",
      });
    }
    if (arrLat != null && arrLng != null) {
      pts.push({
        lat: arrLat,
        lng: arrLng,
        color: "#ef4444",
        size: 0.5,
        label: flight.arr_airport?.iata ?? "",
      });
    }
    if (hasPlane) {
      pts.push({
        lat: planeLat!,
        lng: planeLng!,
        color: "#f59e0b",
        size: 0.7,
        label: "✈",
      });
    }
    return pts;
  }, [
    depLat,
    depLng,
    arrLat,
    arrLng,
    planeLat,
    planeLng,
    flight.dep_airport?.iata,
    flight.arr_airport?.iata,
    hasPlane,
  ]);

  // Auto-rotate to plane or route center
  useEffect(() => {
    if (!globeRef.current) return;
    if (hasPlane) {
      globeRef.current.pointOfView(
        { lat: planeLat!, lng: planeLng!, altitude: 2.2 },
        1000,
      );
    } else if (hasRoute) {
      globeRef.current.pointOfView(
        {
          lat: (depLat! + arrLat!) / 2,
          lng: (depLng! + arrLng!) / 2,
          altitude: 2.5,
        },
        1000,
      );
    }
  }, [planeLat, planeLng, depLat, depLng, arrLat, arrLng, hasPlane, hasRoute]);

  // ResizeObserver
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      sizeRef.current = {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      };
    }
  }, []);

  useEffect(() => {
    updateSize();
    if (!containerRef.current) return;
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateSize]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px]">
      <Globe
        ref={globeRef}
        width={containerRef.current?.clientWidth ?? 600}
        height={containerRef.current?.clientHeight ?? 400}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="lightblue"
        atmosphereAltitude={0.15}
        arcsData={arcsData}
        arcStartLat={(d: ArcDatum) => d.startLat}
        arcStartLng={(d: ArcDatum) => d.startLng}
        arcEndLat={(d: ArcDatum) => d.endLat}
        arcEndLng={(d: ArcDatum) => d.endLng}
        arcColor={(d: ArcDatum) => d.color}
        arcDashGap={(d: ArcDatum) => d.dashGap}
        arcDashLength={(d: ArcDatum) => d.dashLength}
        arcStroke={(d: ArcDatum) => d.stroke}
        pointsData={pointsData}
        pointLat={(d: PointDatum) => d.lat}
        pointLng={(d: PointDatum) => d.lng}
        pointColor={(d: PointDatum) => d.color}
        pointRadius={(d: PointDatum) => d.size}
        pointAltitude={0.01}
        labelsData={pointsData}
        labelLat={(d: PointDatum) => d.lat}
        labelLng={(d: PointDatum) => d.lng}
        labelText={(d: PointDatum) => d.label}
        labelSize={1.2}
        labelColor={() => "rgba(0, 0, 0, 0.8)"}
        labelDotRadius={0}
        labelAltitude={0.02}
      />
    </div>
  );
}
