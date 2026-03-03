import { auth } from "@/lib/auth";
import { db, schema } from "@repo/database";
import { and, eq, inArray } from "drizzle-orm";
import type { ZodError } from "zod";

type SessionSuccess = {
  session: Awaited<ReturnType<typeof auth.api.getSession>> & object;
};
type SessionError = { error: Response };

/**
 * Authenticate the incoming request.
 * Returns { session } on success or { error: Response } (401) to return early.
 */
export async function requireSession(
  request: Request,
): Promise<SessionSuccess | SessionError> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}

/**
 * Build a 400 validation-error response from a Zod parse failure.
 */
export function validationErrorResponse(zodError: ZodError): Response {
  return Response.json(
    { error: "Validation failed", issues: zodError.issues },
    { status: 400 },
  );
}

/**
 * Check that a user has an active or trialing Pro subscription.
 * Admin users are treated as Pro regardless of subscription status.
 * Returns { isPro: true } or { error: Response } (403).
 */
export async function requireProSubscription(
  userId: string,
  userRole?: string,
): Promise<{ isPro: true } | { error: Response }> {
  if (userRole === "admin") {
    return { isPro: true };
  }
  const [proRecord] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.referenceId, userId),
        inArray(schema.subscriptions.status, ["active", "trialing"]),
      ),
    );

  if (!proRecord) {
    return {
      error: Response.json(
        { error: "Pro subscription required" },
        { status: 403 },
      ),
    };
  }

  return { isPro: true };
}

/**
 * Verify the request is authenticated AND the user has the "admin" role.
 * Returns { session } or { error: Response } (401/403).
 */
export async function requireAdmin(
  request: Request,
): Promise<SessionSuccess | SessionError> {
  const result = await requireSession(request);
  if ("error" in result) return result;
  const { session } = result;

  if ((session.user as { role?: string }).role !== "admin") {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

/**
 * Parse a route segment string as a positive integer ID.
 * Returns { idNum } on success or { error: Response } (400) to return early.
 */
export function parseIdParam(
  id: string,
): { idNum: number } | { error: Response } {
  const idNum = parseInt(id);
  if (isNaN(idNum) || idNum <= 0) {
    return { error: Response.json({ error: "Invalid ID" }, { status: 400 }) };
  }
  return { idNum };
}
