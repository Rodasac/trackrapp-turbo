import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");

  // Use a dedicated connection (not the global HMR singleton) so we can .end() cleanly.
  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // TODO: Insert your seed data here.
  // await db.insert(schema.users).values([...]);

  await client.end();
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});