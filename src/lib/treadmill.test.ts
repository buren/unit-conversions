import { describe, it, expect } from "vitest";
import { calcStepElevation, calcTotalElevation, serializeSteps, parseSteps, type WorkoutStep } from "./treadmill";

describe("calcStepElevation", () => {
  it("calculates elevation for distance-based step", () => {
    const step: WorkoutStep = {
      id: 1, mode: "distance", durationMin: 0, speedKmh: 0,
      distanceKm: 2, incline: 5, reps: 1,
    };
    const result = calcStepElevation(step);
    expect(result.distanceKm).toBe(2);
    expect(result.elevationM).toBe(100); // 2000m * 0.05
  });

  it("calculates elevation for duration-based step", () => {
    const step: WorkoutStep = {
      id: 2, mode: "duration", durationMin: 30, speedKmh: 10,
      distanceKm: 0, incline: 3, reps: 1,
    };
    const result = calcStepElevation(step);
    expect(result.distanceKm).toBe(5); // 10km/h * 0.5h
    expect(result.elevationM).toBe(150); // 5000m * 0.03
  });

  it("multiplies by repetitions", () => {
    const step: WorkoutStep = {
      id: 3, mode: "distance", durationMin: 0, speedKmh: 0,
      distanceKm: 1, incline: 10, reps: 3,
    };
    const result = calcStepElevation(step);
    expect(result.distanceKm).toBe(3);
    expect(result.elevationM).toBe(300); // 1000m * 0.10 * 3
  });

  it("treats 0 reps as 1", () => {
    const step: WorkoutStep = {
      id: 4, mode: "distance", durationMin: 0, speedKmh: 0,
      distanceKm: 2, incline: 5, reps: 0,
    };
    const result = calcStepElevation(step);
    expect(result.distanceKm).toBe(2);
    expect(result.elevationM).toBe(100);
  });
});

describe("calcTotalElevation", () => {
  it("sums across multiple steps", () => {
    const steps: WorkoutStep[] = [
      { id: 1, mode: "distance", durationMin: 0, speedKmh: 0, distanceKm: 2, incline: 5, reps: 1 },
      { id: 2, mode: "duration", durationMin: 60, speedKmh: 8, distanceKm: 0, incline: 2, reps: 2 },
    ];
    const result = calcTotalElevation(steps);
    expect(result.totalDistanceKm).toBe(2 + 8 * 2); // 2 + 16
    expect(result.totalElevationM).toBe(100 + 8000 * 0.02 * 2); // 100 + 320
  });

  it("returns zero for empty steps", () => {
    const result = calcTotalElevation([]);
    expect(result.totalDistanceKm).toBe(0);
    expect(result.totalElevationM).toBe(0);
  });
});

describe("serializeSteps / parseSteps", () => {
  it("round-trips duration steps", () => {
    const steps: WorkoutStep[] = [
      { id: 1, mode: "duration", durationMin: 30, speedKmh: 10, distanceKm: 0, incline: 5, reps: 2 },
    ];
    const serialized = serializeSteps(steps);
    expect(serialized).toBe("d:30:10:5:2");
    const parsed = parseSteps(serialized);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].mode).toBe("duration");
    expect(parsed[0].durationMin).toBe(30);
    expect(parsed[0].speedKmh).toBe(10);
    expect(parsed[0].incline).toBe(5);
    expect(parsed[0].reps).toBe(2);
  });

  it("round-trips distance steps", () => {
    const serialized = serializeSteps([
      { id: 1, mode: "distance", durationMin: 0, speedKmh: 0, distanceKm: 2.5, incline: 3, reps: 1 },
    ]);
    expect(serialized).toBe("k:2.5:3:1");
    const parsed = parseSteps(serialized);
    expect(parsed[0].mode).toBe("distance");
    expect(parsed[0].distanceKm).toBe(2.5);
  });

  it("round-trips multiple steps", () => {
    const serialized = "d:30:10:5:1;k:2:3:2";
    const parsed = parseSteps(serialized);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].mode).toBe("duration");
    expect(parsed[1].mode).toBe("distance");
    expect(parsed[1].reps).toBe(2);
  });

  it("returns empty array for empty string", () => {
    expect(parseSteps("")).toEqual([]);
  });
});
