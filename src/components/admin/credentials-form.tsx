"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/admin/actions";

const field =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500";
const label = "mb-1 block text-[10px] tracking-[0.12em] text-neutral-500 uppercase";

export function CredentialsForm({
  action,
  submitLabel,
  withConfirm = false,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  withConfirm?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
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
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-md border border-neutral-900 bg-neutral-900 px-3 py-2 text-sm text-white transition-colors hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Working…" : submitLabel}
      </button>
    </form>
  );
}
