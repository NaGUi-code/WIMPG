import { MapContainer, TileLayer } from "react-leaflet";
import { useRef, useEffect } from "react";
import SearchBar from "./SearchBar";

interface Props {
  onSearch: (flightId: string) => void;
  isLoading: boolean;
  resetKey: number;
}

export default function LandingPage({ onSearch, isLoading, resetKey }: Props) {
  const arc1Ref = useRef<SVGPathElement>(null);
  const arc2Ref = useRef<SVGPathElement>(null);
  const arc3Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (arc1Ref.current) {
      const length = arc1Ref.current.getTotalLength();
      arc1Ref.current.style.setProperty("--arc-length", length.toString());
    }
    if (arc2Ref.current) {
      const length = arc2Ref.current.getTotalLength();
      arc2Ref.current.style.setProperty("--arc-length", length.toString());
    }
    if (arc3Ref.current) {
      const length = arc3Ref.current.getTotalLength();
      arc3Ref.current.style.setProperty("--arc-length", length.toString());
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Layer 1: Decorative Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
          className="h-full w-full"
          zoomSnap={0}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution=""
          />
        </MapContainer>
      </div>

      {/* Layer 2: Gradient Veil */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-sand-50/80 via-sand-50/40 to-sand-50/70" />

      {/* Layer 3: Animated SVG Arcs - Real Airport Routes */}
      <svg
        className="absolute inset-0 z-20 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Arc 1: CDG to LAX (Paris to Los Angeles) - Blue */}
        <path
          ref={arc1Ref}
          d="M 50.7 22.8 Q 34 16, 17.1 31.1"
          fill="none"
          stroke="#2563eb"
          strokeWidth="0.15"
          className="opacity-20"
          style={{
            strokeDasharray: "var(--arc-length)",
            strokeDashoffset: "var(--arc-length)",
            animation: "arc-draw 8s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        {/* Arc 2: JNB to SIN (Johannesburg to Singapore) - Green */}
        <path
          ref={arc2Ref}
          d="M 57.9 64.5 Q 68.4 54, 78.9 49.2"
          fill="none"
          stroke="#059669"
          strokeWidth="0.12"
          className="opacity-15"
          style={{
            strokeDasharray: "var(--arc-length)",
            strokeDashoffset: "var(--arc-length)",
            animation: "arc-draw 8s ease-in-out infinite",
            animationDelay: "2.5s",
          }}
        />
        {/* Arc 3: JFK to LHR (New York to London) - Red */}
        <path
          ref={arc3Ref}
          d="M 29.5 27.4 Q 39.7 14, 49.9 21.4"
          fill="none"
          stroke="#dc2626"
          strokeWidth="0.18"
          className="opacity-12"
          style={{
            strokeDasharray: "var(--arc-length)",
            strokeDashoffset: "var(--arc-length)",
            animation: "arc-draw 8s ease-in-out infinite",
            animationDelay: "4s",
          }}
        />
      </svg>

      {/* Layer 4: Hero Content */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Plane Icon - 100ms delay */}
          <div
            className="animate-landing-fade-in flex justify-center"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-route-done/10 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                className="text-route-done"
              >
                <path
                  d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          {/* Heading - 250ms delay */}
          <div
            className="animate-landing-fade-in"
            style={{ animationDelay: "250ms" }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-ink tracking-tight">
              Where Is My Plane Going to{" "}
              <span className="text-rotate">
                <span>
                  <span>JFK</span>
                  <span>LAX</span>
                  <span>LHR</span>
                  <span>NRT</span>
                  <span>CDG</span>
                  <span>DXB</span>
                </span>
              </span>
              ?
            </h1>
          </div>

          {/* Subtitle - 400ms delay */}
          <div
            className="animate-landing-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <p className="text-lg sm:text-xl text-sand-600 font-light">
              Track any flight in real-time with live position updates
            </p>
          </div>

          {/* Hero Search Bar - 550ms delay */}
          <div
            className="animate-landing-fade-in flex justify-center"
            style={{ animationDelay: "550ms" }}
          >
            <SearchBar
              onSearch={onSearch}
              isLoading={isLoading}
              resetKey={resetKey}
              variant="hero"
            />
          </div>

          {/* Example Hint - 700ms delay */}
          <div
            className="animate-landing-fade-in"
            style={{ animationDelay: "700ms" }}
          >
            <p className="text-sm text-sand-400 font-mono">
              Try: AA100, UAL900, DLH123
            </p>
          </div>
        </div>
      </div>

      {/* Layer 5: Ambient Floating Elements */}
      <div
        className="absolute top-20 left-10 z-20 animate-float opacity-20"
        style={{ animationDelay: "0s", animationDuration: "6s" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-route-done"
        >
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div
        className="absolute top-40 right-20 z-20 animate-float opacity-15"
        style={{ animationDelay: "1s", animationDuration: "7s" }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-dep"
        >
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>
      <div
        className="absolute bottom-32 left-1/4 z-20 animate-float opacity-10"
        style={{ animationDelay: "2s", animationDuration: "8s" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-arr"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}
