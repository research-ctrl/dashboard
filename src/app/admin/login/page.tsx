import { redirect } from "next/navigation";

import { signIn } from "@/app/admin/actions";
import { CredentialsForm } from "@/components/admin/credentials-form";
import { needsSetup } from "@/lib/auth";

export const metadata = { title: "Sign in" };

// Reads cookies and the database on every request; never prerender it.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await needsSetup()) redirect("/admin/setup");

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto w-full max-w-sm px-4 py-16">
        <h1 className="text-lg font-medium tracking-[0.2em] text-neutral-900 uppercase">
          Sign in
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-neutral-600">
          Admin access to the connection settings.
        </p>

        <CredentialsForm action={signIn} submitLabel="Sign in" />
      </div>
    </main>
  );
}
