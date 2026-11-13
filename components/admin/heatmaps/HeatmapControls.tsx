"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/Spinner";

export type ControlOption = { id: string; label: string; hint?: string };

type Key = "page" | "device" | "map" | "count";

/**
 * Page, device, map and count pickers for the heatmaps dashboard. Every change
 * is a URL change (the page renders from the URL), replaced rather than
 * pushed, keeping the date range; a value equal to its default drops out of
 * the URL. Options arrive as plain props so the page catalog stays on the
 * server.
 */
export const HeatmapControls = ({
  options,
  value,
  defaults,
}: {
  options: Record<Key, readonly ControlOption[]>;
  value: Record<Key, string>;
  defaults: Record<Key, string>;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = (key: Key, next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === defaults[key]) params.delete(key);
    else params.set(key, next);
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      }),
    );
  };

  const picker = (key: Key, label: string) => (
    <div className="w-full min-w-0 space-y-1.5 sm:w-auto sm:min-w-52 sm:flex-1 lg:max-w-xs">
      <Label htmlFor={`heatmap-${key}`} className="text-xs text-ink-400">
        {label}
      </Label>
      <Select value={value[key]} onValueChange={(v) => set(key, v)}>
        <SelectTrigger id={`heatmap-${key}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options[key].map((o) => (
            <SelectItem key={o.id} value={o.id} description={o.hint}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const toggle = (key: Key, label: string) => (
    <div className="space-y-1.5">
      <p className="text-xs text-ink-400" id={`heatmap-${key}-label`}>
        {label}
      </p>
      <Segmented
        size="sm"
        aria-labelledby={`heatmap-${key}-label`}
        value={value[key]}
        onValueChange={(v) => set(key, v)}
        options={options[key].map((o) => ({ value: o.id, label: o.label }))}
      />
    </div>
  );

  return (
    <div className="flex flex-wrap items-end gap-4" aria-busy={pending}>
      {picker("page", "Page")}
      {picker("map", "Map")}
      {toggle("device", "Device")}
      {toggle("count", "Count")}
      {pending ? <Spinner className="mb-2.5" /> : null}
    </div>
  );
};
