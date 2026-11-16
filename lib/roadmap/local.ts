import { parseRoadmap, type RoadmapState } from "./state";

/** A visitor's roadmap, in this browser (an account's lives only in the
 * `roadmap` row). Same shape as the row, parsed on the way in. */
const KEY = "metri_roadmap";

export const readLocalRoadmap = (): RoadmapState | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseRoadmap(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export const writeLocalRoadmap = (state: RoadmapState | null): void => {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
    else localStorage.removeItem(KEY);
  } catch {}
};
