import { describe, it, expect } from "vitest";
import {
  mileToKmPace,
  kmToMilePace,
  kmhToPace,
  paceToKmh,
  convertPace,
  paceToTimeTable,
  timeToPaceTable,
  racePace,
  RACE_DISTANCES,
} from "./pace";

describe("mileToKmPace", () => {
  it("converts min/mile to min/km", () => {
    // 8:00/mile = ~4:58/km (8*60 / 1.609 = 298.3s = 4:58)
    expect(mileToKmPace(8, 0)).toBe("4:58");
  });

  it("converts 6:00/mile", () => {
    // 360 / 1.609 = 223.7s = 3:43
    expect(mileToKmPace(6, 0)).toBe("3:43");
  });

  it("handles zero pace", () => {
    expect(mileToKmPace(0, 0)).toBe("0:00");
  });
});

describe("kmToMilePace", () => {
  it("converts min/km to min/mile", () => {
    // 5:00/km = 5*60 * 1.609 = 482.7s = 8:02
    expect(kmToMilePace(5, 0)).toBe("8:02");
  });

  it("converts 4:00/km", () => {
    // 240 * 1.609 = 386.16s = 6:26
    expect(kmToMilePace(4, 0)).toBe("6:26");
  });

  it("handles zero pace", () => {
    expect(kmToMilePace(0, 0)).toBe("0:00");
  });
});

describe("kmhToPace", () => {
  it("converts km/h to min/km", () => {
    // 12 km/h = 3600/12 = 300s/km = 5:00
    expect(kmhToPace(12)).toEqual({ minutes: 5, seconds: 0 });
  });

  it("converts 10 km/h", () => {
    // 3600/10 = 360s = 6:00
    expect(kmhToPace(10)).toEqual({ minutes: 6, seconds: 0 });
  });

  it("converts 15 km/h", () => {
    // 3600/15 = 240s = 4:00
    expect(kmhToPace(15)).toEqual({ minutes: 4, seconds: 0 });
  });

  it("handles zero and negative", () => {
    expect(kmhToPace(0)).toEqual({ minutes: 0, seconds: 0 });
    expect(kmhToPace(-5)).toEqual({ minutes: 0, seconds: 0 });
  });
});

describe("paceToKmh", () => {
  it("converts min/km to km/h", () => {
    expect(paceToKmh(5, 0)).toBe(12);
    expect(paceToKmh(6, 0)).toBe(10);
    expect(paceToKmh(4, 0)).toBe(15);
  });

  it("handles zero pace", () => {
    expect(paceToKmh(0, 0)).toBe(0);
  });
});

describe("convertPace", () => {
  it("converts min/mile to min/km", () => {
    const result = convertPace(8, 0, "min/mile");
    expect(result.unit).toBe("min/km");
    expect(result.result).toBe("4:58");
  });

  it("converts min/km to min/mile", () => {
    const result = convertPace(5, 0, "min/km");
    expect(result.unit).toBe("min/mile");
    expect(result.result).toBe("8:02");
  });

  it("returns same pace for km/h", () => {
    const result = convertPace(5, 0, "km/h");
    expect(result.unit).toBe("min/km");
    expect(result.result).toBe("5:00");
  });
});

describe("paceToTimeTable", () => {
  it("returns standard race distances sorted", () => {
    const table = paceToTimeTable(5, 0, "min/km");
    expect(table.length).toBe(RACE_DISTANCES.length);
    expect(table[0].label).toBe("5k");
    expect(table[0].value).toBe("25:00");
    expect(table[table.length - 1].label).toBe("100 miles");
  });

  it("sorts custom distances correctly", () => {
    const table = paceToTimeTable(5, 0, "min/km", [8000]);
    expect(table.length).toBe(RACE_DISTANCES.length + 1);
    const labels = table.map((r) => r.label);
    const idx8k = labels.indexOf("8k");
    const idx5k = labels.indexOf("5k");
    const idx10k = labels.indexOf("10k");
    expect(idx8k).toBeGreaterThan(idx5k);
    expect(idx8k).toBeLessThan(idx10k);
  });

  it("marks custom distances", () => {
    const table = paceToTimeTable(5, 0, "min/km", [8000]);
    const custom = table.find((r) => r.label === "8k");
    expect(custom?.isCustom).toBe(true);
    expect(table[0].isCustom).toBe(false);
  });

  it("computes correct time for 5k at 5:00/km", () => {
    const table = paceToTimeTable(5, 0, "min/km");
    const fiveK = table.find((r) => r.label === "5k");
    expect(fiveK?.value).toBe("25:00");
  });

  it("computes correct time for 10k at 5:00/km", () => {
    const table = paceToTimeTable(5, 0, "min/km");
    const tenK = table.find((r) => r.label === "10k");
    expect(tenK?.value).toBe("50:00");
  });

  it("includes miles column for min/mile", () => {
    const table = paceToTimeTable(8, 0, "min/mile");
    expect(table[0].miles).toBeDefined();
    // 5000m / 1609 = ~3.1 miles
    expect(Math.abs(table[0].miles! - 3.1)).toBeLessThan(0.1);
  });

  it("does not include miles for min/km", () => {
    const table = paceToTimeTable(5, 0, "min/km");
    expect(table[0].miles).toBeUndefined();
  });
});

describe("racePace", () => {
  it("computes pace for 5k in 25 minutes", () => {
    expect(racePace(5000, 0, 25, 0)).toBe("5:00");
  });

  it("computes pace for 10k in 50 minutes", () => {
    expect(racePace(10000, 0, 50, 0)).toBe("5:00");
  });

  it("computes pace for marathon in 3:30", () => {
    // 42195m in 3h30m = 12600s, 12600 / 42.195 = 298.6s/km = 4:59
    const pace = racePace(42195, 3, 30, 0);
    expect(pace).toBe("4:59");
  });
});

describe("timeToPaceTable", () => {
  it("returns empty for zero time", () => {
    expect(timeToPaceTable(0, 0, 0)).toEqual([]);
  });

  it("returns correct pace for 25 min over standard distances", () => {
    const table = timeToPaceTable(0, 25, 0);
    const fiveK = table.find((r) => r.label === "5k");
    expect(fiveK?.value).toBe("5:00");
  });

  it("sorts custom distances", () => {
    const table = timeToPaceTable(0, 25, 0, [8000]);
    const labels = table.map((r) => r.label);
    expect(labels.indexOf("8k")).toBeGreaterThan(labels.indexOf("5k"));
    expect(labels.indexOf("8k")).toBeLessThan(labels.indexOf("10k"));
  });
});
