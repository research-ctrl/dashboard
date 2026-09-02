import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Check .env.");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function getPrismaClient(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}

/**
 * Lazy on purpose. `next build` imports every route module to collect its
 * config, so a client constructed at module scope makes a missing
 * DATABASE_URL fail the whole build rather than degrade at runtime — the
 * route's own try/catch never gets the chance to run.
 *
 * Cached on globalThis so hot reload does not open a pool per edit.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    // Never let `await prisma` or an async return construct the client.
    if (property === "then") return undefined;

    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
