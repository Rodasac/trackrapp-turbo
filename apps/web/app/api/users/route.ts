import { db, schema } from "@repo/database";

export async function GET() {
  const users = await db.select().from(schema.users);
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name: string; email: string };
  const [user] = await db
    .insert(schema.users)
    .values({ name: body.name, email: body.email })
    .returning();
  return Response.json(user, { status: 201 });
}