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
  EMPTY_VALUE,
  timeAtPace,
  formatPaceSeconds,
  formatDelta,
  paceVariants,
} from "./pace";
import { formatTime } from "./time";

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
  it("returns placeholder rows for zero time", () => {
    const table = timeToPaceTable(0, 0, 0);
    expect(table).toHaveLength(RACE_DISTANCES.length);
    expect(table.every((r) => r.value === EMPTY_VALUE)).toBe(true);
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

describe("timeAtPace", () => {
  it("computes 10k at 5:00/km", () => {
    expect(timeAtPace(10000, 300, "min/km")).toBe(3000);
  });

  it("treats the pace as per mile for min/mile", () => {
    expect(timeAtPace(1609, 480, "min/mile")).toBeCloseTo(480, 6);
  });

  it("agrees with paceToTimeTable", () => {
    const row = paceToTimeTable(5, 0, "min/km").find((r) => r.label === "Marathon")!;
    expect(formatTime(timeAtPace(42195, 300, "min/km"))).toBe(row.value);
  });
});

describe("formatPaceSeconds", () => {
  it("formats whole and part minutes", () => {
    expect(formatPaceSeconds(300)).toBe("5:00");
    expect(formatPaceSeconds(295)).toBe("4:55");
    expect(formatPaceSeconds(65)).toBe("1:05");
  });
});

describe("formatDelta", () => {
  it("marks no change with the empty value", () => {
    expect(formatDelta(0)).toBe(EMPTY_VALUE);
  });

  it("signs gains and losses", () => {
    expect(formatDelta(207)).toBe("+3:27");
    expect(formatDelta(-207)).toBe("-3:27");
    expect(formatDelta(25)).toBe("+0:25");
  });

  it("includes hours when the difference is large", () => {
    expect(formatDelta(3807)).toBe("+1:03:27");
  });
});

describe("paceVariants", () => {
  it("returns a symmetric ladder centred on the base pace", () => {
    const v = paceVariants(42195, 300, "min/km");
    expect(v).toHaveLength(7);
    expect(v.map((x) => x.pace)).toEqual(["4:45", "4:50", "4:55", "5:00", "5:05", "5:10", "5:15"]);
    expect(v.filter((x) => x.isBase)).toHaveLength(1);
  });

  it("reports the base row as no change and moves both ways around it", () => {
    const v = paceVariants(42195, 300, "min/km");
    const base = v.find((x) => x.isBase)!;
    expect(base.deltaSec).toBe(0);
    expect(base.time).toBe("03:30:59");

    const faster = v.find((x) => x.offsetSec === -5)!;
    const slower = v.find((x) => x.offsetSec === 5)!;
    expect(faster.deltaSec).toBeLessThan(0);
    expect(slower.deltaSec).toBeGreaterThan(0);
    // Rounding can leave the two sides a second apart, but no more.
    expect(Math.abs(faster.deltaSec + slower.deltaSec)).toBeLessThanOrEqual(1);
  });

  it("keeps each delta equal to the difference between the displayed times", () => {
    const v = paceVariants(42195, 300, "min/km");
    const toSec = (t: string) => {
      const p = t.split(":").map(Number);
      return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
    };
    const base = toSec(v.find((x) => x.isBase)!.time);
    for (const variant of v) {
      expect(toSec(variant.time) - base).toBe(variant.deltaSec);
    }
  });

  it("honours step size and count", () => {
    const v = paceVariants(10000, 300, "min/km", 10, 2);
    expect(v.map((x) => x.offsetSec)).toEqual([-20, -10, 0, 10, 20]);
  });

  it("uses per-mile steps for min/mile", () => {
    const v = paceVariants(1609, 480, "min/mile", 15, 1);
    expect(v.map((x) => x.pace)).toEqual(["7:45", "8:00", "8:15"]);
    expect(v.map((x) => x.time)).toEqual(["07:45", "08:00", "08:15"]);
  });

  it("drops offsets that would make the pace zero or negative", () => {
    const v = paceVariants(5000, 10, "min/km", 5, 3);
    expect(v.map((x) => x.offsetSec)).toEqual([-5, 0, 5, 10, 15]);
  });

  it("returns nothing without a usable pace or distance", () => {
    expect(paceVariants(42195, 0, "min/km")).toEqual([]);
    expect(paceVariants(0, 300, "min/km")).toEqual([]);
  });
});
