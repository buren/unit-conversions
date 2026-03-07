import { useState } from "react";
import { convertPace, paceToTimeTable } from "../lib/pace";
import PaceTable from "./PaceTable";

export default function PaceToTime() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [unit, setUnit] = useState<"min/mile" | "min/km">("min/km");
  const [dirty, setDirty] = useState(false);
  const [additionalKm, setAdditionalKm] = useState<number | null>(null);

  const extraM = additionalKm ? [additionalKm * 1000] : [];
  const converted = dirty ? convertPace(minutes, seconds, unit) : null;
  const table = dirty ? paceToTimeTable(minutes, seconds, unit, extraM) : [];

  function update(min: number, sec: number, u: "min/mile" | "min/km") {
    setMinutes(min);
    setSeconds(sec);
    setUnit(u);
    setDirty(true);
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Pace to time</h2>
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <input
            type="number"
            className="w-16 p-2 border border-gray-300 rounded"
            min="0"
            placeholder="0"
            onChange={(e) => update(parseInt(e.target.value) || 0, seconds, unit)}
          />
          <span className="pt-[7px]">:</span>
          <input
            type="number"
            className="w-16 p-2 border border-gray-300 rounded"
            min="0"
            placeholder="0"
            onChange={(e) => update(minutes, parseInt(e.target.value) || 0, unit)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="pace-unit"
              value="min/mile"
              checked={unit === "min/mile"}
              onChange={() => update(minutes, seconds, "min/mile")}
              className="accent-blue-500"
            />
            <span>min/mile</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="pace-unit"
              value="min/km"
              checked={unit === "min/km"}
              onChange={() => update(minutes, seconds, "min/km")}
              className="accent-blue-500"
            />
            <span>min/km</span>
          </label>
        </div>
      </div>

      <p className="mt-4 text-gray-600">
        Result: <span className="font-semibold">{converted ? `${converted.result} ${converted.unit}` : "-"}</span>
      </p>

      {dirty && (
        <>
          <div className="mt-8">
            <PaceTable data={table} />
          </div>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mt-2"
            placeholder="Additional distance (km)"
            onChange={(e) => setAdditionalKm(parseFloat(e.target.value) || null)}
          />
        </>
      )}
    </section>
  );
}
