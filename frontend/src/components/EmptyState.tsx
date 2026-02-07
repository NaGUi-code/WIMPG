export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-sand-300 mb-5">
        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
      <p className="text-sand-500 text-sm font-light">Enter a flight number to begin tracking</p>
      <p className="text-sand-400 text-xs mt-2 font-mono tracking-wider">IATA: UA123 &middot; ICAO: UAL123 &middot; BAW117</p>
    </div>
  );
}
