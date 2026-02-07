import type { FlightData } from "../types/flight";

interface Props {
  flight: FlightData;
  progress: number;
  updatedText: string;
  isFetching: boolean;
}

function statusStyle(status: string | null): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case "en-route":
    case "active":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      };
    case "landed":
      return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" };
    case "cancelled":
      return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
    default:
      return { bg: "bg-sand-100", text: "text-sand-600", dot: "bg-sand-400" };
  }
}

function formatTime(time: string | null): string {
  if (!time) return "--:--";
  try {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return time;
  }
}

function formatDuration(mins: number | null): string {
  if (mins == null) return "--";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function gateLabel(
  terminal: string | null,
  gate: string | null,
): string | null {
  if (!terminal && !gate) return null;
  const parts: string[] = [];
  if (terminal) parts.push(`T${terminal}`);
  if (gate) parts.push(`G${gate}`);
  return parts.join("/");
}

export default function FlightInfoPanel({
  flight,
  progress,
  updatedText,
  isFetching,
}: Props) {
  const sc = statusStyle(flight.status);
  const isAirborne = flight.status === "en-route" || flight.status === "active";
  const depGate = gateLabel(flight.dep_terminal, flight.dep_gate);
  const arrGate = gateLabel(flight.arr_terminal, flight.arr_gate);
  const hasDetails =
    flight.aircraft_icao ||
    flight.reg_number ||
    flight.duration != null ||
    depGate ||
    arrGate ||
    flight.arr_baggage;

  return (
    <div className="animate-slide-up bg-white/90 backdrop-blur-sm border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Flight ID + Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-ink tracking-tight">
                {flight.flight_iata ?? flight.flight_icao ?? "---"}
              </span>
              {flight.airline_name && (
                <span className="text-xs text-sand-500 hidden sm:inline">
                  {flight.airline_name}
                </span>
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${sc.bg} ${sc.text}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${isAirborne ? "live-dot" : ""}`}
              />
              {flight.status ?? "unknown"}
            </span>
            {flight.delayed != null && flight.delayed > 0 && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700">
                +{flight.delayed}m late
              </span>
            )}
          </div>

          {/* Route progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-right shrink-0 w-16">
                <p className="text-sm font-semibold text-dep font-mono">
                  {flight.dep_airport?.iata ?? "---"}
                </p>
                <p className="text-[10px] text-sand-400">
                  {formatTime(flight.dep_actual ?? flight.dep_time)}
                </p>
              </div>

              {/* Progress track */}
              <div className="flex-1 relative h-8 flex items-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-sand-200 rounded-full" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] bg-route-done rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
                {isAirborne && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full progress-shimmer" />
                )}

                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-dep border-2 border-white shadow-sm" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-arr border-2 border-white shadow-sm" />

                {isAirborne && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out flex flex-col items-center"
                    style={{ left: `${progress}%` }}
                  >
                    <div className="text-[10px] font-mono font-medium text-route-done -mt-5 mb-0.5 bg-white/80 px-1 rounded">
                      {Math.round(progress)}%
                    </div>
                    <div className="w-5 h-5 rounded-full bg-route-done/10 border-2 border-route-done flex items-center justify-center plane-marker-ring">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-route-done"
                      >
                        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 w-16">
                <p className="text-sm font-semibold text-arr font-mono">
                  {flight.arr_airport?.iata ?? "---"}
                </p>
                <p className="text-[10px] text-sand-400">
                  {formatTime(flight.arr_actual ?? flight.arr_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry */}
          <div
            className={`flex items-center gap-4 shrink-0 ${!isAirborne && flight.status !== "landed" ? "opacity-40" : ""}`}
          >
            <Readout
              label="ALT"
              value={
                flight.alt != null
                  ? `${Math.round(flight.alt).toLocaleString()}`
                  : "--"
              }
              unit="m"
            />
            <Readout
              label="SPD"
              value={
                flight.speed != null ? `${Math.round(flight.speed)}` : "--"
              }
              unit="km/h"
            />
            <Readout
              label="HDG"
              value={flight.dir != null ? `${Math.round(flight.dir)}` : "--"}
              unit="°"
            />
            {isAirborne && flight.eta != null && (
              <Readout label="ETA" value={formatDuration(flight.eta)} unit="" />
            )}
          </div>

          {/* Live indicator */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0 border-l border-sand-200 pl-4">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isFetching ? "bg-amber-400 animate-pulse" : "bg-emerald-500 live-dot"}`}
            />
            <span className="text-[10px] text-sand-400 font-mono">
              {updatedText}
            </span>
          </div>
        </div>

        {/* Aircraft & gate details row */}
        {hasDetails && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 pt-2 border-t border-sand-100">
            {flight.aircraft_icao && (
              <Detail label="Aircraft" value={flight.aircraft_icao} />
            )}
            {flight.reg_number && (
              <Detail label="Reg" value={flight.reg_number} />
            )}
            {flight.duration != null && (
              <Detail
                label="Duration"
                value={formatDuration(flight.duration)}
              />
            )}
            {depGate && <Detail label="Dep Gate" value={depGate} />}
            {arrGate && <Detail label="Arr Gate" value={arrGate} />}
            {flight.arr_baggage && (
              <Detail label="Baggage" value={flight.arr_baggage} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="text-center min-w-[50px]">
      <p className="text-[10px] text-sand-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xs font-mono text-ink">
        {value}
        {unit && (
          <span className="text-sand-400 text-[10px] ml-0.5">{unit}</span>
        )}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-sand-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs font-mono text-sand-700">{value}</span>
    </div>
  );
}
