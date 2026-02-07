import { useState, useMemo, lazy, Suspense, useEffect, useRef } from "react";
import { useFlightData } from "./hooks/useFlightData";
import { greatCirclePath, closestPointIndex } from "./utils/geo";
import SearchBar from "./components/SearchBar";
import FlightInfoPanel from "./components/FlightInfoPanel";
import LandingPage from "./components/LandingPage";
import LoadingState from "./components/LoadingState";
import ToastContainer from "./components/Toast";
import { toast } from "./components/Toast";

const MapView = lazy(() => import("./components/MapView"));

function timeAgo(date: Date): string {
  const secs = Math.round((Date.now() - date.getTime()) / 1000);
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  return `${Math.floor(secs / 60)}m ago`;
}

export default function App() {
  const [flightId, setFlightId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const { data, isLoading, isFetching, error, dataUpdatedAt } =
    useFlightData(flightId);
  const [agoText, setAgoText] = useState("");
  const prevError = useRef<Error | null>(null);

  const isLanding = !flightId && !isLoading;

  useEffect(() => {
    if (!dataUpdatedAt) return;
    const update = () => setAgoText(timeAgo(new Date(dataUpdatedAt)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [dataUpdatedAt]);

  // On error: show toast, reset to home, clear search
  useEffect(() => {
    if (error && error !== prevError.current) {
      prevError.current = error;
      toast((error as Error).message || "Flight not found", "error");
      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setFlightId(null);
        setResetKey((k) => k + 1);
      }, 0);
    }
    if (!error) {
      prevError.current = null;
    }
  }, [error]);

  // Single progress calculation shared by header strip and map
  const progress = useMemo(() => {
    if (!data) return 0;
    const isAirborne = data.status === "en-route" || data.status === "active";
    if (!isAirborne) return data.status === "landed" ? 100 : 0;

    const depLat = data.dep_airport?.lat;
    const depLng = data.dep_airport?.lng;
    const arrLat = data.arr_airport?.lat;
    const arrLng = data.arr_airport?.lng;
    const planeLat = data.lat;
    const planeLng = data.lng;

    if (
      depLat == null ||
      depLng == null ||
      arrLat == null ||
      arrLng == null ||
      planeLat == null ||
      planeLng == null
    ) {
      return 50; // fallback if no geo data
    }

    const path = greatCirclePath(depLat, depLng, arrLat, arrLng);
    if (path.length < 2) return 50;
    const idx = closestPointIndex(path, planeLat, planeLng);
    return Math.max(1, Math.min(99, (idx / (path.length - 1)) * 100));
  }, [data]);

  return (
    <div className="h-screen flex flex-col bg-sand-50 overflow-hidden">
      {/* Header */}
      <header
        className={`shrink-0 z-20 ${isLanding ? "absolute top-0 left-0 right-0 bg-transparent" : "bg-white border-b border-sand-200"}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => {
              setFlightId(null);
              setResetKey((k) => k + 1);
            }}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-70 cursor-pointer active:opacity-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-route-done"
            >
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <span className="text-sm font-semibold text-ink tracking-tight">
              WIMPG
            </span>
            <span className="text-[10px] text-sand-400 font-mono hidden sm:inline ml-1">
              Where Is My Plane Going
            </span>
          </button>
          {!isLanding && (
            <SearchBar
              onSearch={setFlightId}
              isLoading={isLoading}
              resetKey={resetKey}
            />
          )}
        </div>
      </header>

      {/* Flight info strip */}
      {data && (
        <div className="shrink-0 z-10">
          <FlightInfoPanel
            flight={data}
            progress={progress}
            updatedText={agoText}
            isFetching={isFetching}
          />
        </div>
      )}

      {/* Main — map fills rest */}
      <div className="flex-1 relative min-h-0">
        {isLanding && (
          <LandingPage
            onSearch={setFlightId}
            isLoading={isLoading}
            resetKey={resetKey}
          />
        )}
        {flightId && isLoading && <LoadingState />}
        {data && (
          <Suspense fallback={<LoadingState />}>
            <div className="absolute inset-0">
              <MapView flight={data} progress={progress} />
            </div>
          </Suspense>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
