export default function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-8 h-8 border-2 border-sand-200 border-t-route-done rounded-full animate-spin" />
      <p className="text-sand-400 text-sm font-mono tracking-wider">Locating flight...</p>
    </div>
  );
}
