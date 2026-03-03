import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

type Schema = typeof schema;

function createDatabase(): PostgresJsDatabase<Schema> {
  const url =
    process.env.DATABASE_URL ??
    "postgresql://trackrapp:trackrapp@localhost:5432/trackrapp";
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema });
}

// In development, reuse the connection across Next.js HMR reloads to avoid
// exhausting the PostgreSQL connection pool.
declare global {
  var _db: PostgresJsDatabase<Schema> | undefined;
}

export const db: PostgresJsDatabase<Schema> = global._db ?? createDatabase();

if (process.env.NODE_ENV !== "production") global._db = db;
