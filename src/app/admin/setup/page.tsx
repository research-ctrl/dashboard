import { redirect } from "next/navigation";

import { setupFirstAdmin } from "@/app/admin/actions";
import { CredentialsForm } from "@/components/admin/credentials-form";
import { needsSetup } from "@/lib/auth";

export const metadata = { title: "First admin" };

// Reads cookies and the database on every request; never prerender it.
export const dynamic = "force-dynamic";

/** Open only while no admin exists. It closes itself after the first run. */
export default async function SetupPage() {
  if (!(await needsSetup())) redirect("/admin/login");

  return (
    <main className="flex-1 bg-canvas">
      <div className="mx-auto w-full max-w-sm px-4 py-16">
        <h1 className="text-lg font-medium tracking-[0.2em] text-ink uppercase">
          First admin
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-ink-mute">
          No admin exists yet. Create one and this page shuts itself off - after
          this, everyone signs in at /admin/login.
        </p>

        <CredentialsForm action={setupFirstAdmin} submitLabel="Create admin" withConfirm />
      </div>
    </main>
  );
}
