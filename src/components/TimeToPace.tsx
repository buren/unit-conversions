import { useState, useEffect } from "react";
import { racePace, paceToTimeTable, timeToPaceTable, paceToKmh, kmToMilePace, RACE_DISTANCES } from "../lib/pace";
import PaceTable from "./PaceTable";

function round(value: number, digits = 2): number {
  return parseFloat(value.toFixed(digits));
}

interface TimeToPaceProps {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  initialDistanceKm?: number | null;
  initialCustomDistances?: number[];
  onStateChange?: (state: { hours: number; minutes: number; seconds: number; distanceKm: number | null; distances: number[] }) => void;
}

export default function TimeToPace({
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0,
  initialDistanceKm = null,
  initialCustomDistances = [],
  onStateChange,
}: TimeToPaceProps) {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [distanceKm, setDistanceKm] = useState<number | null>(initialDistanceKm);
  const [customDistances, setCustomDistances] = useState<number[]>(initialCustomDistances);
  const [distanceInput, setDistanceInput] = useState("");
  const [minFlash, setMinFlash] = useState(false);
  const [hourFlash, setHourFlash] = useState(false);

  useEffect(() => {
    onStateChange?.({ hours, minutes, seconds, distanceKm, distances: customDistances });
  }, [hours, minutes, seconds, distanceKm, customDistances]);

  const extraM = customDistances.map((km) => km * 1000);

  function handleSecondsChange(value: number) {
    if (value >= 60) {
      const extraMin = Math.floor(value / 60);
      const remainSec = value % 60;
      setSeconds(remainSec);
      handleMinutesChange(minutes + extraMin);
      setMinFlash(true);
      setTimeout(() => setMinFlash(false), 600);
    } else {
      setSeconds(value);
    }
  }

  function handleMinutesChange(value: number) {
    if (value >= 60) {
      const extraHour = Math.floor(value / 60);
      const remainMin = value % 60;
      setMinutes(remainMin);
      setHours((prev) => prev + extraHour);
      setHourFlash(true);
      setTimeout(() => setHourFlash(false), 600);
    } else {
      setMinutes(value);
    }
  }

  let result: string | null = null;
  let tableTitle = "Time";
  let table: ReturnType<typeof timeToPaceTable> = [];

  if (distanceKm) {
    const pace = racePace(distanceKm * 1000, hours, minutes, seconds);
    const [m, s] = pace.split(":").map((v) => parseInt(v));
    const milePace = kmToMilePace(m, s);
    const kmh = paceToKmh(m, s);
    result = `${pace} min/km · ${milePace} min/mile · ${round(kmh, 1)} km/h`;
    tableTitle = "Time";
    const distanceM = distanceKm * 1000;
    const isStandardDistance = RACE_DISTANCES.some((d) => d.meters === distanceM);
    const allExtraM = isStandardDistance ? extraM : [distanceM, ...extraM];
    table = paceToTimeTable(m, s, "min/km", allExtraM);
  } else if (hours > 0 || minutes > 0 || seconds > 0) {
    tableTitle = "min/km";
    table = timeToPaceTable(hours, minutes, seconds, extraM);
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

  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex space-x-2">
            <input
              type="number"
              className={`w-18 p-2.5 text-base border rounded-lg transition-colors duration-300 ${
                hourFlash ? "border-amber-400 bg-amber-50" : "border-gray-300"
              }`}
              inputMode="numeric"
              min="0"
              placeholder="00"
              value={hours || ""}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            />
            <span className="pt-2 text-lg">:</span>
            <input
              type="number"
              className={`w-18 p-2.5 text-base border rounded-lg transition-colors duration-300 ${
                minFlash ? "border-amber-400 bg-amber-50" : "border-gray-300"
              }`}
              inputMode="numeric"
              min="0"
              placeholder="00"
              value={minutes || ""}
              onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
            />
            <span className="pt-2 text-lg">:</span>
            <input
              type="number"
              className="w-18 p-2.5 text-base border border-gray-300 rounded-lg"
              inputMode="numeric"
              min="0"
              placeholder="00"
              value={seconds || ""}
              onChange={(e) => handleSecondsChange(parseInt(e.target.value) || 0)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
            />
          </div>
          <span className="text-sm text-gray-500">hh:mm:ss</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-full max-w-48 p-2.5 text-base border border-gray-300 rounded-lg"
          inputMode="decimal"
          min="0"
          placeholder="Distance (km)"
          value={distanceKm ?? ""}
          onChange={(e) => setDistanceKm(parseFloat(e.target.value) || null)}
        />
        <span className="text-sm text-gray-500">km</span>
      </div>

      {result && (
        <p className="mt-4 text-gray-600">
          Result: <span className="font-semibold">{result}</span>
        </p>
      )}

      {table.length > 0 && (
        <>
          <div className="mt-6">
            <PaceTable title={tableTitle} data={table} showKmh={tableTitle === "min/km"} highlightKm={distanceKm ?? undefined} />
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
