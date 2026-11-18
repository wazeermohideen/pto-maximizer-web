import { describe, expect, it } from "vitest";
import { planBestBreak, type PlannerInput } from "./planner";

const example: PlannerInput = {
  startDate: "2026-09-04",
  endDate: "2026-09-07",
  ptoBudget: 1,
  holidays: ["2026-09-07"],
  blockedDates: [],
};

describe("planBestBreak", () => {
  it("requests Friday before a Monday holiday to make a four-day break", () => {
    expect(planBestBreak(example)).toEqual({
      startDate: "2026-09-04",
      endDate: "2026-09-07",
      totalDaysOff: 4,
      ptoDates: ["2026-09-04"],
      ptoRemaining: 0,
    });
  });

  it("ends a window at a blocked workday even with PTO to spare", () => {
    expect(
      planBestBreak({
        ...example,
        startDate: "2026-09-03",
        endDate: "2026-09-08",
        ptoBudget: 2,
        blockedDates: ["2026-09-04"],
      }),
    ).toEqual({
      startDate: "2026-09-05",
      endDate: "2026-09-08",
      totalDaysOff: 4,
      ptoDates: ["2026-09-08"],
      ptoRemaining: 1,
    });
  });

  it("prefers fewer PTO days before considering the start date", () => {
    expect(
      planBestBreak({
        ...example,
        endDate: "2026-09-14",
        holidays: ["2026-09-14"],
        blockedDates: ["2026-09-07", "2026-09-11"],
      }),
    ).toEqual({
      startDate: "2026-09-12",
      endDate: "2026-09-14",
      totalDaysOff: 3,
      ptoDates: [],
      ptoRemaining: 1,
    });
  });

  it("prefers the earliest start when length and PTO cost tie", () => {
    expect(
      planBestBreak({
        ...example,
        endDate: "2026-09-13",
        ptoBudget: 0,
        holidays: [],
      }),
    ).toMatchObject({ startDate: "2026-09-05", endDate: "2026-09-06" });
  });

  it("finds a break with zero PTO across a daylight-saving transition", () => {
    expect(
      planBestBreak({
        startDate: "2026-10-30",
        endDate: "2026-11-02",
        ptoBudget: 0,
        holidays: ["2026-11-02"],
        blockedDates: ["2026-11-01", "2026-11-02"],
      }),
    ).toEqual({
      startDate: "2026-10-31",
      endDate: "2026-11-02",
      totalDaysOff: 3,
      ptoDates: [],
      ptoRemaining: 0,
    });
  });

  it("returns null when no day in the range can be taken off", () => {
    expect(
      planBestBreak({ ...example, endDate: example.startDate, ptoBudget: 0 }),
    ).toBeNull();
  });

  it.each([
    { startDate: "2026-9-04" },
    { endDate: "2026-09-03" },
    { ptoBudget: 1.5 },
    { ptoBudget: -1 },
    { holidays: ["2026-02-30"] },
  ])("rejects invalid inputs (%j)", (overrides) => {
    expect(() => planBestBreak({ ...example, ...overrides })).toThrow(RangeError);
  });
});
