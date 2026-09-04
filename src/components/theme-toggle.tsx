"use client";

import { useEffect, useState } from "react";

import { THEME_COOKIE, THEME_MAX_AGE } from "@/lib/theme";

/**
 * Day/night switch, sitting next to the eye.
 *
 * Flips the `dark` class on <html> and writes the cookie in the same click —
 * no server round trip, so the board changes instantly. The cookie is what
 * makes it stick: the next render, whether that is a reload or one of the
 * router.refresh() calls LiveRefresh fires on every sheet edit, already knows
 * the answer and emits the right HTML.
 *
 * The button renders its icon only after mounting. The server cannot know
 * which theme the browser resolved when no cookie is set — that is decided by
 * the bootstrap script reading the OS preference — so rendering an icon on the
 * server would be a coin flip, and a wrong one is both a hydration mismatch
 * and a button that lies about what it does.
 */
function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.8 6.8 0 0 0 10.8 10.8z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", next);
    document.cookie = `${THEME_COOKIE}=${next ? "dark" : "light"};path=/;max-age=${THEME_MAX_AGE};samesite=lax`;

    setDark(next);
  }

  const label = dark ? "Switch to day" : "Switch to night";

  return (
    <button
      type="button"
      onClick={toggle}
      className="bb-icon-btn"
      title={label}
      aria-label={label}
    >
      {/* Empty until mounted, so the button never shows the wrong state. */}
      {dark === null ? null : dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
