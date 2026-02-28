import { eq } from "drizzle-orm";
import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import type { AccountProviderResponse } from "@/lib/types/api";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const accounts = await db
    .select({ providerId: schema.accounts.providerId })
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, session.user.id));

  // Default to "credential" if no account found (shouldn't happen, but safe fallback)
  const providerId = accounts[0]?.providerId ?? "credential";

  const response: AccountProviderResponse = {
    provider: providerId === "google" ? "google" : "credential",
  };

  return Response.json(response);
}
