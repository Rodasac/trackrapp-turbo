import { db, schema } from "@repo/database";
import { requireAdmin } from "@/lib/api/helpers";
import { count, countDistinct, gte, inArray, eq } from "drizzle-orm";
import type { AdminStatsResponse } from "@/lib/types/api";

export async function GET(request: Request) {
  const result = await requireAdmin(request);
  if ("error" in result) return result.error;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total users
  const [{ count: totalUsers }] = await db
    .select({ count: count() })
    .from(schema.users);

  // Active users in last 30 days (distinct users with a session)
  const [{ count: activeUsers30d }] = await db
    .select({ count: countDistinct(schema.sessions.userId) })
    .from(schema.sessions)
    .where(gte(schema.sessions.createdAt, thirtyDaysAgo));

  // Pro users (active or trialing subscription)
  const [{ count: proUsers }] = await db
    .select({ count: count() })
    .from(schema.subscriptions)
    .where(inArray(schema.subscriptions.status, ["active", "trialing"]));

  // Total tracked subscriptions
  const [{ count: totalSubscriptions }] = await db
    .select({ count: count() })
    .from(schema.trackedSubscriptions);

  // Signups in last 7 days
  const [{ count: signups7d }] = await db
    .select({ count: count() })
    .from(schema.users)
    .where(gte(schema.users.createdAt, sevenDaysAgo));

  // Signups in last 30 days
  const [{ count: signups30d }] = await db
    .select({ count: count() })
    .from(schema.users)
    .where(gte(schema.users.createdAt, thirtyDaysAgo));

  // Banned users
  const [{ count: bannedUsers }] = await db
    .select({ count: count() })
    .from(schema.users)
    .where(eq(schema.users.banned, true));

  const freeUsers = Number(totalUsers) - Number(proUsers);

  const stats: AdminStatsResponse = {
    totalUsers: Number(totalUsers),
    activeUsers30d: Number(activeUsers30d),
    proUsers: Number(proUsers),
    freeUsers: Math.max(0, freeUsers),
    totalSubscriptions: Number(totalSubscriptions),
    signups7d: Number(signups7d),
    signups30d: Number(signups30d),
    bannedUsers: Number(bannedUsers),
  };

  return Response.json(stats);
}
