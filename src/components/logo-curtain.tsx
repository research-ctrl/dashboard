/**
 * The eye blanks the board and shows the company crest.
 * Click the crest screen anywhere to bring the tables back.
 *
 * Deliberately built with no JavaScript and no utility classes: a hidden
 * checkbox drives a plain-CSS sibling rule, and the CSS ships inline with the
 * markup. That means it cannot be broken by a stale Tailwind build, a stale JS
 * bundle, or a failed hydration — the three things that had it silently dead.
 */
const css = `
.bb-toggle {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.bb-toggle:focus-visible + .bb-eye {
  outline: 2px solid var(--bb-ink-dim);
  outline-offset: 2px;
}

.bb-curtain {
  display: none;
}
.bb-toggle:checked ~ .bb-curtain {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--bb-canvas);
  cursor: pointer;
}
.bb-toggle:checked ~ .bb-eye {
  visibility: hidden;
}

.bb-curtain img {
  width: 100%;
  max-width: 560px;
  max-height: 100%;
  height: auto;
  object-fit: contain;
}

.bb-curtain-close {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--bb-ink-faint);
}
`;

function EyeIcon({ closed = false }: { closed?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3.25" />
      {closed && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

export function LogoCurtain() {
  return (
    <>
      <style>{css}</style>

      <input type="checkbox" id="bb-curtain-toggle" className="bb-toggle" />

      <label
        htmlFor="bb-curtain-toggle"
        className="bb-icon-btn bb-eye"
        title="Hide the board"
        aria-label="Hide the board"
      >
        <EyeIcon />
      </label>

      <label
        htmlFor="bb-curtain-toggle"
        className="bb-curtain"
        title="Show the board"
        aria-label="Show the board"
      >
        <span className="bb-curtain-close">
          <EyeIcon closed />
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="The Bennet and Bernard Company" />
      </label>
    </>
  );
}
