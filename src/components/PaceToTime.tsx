import { useState, useEffect, useRef } from "react";
import { convertPace, kmhToPace, paceToKmh, paceToTimeTable, kmToMilePace, mileToKmPace, type PaceUnit } from "../lib/pace";
import { formatPace } from "../lib/time";
import PaceTable from "./PaceTable";

function round(value: number, digits = 2): number {
  return parseFloat(value.toFixed(digits));
}

interface PaceToTimeProps {
  initialMinutes?: number;
  initialSeconds?: number;
  initialSpeed?: number;
  initialUnit?: PaceUnit;
  initialDistances?: number[];
  onStateChange?: (state: { minutes: number; seconds: number; speed: number; unit: PaceUnit; distances: number[] }) => void;
}

export default function PaceToTime({
  initialMinutes = 0,
  initialSeconds = 0,
  initialSpeed = 0,
  initialUnit = "min/km",
  initialDistances = [],
  onStateChange,
}: PaceToTimeProps) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [speed, setSpeed] = useState(initialSpeed);
  const [unit, setUnit] = useState<PaceUnit>(initialUnit);
  const [dirty, setDirty] = useState(initialMinutes > 0 || initialSeconds > 0 || initialSpeed > 0);
  const [customDistances, setCustomDistances] = useState<number[]>(initialDistances);
  const [distanceInput, setDistanceInput] = useState("");
  const [minFlash, setMinFlash] = useState(false);
  const minInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onStateChange?.({ minutes, seconds, speed, unit, distances: customDistances });
  }, [minutes, seconds, speed, unit, customDistances]);

  const isSpeed = unit === "km/h";

  const paceMin = isSpeed ? kmhToPace(speed).minutes : minutes;
  const paceSec = isSpeed ? kmhToPace(speed).seconds : seconds;
  const isDirty = dirty && (isSpeed ? speed > 0 : true);

  const extraM = customDistances.map((km) => km * 1000);
  const converted = isDirty ? convertPace(paceMin, paceSec, unit) : null;
  const kmh = isDirty
    ? unit === "min/mile"
      ? paceToKmh(...mileToKmPace(paceMin, paceSec).split(":").map(Number) as [number, number])
      : paceToKmh(paceMin, paceSec)
    : 0;
  const table = isDirty ? paceToTimeTable(paceMin, paceSec, isSpeed ? "min/km" : unit, extraM) : [];

  function handleSecondsChange(value: number) {
    if (value >= 60) {
      const extraMin = Math.floor(value / 60);
      const remainSec = value % 60;
      setMinutes((prev) => prev + extraMin);
      setSeconds(remainSec);
      setMinFlash(true);
      setTimeout(() => setMinFlash(false), 600);
    } else {
      setSeconds(value);
    }
    setDirty(true);
  }

  function addDistance() {
    const km = parseFloat(distanceInput);
    if (km > 0 && !customDistances.includes(km)) {
      setCustomDistances((prev) => [...prev, km]);
      setDistanceInput("");
    }
  }

  function removeDistance(km: number) {
    setCustomDistances((prev) => prev.filter((d) => d !== km));
  }

  let resultText = "-";
  if (converted) {
    if (isSpeed) {
      const milePace = kmToMilePace(paceMin, paceSec);
      resultText = `${formatPace(paceMin, paceSec)} min/km · ${milePace} min/mile · ${round(speed, 1)} km/h`;
    } else {
      resultText = `${converted.result} ${converted.unit} · ${round(kmh, 1)} km/h`;
    }
  }

  return (
    <section>
      <div className="inline-flex rounded-lg border border-gray-300 mb-4 divide-x divide-gray-300">
        {(["min/mile", "min/km", "km/h"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
              unit === u
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {isSpeed ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-24 p-2.5 text-base border border-gray-300 rounded-lg"
              min="0"
              step="0.1"
              placeholder="00"
              value={speed || ""}
              onChange={(e) => {
                setSpeed(parseFloat(e.target.value) || 0);
                setDirty(true);
              }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            />
            <span className="text-sm text-gray-500">km/h</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex space-x-2">
              <input
                ref={minInputRef}
                type="number"
                className={`w-18 p-2.5 text-base border rounded-lg transition-colors duration-300 ${
                  minFlash
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-300"
                }`}
                min="0"
                placeholder="00"
                value={minutes || ""}
                onChange={(e) => {
                  setMinutes(parseInt(e.target.value) || 0);
                  setDirty(true);
                }}
              />
              <span className="pt-2 text-lg">:</span>
              <input
                type="number"
                className="w-18 p-2.5 text-base border border-gray-300 rounded-lg"
                min="0"
                placeholder="00"
                value={seconds || ""}
                onChange={(e) => handleSecondsChange(parseInt(e.target.value) || 0)}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              />
            </div>
            <span className="text-sm text-gray-500">mm:ss</span>
          </div>
        )}
      </div>

      {isDirty && (
        <p className="mt-4 text-gray-600">
          Result:{" "}
          <span className="font-semibold">{resultText}</span>
        </p>
      )}

      {isDirty && (
        <>
          <div className="mt-6">
            <PaceTable data={table} />
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              className="flex-1 p-2 border border-gray-300 rounded"
              placeholder="Additional distance (km)"
              value={distanceInput}
              onChange={(e) => setDistanceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addDistance();
              }}
            />
            <button
              type="button"
              onClick={addDistance}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          {customDistances.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customDistances.map((km) => (
                <span
                  key={km}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded"
                >
                  {km}k
                  <button
                    type="button"
                    onClick={() => removeDistance(km)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
