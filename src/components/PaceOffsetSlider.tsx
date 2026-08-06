interface PaceOffsetSliderProps {
  value: number;
  onChange: (value: number) => void;
  /** "s/km" or "s/mile" — the unit the offset is expressed in */
  offsetUnit: string;
  /** The pace as entered, e.g. "5:00" */
  basePace: string;
  /** The pace once the offset is applied, e.g. "5:05" */
  adjustedPace: string;
  /** "min/km" or "min/mile" */
  paceUnit: string;
  range?: number;
  step?: number;
}

export default function PaceOffsetSlider({
  value,
  onChange,
  offsetUnit,
  basePace,
  adjustedPace,
  paceUnit,
  range = 30,
  step = 5,
}: PaceOffsetSliderProps) {
  const clamp = (v: number) => Math.max(-range, Math.min(range, v));
  const signed = value > 0 ? `+${value}` : String(value);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">What if I run faster or slower?</span>
        {value !== 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= -range}
          aria-label={`${step} seconds faster`}
          className="w-9 shrink-0 rounded border border-gray-300 bg-white py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          &minus;
        </button>
        <input
          type="range"
          min={-range}
          max={range}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          aria-label={`Pace adjustment in ${offsetUnit}`}
          className="min-w-0 flex-1 accent-blue-500"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= range}
          aria-label={`${step} seconds slower`}
          className="w-9 shrink-0 rounded border border-gray-300 bg-white py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          +
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        {value === 0 ? (
          <>
            At your pace, <span className="font-semibold">{basePace} {paceUnit}</span>
          </>
        ) : (
          <>
            <span className="font-semibold">{signed} {offsetUnit}</span>
            {" → "}
            <span className="font-semibold">{adjustedPace} {paceUnit}</span>
            <span className="text-gray-400"> (from {basePace})</span>
          </>
        )}
      </p>
    </div>
  );
}
