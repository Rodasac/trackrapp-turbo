import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive()),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().min(1, "SMTP_FROM is required"),
  VAPID_PUBLIC_KEY: z.string().min(1, "VAPID_PUBLIC_KEY is required"),
  VAPID_PRIVATE_KEY: z.string().min(1, "VAPID_PRIVATE_KEY is required"),
  VAPID_SUBJECT: z.string().min(1, "VAPID_SUBJECT is required"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${errors}`);
  }
  return result.data;
}

export interface AiEnv {
  provider: "anthropic" | "openai";
  apiKey: string;
}

/**
 * Validate AI-specific env vars. Returns null if no API key is configured
 * (the job will skip gracefully). Called lazily inside the job, not at startup.
 */
export function validateAiEnv(): AiEnv | null {
  const provider = (process.env.AI_PROVIDER || "anthropic") as "anthropic" | "openai";
  const apiKey =
    provider === "openai"
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return null;

  return { provider, apiKey };
}
