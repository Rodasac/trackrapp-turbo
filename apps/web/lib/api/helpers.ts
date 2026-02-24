import { auth } from "@/lib/auth";
import type { ZodError } from "zod";

type SessionSuccess = { session: Awaited<ReturnType<typeof auth.api.getSession>> & object };
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
 * Parse a route segment string as a positive integer ID.
 * Returns { idNum } on success or { error: Response } (400) to return early.
 */
export function parseIdParam(
  id: string,
): { idNum: number } | { error: Response } {
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    return { error: Response.json({ error: "Invalid ID" }, { status: 400 }) };
  }
  return { idNum };
}
