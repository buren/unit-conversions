import { toSeconds, formatTime, formatPace } from "./time";

const MILES_TO_KM = 1.609;

export const RACE_DISTANCES_M = [5000, 10000, 15000, 21097.5, 42195, 100000, 160900];

export function mileToKmPace(minutes: number, seconds: number): string {
  const totalSec = toSeconds(0, minutes, seconds);
  const kmSec = totalSec / MILES_TO_KM;
  const m = Math.floor(kmSec / 60);
  const s = Math.floor(kmSec % 60);
  return formatPace(m, s);
}

export function kmToMilePace(minutes: number, seconds: number): string {
  const totalSec = toSeconds(0, minutes, seconds);
  const mileSec = totalSec * MILES_TO_KM;
  const m = Math.floor(mileSec / 60);
  const s = Math.floor(mileSec % 60);
  return formatPace(m, s);
}

export function convertPace(minutes: number, seconds: number, unit: "min/mile" | "min/km"): { result: string; unit: string } {
  if (unit === "min/mile") {
    return { result: mileToKmPace(minutes, seconds), unit: "min/km" };
  }
  return { result: kmToMilePace(minutes, seconds), unit: "min/mile" };
}

/** Given a pace (mm:ss in the given unit), compute finish times for each distance */
export function paceToTimeTable(
  minutes: number,
  seconds: number,
  unit: "min/mile" | "min/km",
  extraDistancesM: number[] = [],
): [number, string][] {
  const totalSec = toSeconds(0, minutes, seconds);
  const secPerM = unit === "min/mile" ? totalSec / 1609 : totalSec / 1000;
  const distances = [...RACE_DISTANCES_M, ...extraDistancesM];

  return distances.map((meters) => [
    meters / 1000,
    formatTime(secPerM * meters),
  ]);
}

/** Given a total time and distance, compute the pace in min/km */
export function racePace(distanceM: number, hours: number, minutes: number, seconds: number): string {
  const totalSec = toSeconds(hours, minutes, seconds);
  const secPerKm = totalSec / (distanceM / 1000);
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return formatPace(m, s);
}

/** Given a total time (no distance), show what pace each standard distance would require */
export function timeToPaceTable(
  hours: number,
  minutes: number,
  seconds: number,
  extraDistancesM: number[] = [],
): [number, string][] {
  const totalSec = toSeconds(hours, minutes, seconds);
  if (totalSec <= 0) return [];
  const distances = [...RACE_DISTANCES_M, ...extraDistancesM];

  return distances.map((meters) => {
    const secPerKm = totalSec / (meters / 1000);
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return [meters / 1000, formatPace(m, s)];
  });
}
