import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@repo/database";

export async function POST(request: Request) {
  if (process.env.PLAYWRIGHT !== "true") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as { email?: string };
  const email = body.email;

  if (!email || typeof email !== "string") {
    return Response.json({ error: "email is required" }, { status: 400 });
  }

  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email));

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Remove any existing subscription for this user
  await db
    .delete(schema.subscriptions)
    .where(eq(schema.subscriptions.referenceId, user.id));

  // Insert a Pro subscription
  await db.insert(schema.subscriptions).values({
    id: randomUUID(),
    plan: "pro",
    referenceId: user.id,
    status: "active",
    periodStart: new Date(),
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return Response.json({ success: true });
}
