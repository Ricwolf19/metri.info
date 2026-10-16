"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SearchIcon, XIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

/** Email / name filter for the users table. Mirrors the value into `?q=` on a
 * debounce so the server component re-queries; the URL stays shareable. */
export const UsersSearch = ({ initialQuery }: { initialQuery: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = (q: string) => {
    const trimmed = q.trim();
    router.replace(
      trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname,
      { scroll: false },
    );
  };

  const onChange = (q: string) => {
    setValue(q);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(q), DEBOUNCE_MS);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    setValue("");
    push("");
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div className="relative mb-6 max-w-md">
      <SearchIcon
        size={16}
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by email or name…"
        aria-label="Search users"
        className="pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
};
