/**
 * Which theme the board renders in.
 *
 * Kept in a cookie rather than localStorage for one reason: the board
 * re-renders on the server constantly. LiveRefresh calls router.refresh() on
 * every sheet edit AND every time the tab regains focus, and the page is
 * force-dynamic. A theme the server cannot see would be re-rendered light,
 * then corrected by JavaScript — a white flash every time anyone edits a
 * sheet. Reading the cookie server-side means the first byte of HTML is
 * already right.
 *
 * Deliberately free of imports. Both the server layout and the client toggle
 * need these, and anything reaching for next/headers here would be dragged
 * into the browser bundle, which is a build error.
 */
export const THEME_COOKIE = "bb-theme";

export type Theme = "light" | "dark";

/** A year. The choice should outlive the session that made it. */
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Runs before first paint, and only when no choice has been stored.
 *
 * Without it a viewer whose OS is set to dark gets a light board until they
 * find the toggle. With it, they get dark immediately and the toggle still
 * overrides. Inline and synchronous on purpose: deferring it would paint the
 * wrong theme first, which is the flash this whole arrangement exists to
 * avoid.
 */
export const THEME_BOOTSTRAP = `try{if(matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.classList.add('dark')}catch(e){}`;

/** Narrows a raw cookie value; null means "never chosen". */
export function parseTheme(value: string | undefined): Theme | null {
  return value === "dark" || value === "light" ? value : null;
}
