"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/use-is-mounted";

const STORAGE_KEY = "portfolio-margin";

type SectionKey = "quotes" | "goals" | "resources" | "random";

const DEFAULTS: Record<SectionKey, string> = {
  quotes: "Drop a line that keeps you going.",
  goals: "What's next? Ship it here.",
  resources: "Links, books, tools worth revisiting.",
  random: "A thought, a line, a fragment.",
};

function readStoredData(): Record<SectionKey, string> {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<SectionKey, string>>;
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULTS;
}

type Props = {
  sectionKeys: readonly SectionKey[];
  sectionLabels: Record<SectionKey, string>;
};

export function StardustContent({ sectionKeys, sectionLabels }: Props) {
  const [data, setData] = useState<Record<SectionKey, string>>(readStoredData);
  const [active, setActive] = useState<SectionKey>(sectionKeys[0]);
  const mounted = useIsMounted();
  const [shake, setShake] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  const update = (k: SectionKey, value: string) => {
    setData((prev) => ({ ...prev, [k]: value }));
  };

  const changeSection = useCallback((next: SectionKey) => {
    setActive(next);
    setKey((k) => k + 1);
    setShake(true);
    const t = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-40 mb-4 bg-muted/50 rounded" />
        <div className="h-20 bg-muted/30 rounded" />
      </div>
    );
  }

  const value = data[active] ?? DEFAULTS[active];
  const placeholder = DEFAULTS[active];

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "group relative inline-block",
          shake && "margin-shake"
        )}
      >
        <select
          value={active}
          onChange={(e) => changeSection(e.target.value as SectionKey)}
          className={cn(
            "appearance-none bg-transparent pr-8 py-1.5 text-sm text-muted-foreground",
            "border-0 border-b border-border/60 cursor-pointer",
            "focus:outline-none focus:border-foreground/40 focus:text-foreground",
            "transition-[color,border-color] duration-200"
          )}
          aria-label="Choose section"
        >
          {sectionKeys.map((k) => (
            <option key={k} value={k}>
              {sectionLabels[k]}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none transition-transform duration-300 group-focus-within:rotate-180"
          strokeWidth={2}
        />
      </div>

      <div key={key} className="margin-in">
        <textarea
          value={value}
          onChange={(e) => update(active, e.target.value)}
          placeholder={placeholder}
          rows={5}
          className={cn(
            "w-full resize-none bg-transparent text-foreground text-sm leading-relaxed",
            "border-0 placeholder:text-muted-foreground/70",
            "focus:outline-none focus:ring-0"
          )}
        />
      </div>
    </div>
  );
}
