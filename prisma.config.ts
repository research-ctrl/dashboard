import "dotenv/config";
import path from "node:path";

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 keeps connection URLs here rather than in schema.prisma.
 * Values come from .env, which is gitignored.
 *
 * This file is only read by the Prisma CLI, so it points at the SESSION
 * pooler (port 5432). The schema engine needs session-level advisory locks
 * and prepared statements, which the transaction pooler on 6543 does not
 * support — aim it there and `db push` connects and then hangs forever.
 *
 * The running app is unaffected: src/lib/prisma.ts uses DATABASE_URL (6543),
 * which is the right choice for short serverless queries.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DIRECT_URL"),
  },
});
