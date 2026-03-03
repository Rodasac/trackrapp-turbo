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
  const resultUsers = await db.select({ count: count() }).from(schema.users);
  const totalUsers = resultUsers[0]?.count ?? 0;

  // Active users in last 30 days (distinct users with a session)
  const resultActiveUsers30d = await db
    .select({ count: countDistinct(schema.sessions.userId) })
    .from(schema.sessions)
    .where(gte(schema.sessions.createdAt, thirtyDaysAgo));
  const activeUsers30d = resultActiveUsers30d[0]?.count ?? 0;

  // Pro users (active or trialing subscription)
  const resultProUsers = await db
    .select({ count: count() })
    .from(schema.subscriptions)
    .where(inArray(schema.subscriptions.status, ["active", "trialing"]));
  const proUsers = resultProUsers[0]?.count ?? 0;

  // Total tracked subscriptions
  const resultTotalSubscriptions = await db
    .select({ count: count() })
    .from(schema.trackedSubscriptions);
  const totalSubscriptions = resultTotalSubscriptions[0]?.count ?? 0;

  // Signups in last 7 days
  const resultSignups7d = await db
    .select({ count: count() })
    .from(schema.users)
    .where(gte(schema.users.createdAt, sevenDaysAgo));
  const signups7d = resultSignups7d[0]?.count ?? 0;

  // Signups in last 30 days
  const resultSignups30d = await db
    .select({ count: count() })
    .from(schema.users)
    .where(gte(schema.users.createdAt, thirtyDaysAgo));
  const signups30d = resultSignups30d[0]?.count ?? 0;

  // Banned users
  const resultBannedUsers = await db
    .select({ count: count() })
    .from(schema.users)
    .where(eq(schema.users.banned, true));
  const bannedUsers = resultBannedUsers[0]?.count ?? 0;

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
