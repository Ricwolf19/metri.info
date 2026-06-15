"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeScheme = "light" | "dark";
export type ThemePreference = "system" | "light" | "dark";

export const THEME_COOKIE = "metri_theme";

/** Accent text color per scheme — matches mobile's `useTheme().accent`
 * (lime-400 on dark, lime-700 on light) so icon `color=` props stay legible. */
const ACCENT: Record<ThemeScheme, string> = {
  dark: "#bef82b",
  light: "#65a30d",
};

type ThemeContextValue = {
  /** Resolved scheme actually applied to the document. */
  scheme: ThemeScheme;
  /** User's stored choice. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Legible accent hex for the current scheme (icons, charts). */
  accent: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const systemScheme = (): ThemeScheme =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const resolve = (preference: ThemePreference): ThemeScheme =>
  preference === "system" ? systemScheme() : preference;

export const ThemeProvider = ({
  initialPreference = "dark",
  children,
}: {
  initialPreference?: ThemePreference;
  children: React.ReactNode;
}) => {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(initialPreference);
  const [scheme, setScheme] = useState<ThemeScheme>(() =>
    resolve(initialPreference),
  );

  // On mount, adopt the persisted preference (the no-flash script already
  // applied the matching data-theme before paint).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_COOKIE);
      if (stored === "light" || stored === "dark" || stored === "system") {
        // One-time sync from the persisted store after hydration (the no-flash
        // script already applied the matching theme before paint).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferenceState(stored);
      }
    } catch {}
  }, []);

  // Apply the resolved scheme to <html> and react to system changes.
  useEffect(() => {
    const apply = () => {
      const next = resolve(preference);
      setScheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    apply();
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(THEME_COOKIE, next);
    } catch {}
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, preference, setPreference, accent: ACCENT[scheme] }),
    [scheme, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>.");
  return ctx;
};
