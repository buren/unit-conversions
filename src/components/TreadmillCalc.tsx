import { useState, useEffect } from "react";
import {
  type WorkoutStep,
  createStep,
  calcStepElevation,
  calcTotalElevation,
  serializeSteps,
} from "../lib/treadmill";
import { kmhToPace } from "../lib/pace";
import { formatPace } from "../lib/time";

interface TreadmillCalcProps {
  initialSteps?: WorkoutStep[];
  onStateChange?: (state: { ts: string }) => void;
}

export default function TreadmillCalc({ initialSteps, onStateChange }: TreadmillCalcProps) {
  const [steps, setSteps] = useState<WorkoutStep[]>(
    initialSteps && initialSteps.length > 0 ? initialSteps : [createStep()],
  );

  useEffect(() => {
    onStateChange?.({ ts: serializeSteps(steps) });
  }, [steps]);

  function updateStep(id: number, patch: Partial<WorkoutStep>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeStep(id: number) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function addStep() {
    setSteps((prev) => [...prev, createStep()]);
  }

  const totals = calcTotalElevation(steps);
  const hasInput = steps.some(
    (s) =>
      (s.mode === "duration" ? s.durationMin > 0 && s.speedKmh > 0 : s.distanceKm > 0) &&
      s.incline > 0,
  );

  return (
    <section>
      <div className="space-y-4">
        {steps.map((step, i) => {
          const result = calcStepElevation(step);
          const stepHasInput =
            (step.mode === "duration"
              ? step.durationMin > 0 && step.speedKmh > 0
              : step.distanceKm > 0) && step.incline > 0;

          return (
            <div key={step.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Step {i + 1}</span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Mode toggle */}
              <div className="inline-flex rounded-lg border border-gray-300 mb-3 divide-x divide-gray-300">
                {(["duration", "distance"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateStep(step.id, { mode: m })}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                      step.mode === m
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {m === "duration" ? "Duration" : "Distance"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {step.mode === "duration" ? (
                  <>
                    <Field
                      label="Duration (min)"
                      value={step.durationMin}
                      onChange={(v) => updateStep(step.id, { durationMin: v })}
                      inputMode="numeric"
                    />
                    <Field
                      label={
                        step.speedKmh > 0
                          ? `Speed (km/h) · ${formatPace(kmhToPace(step.speedKmh).minutes, kmhToPace(step.speedKmh).seconds)} /km`
                          : "Speed (km/h)"
                      }
                      value={step.speedKmh}
                      onChange={(v) => updateStep(step.id, { speedKmh: v })}
                      step={0.1}
                      inputMode="decimal"
                    />
                  </>
                ) : (
                  <Field
                    label="Distance (km)"
                    value={step.distanceKm}
                    onChange={(v) => updateStep(step.id, { distanceKm: v })}
                    step={0.1}
                    inputMode="decimal"
                  />
                )}
                <Field
                  label="Incline (%)"
                  value={step.incline}
                  onChange={(v) => updateStep(step.id, { incline: v })}
                  step={0.5}
                  inputMode="decimal"
                />
                <Field
                  label="Reps"
                  value={step.reps}
                  onChange={(v) => updateStep(step.id, { reps: Math.max(1, Math.round(v)) })}
                  min={1}
                  inputMode="numeric"
                />
              </div>

              {stepHasInput && (
                <p className="mt-2 text-sm text-gray-500">
                  {result.distanceKm.toFixed(2)} km &middot;{" "}
                  <span className="font-medium text-gray-700">
                    +{result.elevationM.toFixed(0)}m
                  </span>
                  {step.reps > 1 && (
                    <span className="text-gray-400"> ({step.reps} &times;)</span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addStep}
        className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm font-medium"
      >
        + Add step
      </button>

      {hasInput && (
        <div className="mt-5 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">Total workout</div>
          <div className="text-2xl font-bold text-gray-900">
            +{totals.totalElevationM.toFixed(0)}m elevation
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {totals.totalDistanceKm.toFixed(2)} km total distance
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  inputMode = "numeric",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  inputMode?: "numeric" | "decimal";
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        className="w-full p-2 text-base border border-gray-300 rounded-lg"
        inputMode={inputMode}
        min={min}
        step={step}
        placeholder="0"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </div>
  );
}
