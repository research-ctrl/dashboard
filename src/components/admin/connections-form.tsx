"use client";

import { useActionState } from "react";

import { saveConnection, type ActionState } from "@/app/admin/actions";
import {
  crmColumns,
  header,
  liabilityColumns,
  opexColumns,
  pipelineColumns,
  projectColumns,
} from "@/data/columns";
import { tabSlots } from "@/data/tabs";
import { ACCENTS, type AccentName } from "@/lib/accents";

export type ConnectionRow = {
  id: string;
  name: string;
  spreadsheetId: string;
  projectsTab: string;
  pipelineTab: string;
  opexTab: string;
  liabilitiesTab: string;
  crmTab: string;
  crmYear: number;
};

/** Which accent each chapter uses on the board. */
const ACCENT_BY_CHAPTER: Record<string, AccentName> = {
  goa: "amber",
  portugal: "indigo",
};

/** The headers each tab is expected to hold, shown as a hint under its field. */
const EXPECTED: Record<(typeof tabSlots)[number]["field"], string[]> = {
  projectsTab: Object.values(projectColumns).map(header),
  pipelineTab: Object.values(pipelineColumns).map(header),
  opexTab: Object.values(opexColumns).map(header),
  liabilitiesTab: Object.values(liabilityColumns).map(header),
  crmTab: [header(crmColumns.month), "…then one column per project"],
};

const TABS = tabSlots.map((slot) => ({
  name: slot.field,
  title: slot.title,
  columns: EXPECTED[slot.field],
}));

const field =
  "w-full rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink-dim";
const label = "mb-1 block text-[10px] tracking-[0.12em] text-ink-dim uppercase";

/** Accepts a full Sheets URL or a bare id, and returns the id. */
export function extractSheetId(input: string): string {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return fromUrl ? fromUrl[1] : trimmed;
}

function ChapterCard({ connection }: { connection: ConnectionRow }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveConnection,
    {},
  );
  const accent = ACCENTS[ACCENT_BY_CHAPTER[connection.id] ?? "amber"];

  return (
    <form
      action={formAction}
      className={`rounded-xl border bg-canvas p-5 ${accent.card}`}
    >
      <input type="hidden" name="id" value={connection.id} />

      <div className="flex items-baseline justify-between gap-4">
        <h2
          className={`text-sm font-medium tracking-[0.18em] uppercase ${accent.title}`}
        >
          {connection.name}
        </h2>
        <span className="text-[10px] tracking-[0.12em] uppercase">
          {connection.spreadsheetId ? (
            <span className="text-positive">Connected</span>
          ) : (
            <span className="text-ink-faint">Not connected</span>
          )}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="sm:col-span-3">
          <label className={label} htmlFor={`${connection.id}-sheet`}>
            Google Sheet link or id
          </label>
          <input
            id={`${connection.id}-sheet`}
            name="spreadsheetId"
            defaultValue={connection.spreadsheetId}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor={`${connection.id}-year`}>
            CRM year
          </label>
          <input
            id={`${connection.id}-year`}
            name="crmYear"
            type="number"
            defaultValue={connection.crmYear}
            className={field}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TABS.map((tab) => (
          <div key={tab.name}>
            <label className={label} htmlFor={`${connection.id}-${tab.name}`}>
              {tab.title} — tab name
            </label>
            <input
              id={`${connection.id}-${tab.name}`}
              name={tab.name}
              defaultValue={connection[tab.name]}
              className={field}
            />
            <details className="mt-1.5">
              <summary className="cursor-pointer text-[11px] text-ink-faint hover:text-ink">
                expected columns
              </summary>
              <ol className="mt-1 list-decimal pl-4 text-[11px] leading-relaxed text-ink-dim">
                {tab.columns.map((column) => (
                  <li key={column}>{column}</li>
                ))}
              </ol>
            </details>
          </div>
        ))}
      </div>

      {state.error && (
        <p className="mt-4 rounded-md border bb-badge-danger border px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 cursor-pointer rounded-md border border-line-strong px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink-dim hover:bg-surface-alt disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function ConnectionsForm({
  connections,
}: {
  connections: ConnectionRow[];
}) {
  return (
    <div className="mt-8 flex flex-col gap-8">
      {connections.map((connection) => (
        <ChapterCard key={connection.id} connection={connection} />
      ))}
    </div>
  );
}
