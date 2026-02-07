import { useState, useEffect, type FormEvent } from "react";

interface Props {
  onSearch: (flightId: string) => void;
  isLoading: boolean;
  resetKey: number;
  variant?: "header" | "hero";
}

export default function SearchBar({
  onSearch,
  isLoading,
  resetKey,
  variant = "header",
}: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
  }, [resetKey]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed) onSearch(trimmed);
  };

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <div
        className={`relative flex items-center ${isHero ? "shadow-lg" : ""}`}
      >
        <div
          className={`absolute ${isHero ? "left-4" : "left-3"} text-sand-400`}
        >
          <svg
            width={isHero ? 16 : 14}
            height={isHero ? 16 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="UA123 / UAL123"
          maxLength={10}
          className={`${isHero ? "w-72 sm:w-96 rounded-l-xl pl-11 pr-4 py-3 text-base" : "w-36 sm:w-44 rounded-l-lg pl-9 pr-3 py-1.5 text-sm"} border border-sand-200 bg-sand-50 ${isHero ? "backdrop-blur-sm" : ""} font-mono text-ink placeholder-sand-400 focus:border-route-done focus:outline-none focus:ring-1 focus:ring-route-done/30 transition-colors tracking-wider`}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={`${isHero ? "rounded-r-xl px-6 py-3 text-base bg-route-done text-white hover:bg-blue-700" : "rounded-r-lg px-3.5 py-1.5 text-sm bg-white text-sand-600 hover:bg-route-done hover:text-white"} border border-l-0 border-sand-200 ${isHero ? "border-route-done" : "hover:border-route-done"} font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all tracking-wide`}
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-sand-300 border-t-route-done rounded-full animate-spin" />
          ) : (
            "Track"
          )}
        </button>
      </div>
    </form>
  );
}
