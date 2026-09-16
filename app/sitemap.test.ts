import { describe, expect, it, vi } from "vitest";

import { CALC_IDS, ROUTES } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/utils";

import sitemap from "./sitemap";

// `cacheLife` throws outside a Next cache scope; the directive itself is inert.
vi.mock("next/cache", () => ({ cacheLife: () => undefined }));

const entries = await sitemap();
const urls = new Set(entries.map((e) => e.url));

describe("sitemap", () => {
  it("emits absolute production URLs only", () => {
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/metri\.info(\/|$)/);
    }
  });

  it("never repeats a <loc>", () => {
    expect(urls.size).toBe(entries.length);
  });

  it("carries reciprocal hreflang alternates with x-default = EN", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;
      expect(languages.en).toBeDefined();
      expect(languages.es).toBeDefined();
      expect(languages["x-default"]).toBe(languages.en);
      // Every language version is itself submitted as its own <url>.
      expect(urls.has(languages.en)).toBe(true);
      expect(urls.has(languages.es)).toBe(true);
    }
  });

  it("lists every calculator in both languages", () => {
    for (const id of CALC_IDS) {
      expect(urls.has(absoluteUrl(ROUTES[id].en))).toBe(true);
      expect(urls.has(absoluteUrl(ROUTES[id].es))).toBe(true);
    }
  });

  it("keeps removed routes out", () => {
    for (const url of urls) {
      expect(url).not.toContain("/changelog");
    }
  });
});
