import { describe, expect, it } from "vitest";

import { CALC_IDS } from "@/lib/i18n/routes";

import { CALC_GROUPS } from "./groups";

describe("CALC_GROUPS", () => {
  it("lists every calculator exactly once", () => {
    const listed = CALC_GROUPS.flatMap((g) => g.calcs);
    expect([...listed].sort()).toEqual([...CALC_IDS].sort());
  });
});
