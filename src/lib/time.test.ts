import { describe, it, expect } from "vitest";
import { toSeconds, fromSeconds, formatTime, formatPace } from "./time";

describe("toSeconds", () => {
  it("converts hours, minutes, seconds to total seconds", () => {
    expect(toSeconds(0, 0, 0)).toBe(0);
    expect(toSeconds(0, 0, 30)).toBe(30);
    expect(toSeconds(0, 5, 30)).toBe(330);
    expect(toSeconds(1, 0, 0)).toBe(3600);
    expect(toSeconds(1, 30, 45)).toBe(5445);
    expect(toSeconds(2, 0, 0)).toBe(7200);
  });
});

describe("fromSeconds", () => {
  it("converts total seconds to hours, minutes, seconds", () => {
    expect(fromSeconds(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(fromSeconds(30)).toEqual({ hours: 0, minutes: 0, seconds: 30 });
    expect(fromSeconds(330)).toEqual({ hours: 0, minutes: 5, seconds: 30 });
    expect(fromSeconds(3600)).toEqual({ hours: 1, minutes: 0, seconds: 0 });
    expect(fromSeconds(5445)).toEqual({ hours: 1, minutes: 30, seconds: 45 });
  });

  it("rounds to nearest second", () => {
    expect(fromSeconds(30.4)).toEqual({ hours: 0, minutes: 0, seconds: 30 });
    expect(fromSeconds(30.6)).toEqual({ hours: 0, minutes: 0, seconds: 31 });
  });
});

describe("formatTime", () => {
  it("formats mm:ss when under an hour", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(30)).toBe("00:30");
    expect(formatTime(330)).toBe("05:30");
    expect(formatTime(599)).toBe("09:59");
  });

  it("formats hh:mm:ss when an hour or more", () => {
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(5445)).toBe("01:30:45");
    expect(formatTime(36000)).toBe("10:00:00");
  });

  it("rounds fractional seconds", () => {
    expect(formatTime(330.4)).toBe("05:30");
    expect(formatTime(330.6)).toBe("05:31");
  });
});

describe("formatPace", () => {
  it("formats minutes and seconds with padded seconds", () => {
    expect(formatPace(5, 30)).toBe("5:30");
    expect(formatPace(5, 0)).toBe("5:00");
    expect(formatPace(5, 5)).toBe("5:05");
    expect(formatPace(0, 0)).toBe("0:00");
    expect(formatPace(12, 45)).toBe("12:45");
  });
});
