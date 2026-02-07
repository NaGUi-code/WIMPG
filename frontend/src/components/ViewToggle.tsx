export type ViewMode = 'globe' | 'map' | 'both';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const options: { value: ViewMode; label: string }[] = [
  { value: 'globe', label: 'Globe' },
  { value: 'map', label: 'Map' },
  { value: 'both', label: 'Both' },
];

export default function ViewToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            mode === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
