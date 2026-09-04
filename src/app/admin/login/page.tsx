import { redirect } from "next/navigation";

import { signIn } from "@/app/admin/actions";
import { CredentialsForm } from "@/components/admin/credentials-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { needsSetup } from "@/lib/auth";

export const metadata = { title: "Sign in" };

// Reads cookies and the database on every request; never prerender it.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await needsSetup()) redirect("/admin/setup");

  const { next } = await searchParams;

  return (
    <main className="flex-1 bg-canvas">
      <div className="mx-auto w-full max-w-sm px-4 py-16">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-medium tracking-[0.2em] text-ink uppercase">
            Sign in
          </h1>
          <ThemeToggle />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-mute">
          {next && next !== "/admin"
            ? "Sign in to see the board."
            : "Admin access to the connection settings."}
        </p>

        <CredentialsForm action={signIn} submitLabel="Sign in" next={next} />
      </div>
    </main>
  );
}
