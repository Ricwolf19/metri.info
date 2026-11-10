import { describe, expect, it } from "vitest";

import { HTML_LANG_SCRIPT, localeForPathname } from "./html-lang";

/** Runs the inline script against a fake `location` / `document`. */
const langAfterScript = (pathname: string): string => {
  const documentElement = { lang: "en" };
  new Function("location", "document", HTML_LANG_SCRIPT)(
    { pathname },
    { documentElement },
  );
  return documentElement.lang;
};

const PATHS = [
  "/",
  "/es",
  "/es/",
  "/es/herramientas/1rm",
  "/docs",
  "/tools/tdee",
  "/estimate",
  "/escape/es",
];

describe("html lang", () => {
  it("reads Spanish only under /es", () => {
    expect(localeForPathname("/es")).toBe("es");
    expect(localeForPathname("/es/docs/rir")).toBe("es");
    expect(localeForPathname("/")).toBe("en");
    expect(localeForPathname("/estimate")).toBe("en");
  });

  it("the inline script agrees with localeForPathname on every path", () => {
    for (const path of PATHS) {
      expect(langAfterScript(path)).toBe(localeForPathname(path));
    }
  });
});
