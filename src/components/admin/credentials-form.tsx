"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/admin/actions";

const field =
  "w-full rounded-md border border-line-strong px-3 py-2 text-sm text-ink outline-none focus:border-ink-dim";
const label = "mb-1 block text-[10px] tracking-[0.12em] text-ink-dim uppercase";

export function CredentialsForm({
  action,
  submitLabel,
  withConfirm = false,
  next,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  withConfirm?: boolean;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <label className={label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={withConfirm ? "new-password" : "current-password"}
          required
          className={field}
        />
      </div>

      {withConfirm && (
        <div>
          <label className={label} htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className={field}
          />
        </div>
      )}

      {state.error && (
        <p className="rounded-md border bb-badge-danger border px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-md border border-ink bg-ink px-3 py-2 text-sm text-canvas transition-colors hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Working…" : submitLabel}
      </button>
    </form>
  );
}
