import { describe, expect, it } from "vitest";

import { PLATE_SETS, plateLoad } from "./strength";

describe("plateLoad", () => {
  it("fills a side greedily with the default kg rack", () => {
    expect(plateLoad(100)).toEqual({
      perSide: 40,
      plates: [
        { plate: 25, count: 1 },
        { plate: 15, count: 1 },
      ],
      remainder: 0,
    });
  });

  it("loads an lb rack in lb: 225 on a 45 bar is two 45s a side", () => {
    expect(plateLoad(225, 45, PLATE_SETS.lb)).toEqual({
      perSide: 90,
      plates: [{ plate: 45, count: 2 }],
      remainder: 0,
    });
  });

  it("reports what no plate on the rack can cover", () => {
    expect(plateLoad(21).remainder).toBe(0.5);
    expect(plateLoad(21, 20, PLATE_SETS.kg).remainder).toBe(0);
  });
});
