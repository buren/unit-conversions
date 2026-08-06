import type { PaceUnit } from "../lib/pace";

const RANGE = 30;
/** Both the stepper buttons and the slider move in these increments, matching the pace ladder. */
const STEP = 5;

interface PaceOffsetSliderProps {
  value: number;
  onChange: (value: number) => void;
  /** The pace as entered, e.g. "5:00" */
  basePace: string;
  /** The pace once the offset is applied, e.g. "5:05" */
  adjustedPace: string;
  paceUnit: PaceUnit;
}

export default function PaceOffsetSlider({
  value,
  onChange,
  basePace,
  adjustedPace,
  paceUnit,
}: PaceOffsetSliderProps) {
  const offsetUnit = paceUnit === "min/mile" ? "s/mile" : "s/km";
  const clamp = (v: number) => Math.max(-RANGE, Math.min(RANGE, v));
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
          onClick={() => onChange(clamp(value - STEP))}
          disabled={value <= -RANGE}
          aria-label={`${STEP} seconds faster`}
          className="w-9 shrink-0 rounded border border-gray-300 bg-white py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          &minus;
        </button>
        <input
          type="range"
          min={-RANGE}
          max={RANGE}
          step={STEP}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          aria-label={`Pace adjustment in ${offsetUnit}`}
          className="min-w-0 flex-1 accent-blue-500"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + STEP))}
          disabled={value >= RANGE}
          aria-label={`${STEP} seconds slower`}
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
