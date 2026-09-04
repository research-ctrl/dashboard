"use client";

import { useEffect, useState } from "react";

/**
 * Live local time for a chapter.
 *
 * Uses the browser's built-in Intl timezone database — correct year round,
 * daylight saving included, with no dependency to keep updated.
 */
export function ChapterClock({
  timeZone,
  label,
  accentClass,
}: {
  /** IANA zone, e.g. "Asia/Kolkata" or "Europe/Lisbon". */
  timeZone: string;
  label: string;
  accentClass: string;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const tick = () => setTime(formatter.format(new Date()));
    tick();

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return (
    <div className="shrink-0 text-right leading-tight">
      <div className={`text-base tabular-nums ${accentClass}`}>
        {time ?? "--:--:--"}
      </div>
      <div className="text-[10px] tracking-[0.15em] text-ink-dim uppercase">
        {label}
      </div>
    </div>
  );
}
