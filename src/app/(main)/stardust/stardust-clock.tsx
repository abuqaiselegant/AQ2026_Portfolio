"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const PUPIL_MAX = 4;

export function StardustClock() {
  const [time, setTime] = useState("");
  const [pupilOffset, setPupilOffset] = useState([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: MouseEvent) => {
    const mx = e.clientX;
    const my = e.clientY;
    const eyes = [leftEyeRef.current, rightEyeRef.current];
    const next = eyes.map((ref) => {
      if (!ref) return { x: 0, y: 0 };
      const rect = ref.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const scale = Math.min(PUPIL_MAX / dist, 1);
      return { x: dx * scale, y: dy * scale };
    });
    setPupilOffset(next);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  useEffect(() => {
    const format = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    format();
    const id = setInterval(format, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 flex flex-col items-center gap-1.5 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm"
      aria-label={`Current time: ${time}`}
    >
      <div className="flex items-center justify-center gap-4">
        <div
          ref={leftEyeRef}
          className="relative size-6 rounded-full bg-foreground/10"
        >
          <div
            className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${pupilOffset[0].x}px), calc(-50% + ${pupilOffset[0].y}px))`,
            }}
          />
        </div>
        <div
          ref={rightEyeRef}
          className="relative size-6 rounded-full bg-foreground/10"
        >
          <div
            className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 transition-transform duration-75"
            style={{
              transform: `translate(calc(-50% + ${pupilOffset[1].x}px), calc(-50% + ${pupilOffset[1].y}px))`,
            }}
          />
        </div>
      </div>
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {time}
      </span>
    </div>
  );
}
