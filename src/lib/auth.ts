import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * A valid Supabase JWT is not enough — the user must also be listed in
 * admin_users. Signing up in Supabase by any other route grants nothing.
 */
export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!admin) return null;

  return { id: user.id, email: admin.email };
}

/** True while no admin exists — the only time /admin/setup will run. */
export async function needsSetup() {
  return (await prisma.adminUser.count()) === 0;
}
