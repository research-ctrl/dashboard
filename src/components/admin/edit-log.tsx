"use client";

import { useActionState } from "react";

import {
  clearSheetEdits,
  deleteSheetEdit,
  type ActionState,
} from "@/app/admin/actions";

export type LogEntry = {
  id: string;
  chapterId: string;
  chapterName: string;
  tab: string;
  column: string;
  owner: string;
  rowLabel: string;
  oldValue: string;
  newValue: string;
  /** Pre-formatted on the server, in the chapter's own time zone. */
  stamp: string;
};

function DeleteButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteSheetEdit,
    {},
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title={state.error ?? "Delete this entry"}
        className="cursor-pointer text-[11px] text-ink-faint underline underline-offset-2 transition-colors hover:text-danger disabled:cursor-wait"
      >
        {pending ? "…" : "delete"}
      </button>
    </form>
  );
}

function ClearAllButton() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    clearSheetEdits,
    {},
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        title={state.error ?? "Delete every entry"}
        className="cursor-pointer rounded-md border border-line px-2 py-1 text-[11px] text-ink-dim transition-colors hover:border-danger hover:text-danger disabled:cursor-wait"
      >
        {pending ? "Clearing…" : "Clear all"}
      </button>
    </form>
  );
}

export function EditLog({ entries }: { entries: LogEntry[] }) {
  return (
    <section className="mt-6 rounded-xl border border-line p-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[10px] font-medium tracking-[0.15em] text-ink-dim uppercase">
          Update log
        </h2>
        {entries.length > 0 && <ClearAllButton />}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-ink-dim">
        Every sheet edit the dashboard was told about. The newest entry per
        chapter is what scrolls along the bottom of the board. Only the last 100
        per chapter are kept.
      </p>

      {entries.length === 0 ? (
        <p className="mt-3 text-[11px] text-ink-faint">
          Nothing logged yet — edit a sheet and it will appear here.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-baseline justify-between gap-3 text-[11px]"
            >
              <span className="min-w-0">
                <span className="text-ink-faint">{entry.stamp}</span>{" "}
                <span className="font-medium text-ink">
                  {entry.chapterName}
                </span>{" "}
                {entry.owner && (
                  <span className="text-ink">{entry.owner}</span>
                )}{" "}
                <span className="text-ink-dim">
                  {entry.tab}
                  {entry.rowLabel ? ` · ${entry.rowLabel}` : ""}
                  {entry.column ? ` · ${entry.column}` : ""}
                </span>
                {(entry.oldValue || entry.newValue) && (
                  <>
                    {" "}
                    <span className="text-danger line-through">
                      {entry.oldValue || "blank"}
                    </span>
                    <span className="text-ink-faint"> → </span>
                    <span className="text-positive">
                      {entry.newValue || "blank"}
                    </span>
                  </>
                )}
              </span>
              <DeleteButton id={entry.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
