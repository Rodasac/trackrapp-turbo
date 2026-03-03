import { eq } from "drizzle-orm";
import { db, schema } from "@repo/database";

export async function POST(request: Request) {
  if (process.env.PLAYWRIGHT !== "true") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as { email?: string; role?: string };
  const { email, role } = body;

  if (!email || typeof email !== "string") {
    return Response.json({ error: "email is required" }, { status: 400 });
  }
  if (!role || typeof role !== "string") {
    return Response.json({ error: "role is required" }, { status: 400 });
  }

  const result = await db
    .update(schema.users)
    .set({ role })
    .where(eq(schema.users.email, email));

  if ((result as unknown as { rowCount?: number }).rowCount === 0) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
