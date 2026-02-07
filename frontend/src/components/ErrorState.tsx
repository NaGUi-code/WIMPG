interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-5 text-center max-w-md">
        <p className="text-red-700 font-medium text-sm mb-1">Flight not found</p>
        <p className="text-red-500 text-xs mb-4 font-mono">{message}</p>
        <button
          onClick={onRetry}
          className="rounded-lg bg-white border border-red-200 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
