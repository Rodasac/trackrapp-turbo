import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

type Schema = typeof schema;

function createDatabase(): PostgresJsDatabase<Schema> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema });
}

// In development, reuse the connection across Next.js HMR reloads to avoid
// exhausting the PostgreSQL connection pool.
declare global {
  // eslint-disable-next-line no-var
  var _db: PostgresJsDatabase<Schema> | undefined;
}

export const db: PostgresJsDatabase<Schema> =
  global._db ?? createDatabase();

if (process.env.NODE_ENV !== "production") global._db = db;