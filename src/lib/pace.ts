import { toSeconds, formatTime, formatPace } from "./time";

const MILES_TO_KM = 1.609;

export interface RaceDistance {
  meters: number;
  label: string;
}

export const RACE_DISTANCES: RaceDistance[] = [
  { meters: 5000, label: "5k" },
  { meters: 10000, label: "10k" },
  { meters: 15000, label: "15k" },
  { meters: 21097.5, label: "Half Marathon" },
  { meters: 42195, label: "Marathon" },
  { meters: 100000, label: "100k" },
  { meters: 160900, label: "100 miles" },
];

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

export function kmhToPace(kmh: number): { minutes: number; seconds: number } {
  if (kmh <= 0) return { minutes: 0, seconds: 0 };
  const secPerKm = 3600 / kmh;
  return { minutes: Math.floor(secPerKm / 60), seconds: Math.round(secPerKm % 60) };
}

export function paceToKmh(minutes: number, seconds: number): number {
  const secPerKm = minutes * 60 + seconds;
  if (secPerKm <= 0) return 0;
  return 3600 / secPerKm;
}

export type PaceUnit = "min/mile" | "min/km" | "km/h";

export function convertPace(minutes: number, seconds: number, unit: PaceUnit): { result: string; unit: string } {
  if (unit === "min/mile") {
    return { result: mileToKmPace(minutes, seconds), unit: "min/km" };
  }
  if (unit === "min/km") {
    return { result: kmToMilePace(minutes, seconds), unit: "min/mile" };
  }
  return { result: formatPace(minutes, seconds), unit: "min/km" };
}

export interface PaceTableRow {
  km: number;
  label: string;
  value: string;
  isCustom: boolean;
  miles?: number;
}

/** Given a pace (mm:ss in the given unit), compute finish times for each distance */
export function paceToTimeTable(
  minutes: number,
  seconds: number,
  unit: PaceUnit,
  extraDistancesM: number[] = [],
): PaceTableRow[] {
  const totalSec = toSeconds(0, minutes, seconds);
  const secPerM = unit === "min/mile" ? totalSec / 1609 : totalSec / 1000;

  const allDistances: { meters: number; label: string; isCustom: boolean }[] = [
    ...RACE_DISTANCES.map((d) => ({ ...d, isCustom: false })),
    ...extraDistancesM.map((m) => ({ meters: m, label: `${parseFloat((m / 1000).toFixed(2))}k`, isCustom: true })),
  ];

  allDistances.sort((a, b) => a.meters - b.meters);

  return allDistances.map(({ meters, label, isCustom }) => ({
    km: meters / 1000,
    label,
    value: formatTime(secPerM * meters),
    isCustom,
    miles: unit === "min/mile" ? meters / 1609 : undefined,
  }));
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
): PaceTableRow[] {
  const totalSec = toSeconds(hours, minutes, seconds);
  if (totalSec <= 0) return [];

  const allDistances: { meters: number; label: string; isCustom: boolean }[] = [
    ...RACE_DISTANCES.map((d) => ({ ...d, isCustom: false })),
    ...extraDistancesM.map((m) => ({ meters: m, label: `${parseFloat((m / 1000).toFixed(2))}k`, isCustom: true })),
  ];

  allDistances.sort((a, b) => a.meters - b.meters);

  return allDistances.map(({ meters, label, isCustom }) => {
    const secPerKm = totalSec / (meters / 1000);
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return { km: meters / 1000, label, value: formatPace(m, s), isCustom };
  });
}
