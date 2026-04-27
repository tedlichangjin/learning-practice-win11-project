import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./shared/schema";

type Database = NodePgDatabase<typeof schema>;

let pool: Pool | null = null;
let db: Database | null = null;

function getDatabaseUrl(): string {
  const databaseUrl =
    process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("NEON_DATABASE_URL or DATABASE_URL is not set");
  }

  return databaseUrl;
}

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl:
      process.env.DATABASE_SSL === "false"
        ? false
        : { rejectUnauthorized: false },
  });

  return pool;
}

export function getDb(): Database {
  if (db) {
    return db;
  }

  db = drizzle(getPool(), { schema });
  return db;
}

export { schema };
