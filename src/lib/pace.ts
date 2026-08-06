import { toSeconds, fromSeconds, formatTime, formatPace } from "./time";

const MILE_METRES = 1609;
const MILES_TO_KM = MILE_METRES / 1000;

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
  { meters: 50000, label: "50k" },
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

export const EMPTY_VALUE = "—";

/** Given a pace in seconds per unit, compute finish times for each distance */
export function paceToTimeTable(
  paceSec: number,
  unit: PaceUnit,
  extraDistancesM: number[] = [],
): PaceTableRow[] {
  const isEmpty = paceSec <= 0;

  const allDistances: { meters: number; label: string; isCustom: boolean }[] = [
    ...RACE_DISTANCES.map((d) => ({ ...d, isCustom: false })),
    ...extraDistancesM.map((m) => ({ meters: m, label: `${parseFloat((m / 1000).toFixed(2))}k`, isCustom: true })),
  ];

  allDistances.sort((a, b) => a.meters - b.meters);

  return allDistances.map(({ meters, label, isCustom }) => ({
    km: meters / 1000,
    label,
    value: isEmpty ? EMPTY_VALUE : formatTime(timeAtPace(meters, paceSec, unit)),
    isCustom,
    miles: unit === "min/mile" ? meters / MILE_METRES : undefined,
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
  const isEmpty = totalSec <= 0;

  const allDistances: { meters: number; label: string; isCustom: boolean }[] = [
    ...RACE_DISTANCES.map((d) => ({ ...d, isCustom: false })),
    ...extraDistancesM.map((m) => ({ meters: m, label: `${parseFloat((m / 1000).toFixed(2))}k`, isCustom: true })),
  ];

  allDistances.sort((a, b) => a.meters - b.meters);

  return allDistances.map(({ meters, label, isCustom }) => {
    if (isEmpty) {
      return { km: meters / 1000, label, value: EMPTY_VALUE, isCustom };
    }
    const secPerKm = totalSec / (meters / 1000);
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return { km: meters / 1000, label, value: formatPace(m, s), isCustom };
  });
}

/**
 * Total seconds to cover a distance at a pace given in seconds per unit —
 * per mile for min/mile, per km otherwise.
 */
export function timeAtPace(meters: number, paceSec: number, unit: PaceUnit): number {
  const secPerM = unit === "min/mile" ? paceSec / MILE_METRES : paceSec / 1000;
  return secPerM * meters;
}

export function formatPaceSeconds(paceSec: number): string {
  const total = Math.round(paceSec);
  return formatPace(Math.floor(total / 60), total % 60);
}

/** Signed time difference for a what-if column: "+3:27", "-3:27", or the empty marker at zero. */
export function formatDelta(seconds: number): string {
  const rounded = Math.round(seconds);
  if (rounded === 0) return EMPTY_VALUE;
  const { hours, minutes, seconds: secs } = fromSeconds(Math.abs(rounded));
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const body = `${hours > 0 ? `${hours}:` : ""}${mm}:${String(secs).padStart(2, "0")}`;
  return `${rounded > 0 ? "+" : "-"}${body}`;
}

/**
 * How much longer (or shorter) a distance takes at one pace than another.
 * Rounds each time first so the result always equals the difference between the
 * two times as displayed, rather than being a second out.
 */
export function paceTimeDelta(
  meters: number,
  fromPaceSec: number,
  toPaceSec: number,
  unit: PaceUnit,
): number {
  return Math.round(timeAtPace(meters, toPaceSec, unit)) - Math.round(timeAtPace(meters, fromPaceSec, unit));
}

/** A pace shifted by an offset, held positive. Zero stays zero so callers keep showing placeholders. */
export function applyPaceOffset(basePaceSec: number, offsetSec: number): number {
  if (basePaceSec <= 0) return 0;
  return Math.max(1, basePaceSec + offsetSec);
}

export interface PaceVariant {
  offsetSec: number;
  pace: string;
  time: string;
  deltaSec: number;
}

/**
 * A ladder of paces stepping either side of a baseline, with the finish time
 * each would give over one distance. Offsets that would drive the pace to zero
 * or below are dropped.
 */
export function paceVariants(
  meters: number,
  basePaceSec: number,
  unit: PaceUnit,
  stepSec = 5,
  steps = 3,
): PaceVariant[] {
  if (basePaceSec <= 0 || meters <= 0) return [];

  const variants: PaceVariant[] = [];
  for (let i = -steps; i <= steps; i++) {
    const offsetSec = i * stepSec;
    const paceSec = basePaceSec + offsetSec;
    if (paceSec <= 0) continue;
    variants.push({
      offsetSec,
      pace: formatPaceSeconds(paceSec),
      time: formatTime(timeAtPace(meters, paceSec, unit)),
      deltaSec: paceTimeDelta(meters, basePaceSec, paceSec, unit),
    });
  }
  return variants;
}
