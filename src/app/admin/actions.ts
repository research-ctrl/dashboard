"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser, needsSetup } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export type ActionState = { error?: string };

const MIN_PASSWORD = 10;

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

/**
 * Creates the very first admin. Refuses once one exists, so the open page
 * closes itself the moment it has been used.
 */
export async function setupFirstAdmin(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await needsSetup())) {
    return { error: "An admin already exists. Use the login page." };
  }

  const { email, password } = readCredentials(formData);

  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== String(formData.get("confirm") ?? "")) {
    return { error: "The two passwords do not match." };
  }

  let userId: string;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      return { error: error?.message ?? "Supabase did not return a user." };
    }
    userId = data.user.id;
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Setup failed." };
  }

  await prisma.adminUser.create({ data: { id: userId, email } });
  await seedChapterConnections();

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return { error: `Admin created, but sign-in failed: ${signInError.message}` };
  }

  redirect("/admin");
}

export async function signIn(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { email, password } = readCredentials(formData);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Wrong email or password." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: data.user.id },
  });

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "That account is not an admin here." };
  }

  // Only ever an in-app path, so a crafted ?next= cannot bounce elsewhere.
  const next = String(formData.get("next") ?? "");
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  redirect(target);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Chapters the dashboard already renders, so the form has rows to fill in. */
async function seedChapterConnections() {
  const seeds = [
    { id: "goa", name: "Goa Chapter" },
    { id: "portugal", name: "Portugal Chapter" },
  ];

  for (const seed of seeds) {
    await prisma.chapterConnection.upsert({
      where: { id: seed.id },
      update: {},
      create: seed,
    });
  }
}

export async function saveConnection(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await getAdminUser())) {
    return { error: "Not signed in." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing chapter id." };

  // Accept a pasted Sheets URL or a bare id; store the id either way.
  const raw = String(formData.get("spreadsheetId") ?? "").trim();
  const fromUrl = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = fromUrl ? fromUrl[1] : raw;

  const crmYear = Number(formData.get("crmYear") ?? 0);

  await prisma.chapterConnection.update({
    where: { id },
    data: {
      spreadsheetId,
      projectsTab: String(formData.get("projectsTab") ?? "Live Projects"),
      pipelineTab: String(formData.get("pipelineTab") ?? "Pipeline"),
      opexTab: String(formData.get("opexTab") ?? "Opex"),
      liabilitiesTab: String(formData.get("liabilitiesTab") ?? "Liabilities"),
      crmTab: String(formData.get("crmTab") ?? "CRM Collection"),
      crmYear: Number.isFinite(crmYear) && crmYear > 0 ? crmYear : 2026,
    },
  });

  revalidatePath("/admin");
  return {};
}

/**
 * Nudge every open board.
 *
 * Removing entries only changed the database, so a board already on screen
 * kept showing what had just been deleted until someone refreshed it. Bumping
 * sync_state pushes through Supabase Realtime, exactly as a sheet edit does.
 */
async function pushToOpenBoards(source: string) {
  await prisma.syncState.upsert({
    where: { id: "global" },
    update: { version: { increment: 1 }, source },
    create: { id: "global", version: 1, source },
  });
}

/** Remove a single log entry — e.g. a test edit that is not worth keeping. */
export async function deleteSheetEdit(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await getAdminUser())) return { error: "Not signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing entry id." };

  await prisma.sheetEdit.delete({ where: { id } });
  await pushToOpenBoards("log entry deleted");

  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}

/** Empty the whole log. The board's strip disappears until the next edit. */
export async function clearSheetEdits(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await getAdminUser())) return { error: "Not signed in." };

  const chapterId = String(formData.get("chapterId") ?? "");

  await prisma.sheetEdit.deleteMany(
    chapterId ? { where: { chapterId } } : undefined,
  );
  await pushToOpenBoards("log cleared");

  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}
