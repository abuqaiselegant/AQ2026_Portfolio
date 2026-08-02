"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/use-is-mounted";

type ThemeTogglerProps = {
  className?: string;
};

const themes = [
  { value: "system", icon: MonitorIcon },
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
] as const;

export default function ThemeToggler({ className }: ThemeTogglerProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  return (
    <div
      className={cn(
        "relative flex h-6 items-center rounded-full bg-muted p-0.5",
        className
      )}
    >
      {themes.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className="relative z-10 flex size-5 cursor-pointer items-center justify-center rounded-full"
        >
          {mounted && theme === value && (
            <motion.div
              layoutId="theme-toggle-active"
              className="absolute inset-0 rounded-full bg-background shadow-sm dark:bg-neutral-700"
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />
          )}
          <Icon
            className={cn(
              "relative z-10 size-3",
              mounted && theme === value
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          />
          <span className="sr-only">{value}</span>
        </button>
      ))}
    </div>
  );
}
