import { useState, useEffect, useCallback } from "react";
import PaceToTime from "./components/PaceToTime";
import TimeToPace from "./components/TimeToPace";
import TreadmillCalc from "./components/TreadmillCalc";
import type { PaceUnit } from "./lib/pace";
import { parseSteps } from "./lib/treadmill";

type Tab = "pace-to-time" | "time-to-pace" | "vdot" | "treadmill";

function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const rawTab = params.get("tab");
  const tab = (rawTab === "time-to-pace" || rawTab === "vdot" || rawTab === "treadmill" ? rawTab : "pace-to-time") as Tab;

  // Pace to time params
  const paceMin = parseInt(params.get("pm") || "0") || 0;
  const paceSec = parseInt(params.get("ps") || "0") || 0;
  const speed = parseFloat(params.get("speed") || "0") || 0;
  const paceUnit = (params.get("unit") || "min/km") as PaceUnit;
  const paceDistances = (params.get("pd") || "").split(",").map(Number).filter((n) => n > 0);

  // Time to pace params
  const hours = parseInt(params.get("h") || "0") || 0;
  const minutes = parseInt(params.get("m") || "0") || 0;
  const seconds = parseInt(params.get("s") || "0") || 0;
  const distanceKm = parseFloat(params.get("d") || "") || null;
  const timeDistances = (params.get("td") || "").split(",").map(Number).filter((n) => n > 0);

  // Treadmill params
  const treadmillSteps = parseSteps(params.get("ts") || "");

  return { tab, paceMin, paceSec, speed, paceUnit, paceDistances, hours, minutes, seconds, distanceKm, timeDistances, treadmillSteps };
}

export default function App() {
  const initial = parseUrlState();
  const [tab, setTab] = useState<Tab>(initial.tab);

  const updateUrl = useCallback((newTab: Tab, state: Record<string, string>) => {
    const params = new URLSearchParams();
    if (newTab !== "pace-to-time") params.set("tab", newTab);
    for (const [k, v] of Object.entries(state)) {
      if (v && v !== "0" && v !== "min/km") params.set(k, v);
    }
    const search = params.toString();
    const url = search ? `?${search}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, []);

  const [paceState, setPaceState] = useState({
    pm: String(initial.paceMin),
    ps: String(initial.paceSec),
    speed: String(initial.speed),
    unit: initial.paceUnit,
    pd: initial.paceDistances.join(","),
  });

  const [timeState, setTimeState] = useState({
    h: String(initial.hours),
    m: String(initial.minutes),
    s: String(initial.seconds),
    d: initial.distanceKm ? String(initial.distanceKm) : "",
    td: initial.timeDistances.join(","),
  });

  const [treadmillState, setTreadmillState] = useState({ ts: "" });

  useEffect(() => {
    const state =
      tab === "pace-to-time" ? paceState :
      tab === "time-to-pace" ? timeState :
      tab === "treadmill" ? treadmillState :
      {};
    updateUrl(tab, state);
  }, [tab, paceState, timeState, treadmillState, updateUrl]);

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-4 sm:p-8 shadow-md rounded-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Running Pace Calculator</h1>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setTab("pace-to-time")}
            className={`px-4 py-3 -mb-px text-sm sm:text-base font-medium transition-colors ${
              tab === "pace-to-time"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pace to time
          </button>
          <button
            type="button"
            onClick={() => setTab("time-to-pace")}
            className={`px-4 py-3 -mb-px text-sm sm:text-base font-medium transition-colors ${
              tab === "time-to-pace"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Time to pace
          </button>
          <button
            type="button"
            onClick={() => setTab("vdot")}
            className={`px-4 py-3 -mb-px text-sm sm:text-base font-medium transition-colors ${
              tab === "vdot"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            VDOT calculator
          </button>
          <button
            type="button"
            onClick={() => setTab("treadmill")}
            className={`px-4 py-3 -mb-px text-sm sm:text-base font-medium transition-colors ${
              tab === "treadmill"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Treadmill
          </button>
        </div>

        <div className={tab === "pace-to-time" ? "" : "hidden"}>
          <PaceToTime
            initialMinutes={initial.paceMin}
            initialSeconds={initial.paceSec}
            initialSpeed={initial.speed}
            initialUnit={initial.paceUnit}
            initialDistances={initial.paceDistances}
            onStateChange={(s) =>
              setPaceState({
                pm: String(s.minutes),
                ps: String(s.seconds),
                speed: String(s.speed),
                unit: s.unit,
                pd: s.distances.join(","),
              })
            }
          />
        </div>
        <div className={tab === "vdot" ? "" : "hidden"}>
          <iframe
            src="https://vdoto2.com/calculator/embed"
            className="w-full border-0"
            style={{ height: "80vh", minHeight: "600px" }}
            title="VDOT Calculator"
          />
        </div>
        <div className={tab === "treadmill" ? "" : "hidden"}>
          <TreadmillCalc
            initialSteps={initial.treadmillSteps}
            onStateChange={setTreadmillState}
          />
        </div>
        <div className={tab === "time-to-pace" ? "" : "hidden"}>
          <TimeToPace
            initialHours={initial.hours}
            initialMinutes={initial.minutes}
            initialSeconds={initial.seconds}
            initialDistanceKm={initial.distanceKm}
            initialCustomDistances={initial.timeDistances}
            onStateChange={(s) =>
              setTimeState({
                h: String(s.hours),
                m: String(s.minutes),
                s: String(s.seconds),
                d: s.distanceKm ? String(s.distanceKm) : "",
                td: s.distances.join(","),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
