"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { DocsIndex } from "@/components/command/CommandPalette";

/** Dispatch this to open the palette from anywhere (e.g. the header button). */
export const CMDK_EVENT = "metri:cmdk";

// Lazy — the palette (and its 20+ command icons) only enters the bundle the
// first time it's opened, so it never weighs on initial page load.
const CommandPalette = dynamic(
  () =>
    import("@/components/command/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false },
);

/**
 * Mounts the ⌘K / Ctrl+K listener globally and renders the palette on first
 * use. Also opens on the `CMDK_EVENT` custom event (used by the header button).
 * `docsIndex` is built server-side (in the layout) and passed in so the palette
 * can list docs without a client-side filesystem read.
 */
export const CommandPaletteMount = ({
  docsIndex,
}: {
  docsIndex: DocsIndex;
}) => {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Bumped on every open so the palette remounts fresh (empty query, first item
  // active) without resetting state inside an effect.
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    const openPalette = () => {
      setLoaded(true);
      setSeq((s) => s + 1);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (o) return false;
          setLoaded(true);
          setSeq((s) => s + 1);
          return true;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(CMDK_EVENT, openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(CMDK_EVENT, openPalette);
    };
  }, []);

  if (!loaded) return null;
  return (
    <CommandPalette
      key={seq}
      open={open}
      onOpenChange={setOpen}
      docsIndex={docsIndex}
    />
  );
};
