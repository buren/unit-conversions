import { useState } from "react";
import { racePace, paceToTimeTable, timeToPaceTable } from "../lib/pace";
import PaceTable from "./PaceTable";

export default function TimeToPace() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [additionalKm, setAdditionalKm] = useState<number | null>(null);

  const extraM = additionalKm ? [additionalKm * 1000] : [];

  let result = "-";
  let tableTitle = "Time";
  let table: [number, string][] = [];

  if (distanceKm) {
    const pace = racePace(distanceKm * 1000, hours, minutes, seconds);
    result = `${pace} min/km`;
    tableTitle = "Time";
    const [m, s] = pace.split(":").map((v) => parseInt(v));
    table = paceToTimeTable(m, s, "min/km", extraM);
  } else {
    tableTitle = "min/km";
    table = timeToPaceTable(hours, minutes, seconds, extraM);
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Time to pace</h2>
      <div className="flex items-center space-x-4 mb-2">
        <div className="flex space-x-3 w-76">
          <input
            type="number"
            className="w-16 p-2 border border-gray-300 rounded"
            min="0"
            placeholder="0"
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
          />
          <span className="pt-[7px]">:</span>
          <input
            type="number"
            className="w-16 p-2 border border-gray-300 rounded"
            min="0"
            placeholder="0"
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
          />
          <span className="pt-[7px]">:</span>
          <input
            type="number"
            className="w-16 p-2 border border-gray-300 rounded"
            min="0"
            placeholder="0"
            onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
          />
        </div>
        <p>hh:mm:ss</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex space-x-3 w-76">
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            placeholder="Distance (km)"
            onChange={(e) => setDistanceKm(parseFloat(e.target.value) || null)}
          />
        </div>
        <p>km</p>
      </div>

      <p className="mt-4 text-gray-600">
        Result: <span className="font-semibold">{result}</span>
      </p>

      {table.length > 0 && (
        <>
          <div className="mt-8">
            <PaceTable title={tableTitle} data={table} />
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
