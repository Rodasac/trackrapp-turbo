import { eq } from "drizzle-orm";
import { db, schema } from "@repo/database";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as { email?: string };
  const email = body.email;

  if (!email || typeof email !== "string") {
    return Response.json({ error: "email is required" }, { status: 400 });
  }

  await db
    .update(schema.users)
    .set({ emailVerified: true })
    .where(eq(schema.users.email, email));

  return Response.json({ success: true });
}
