import "dotenv/config";
import path from "node:path";

import { defineConfig } from "prisma/config";

/**
 * Prisma 7 keeps connection URLs here rather than in schema.prisma.
 * Values come from .env, which is gitignored.
 *
 * This file is read by the Prisma CLI, so it points at the SESSION pooler
 * (port 5432). The schema engine needs session-level advisory locks and
 * prepared statements, which the transaction pooler on 6543 does not support
 * — aim it there and `db push` connects and then hangs forever.
 *
 * The running app is unaffected: src/lib/prisma.ts uses DATABASE_URL (6543),
 * which is the right choice for short serverless queries.
 *
 * Deliberately NOT prisma/config's env() helper. That throws when a variable
 * is missing, and this file is loaded by `prisma generate` in postinstall —
 * so on a host without DIRECT_URL set, the install fails, the build fails,
 * and the platform silently keeps serving the previous deployment. Generating
 * the client needs no database URL at all, so a missing one must not be fatal.
 */
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: migrationUrl,
  },
});
