export type StepMode = "duration" | "distance";

export interface WorkoutStep {
  id: number;
  mode: StepMode;
  /** Duration in minutes (when mode=duration) */
  durationMin: number;
  /** Speed in km/h (when mode=duration) */
  speedKmh: number;
  /** Distance in km (when mode=distance) */
  distanceKm: number;
  /** Incline percentage (e.g. 5 = 5%) */
  incline: number;
  /** Number of repetitions */
  reps: number;
}

export interface StepResult {
  distanceKm: number;
  elevationM: number;
}

export function calcStepDistance(step: WorkoutStep): number {
  if (step.mode === "distance") {
    return step.distanceKm;
  }
  // duration mode: distance = speed * time
  return step.speedKmh * (step.durationMin / 60);
}

export function calcStepElevation(step: WorkoutStep): StepResult {
  const distanceKm = calcStepDistance(step);
  const distanceM = distanceKm * 1000;
  const elevationM = distanceM * (step.incline / 100);
  const reps = step.reps || 1;
  return {
    distanceKm: distanceKm * reps,
    elevationM: elevationM * reps,
  };
}

export function calcTotalElevation(steps: WorkoutStep[]): { totalDistanceKm: number; totalElevationM: number } {
  let totalDistanceKm = 0;
  let totalElevationM = 0;
  for (const step of steps) {
    const result = calcStepElevation(step);
    totalDistanceKm += result.distanceKm;
    totalElevationM += result.elevationM;
  }
  return { totalDistanceKm, totalElevationM };
}

let nextId = 1;
export function createStep(): WorkoutStep {
  return {
    id: nextId++,
    mode: "duration",
    durationMin: 0,
    speedKmh: 0,
    distanceKm: 0,
    incline: 0,
    reps: 0,
  };
}

/** Serialize steps to a compact URL string: "d:30:10:5:1;k:2:3:2" */
export function serializeSteps(steps: WorkoutStep[]): string {
  return steps
    .map((s) => {
      if (s.mode === "duration") {
        return `d:${s.durationMin}:${s.speedKmh}:${s.incline}:${s.reps}`;
      }
      return `k:${s.distanceKm}:${s.incline}:${s.reps}`;
    })
    .join(";");
}

/** Parse steps from the compact URL string */
export function parseSteps(str: string): WorkoutStep[] {
  if (!str) return [];
  return str.split(";").map((part) => {
    const tokens = part.split(":");
    const step = createStep();
    if (tokens[0] === "d") {
      step.mode = "duration";
      step.durationMin = parseFloat(tokens[1]) || 0;
      step.speedKmh = parseFloat(tokens[2]) || 0;
      step.incline = parseFloat(tokens[3]) || 0;
      step.reps = parseInt(tokens[4]) || 1;
    } else {
      step.mode = "distance";
      step.distanceKm = parseFloat(tokens[1]) || 0;
      step.incline = parseFloat(tokens[2]) || 0;
      step.reps = parseInt(tokens[3]) || 1;
    }
    return step;
  });
}
