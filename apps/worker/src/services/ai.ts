import { generateText, type LanguageModel, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { groq } from "@ai-sdk/groq";
import { aiServiceLog } from "../logger.js";

export interface SubscriptionForPrompt {
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  categoryName: string | null;
}

const tipSchema = z.object({
  title: z.string(),
  message: z.string(),
  category: z.enum(["savings", "warning", "info", "comparison"]),
});

export function getAiModel(
  provider: "anthropic" | "openai" | "groq",
): LanguageModel {
  if (provider === "openai") {
    return openai("gpt-5-mini");
  } else if (provider === "groq") {
    return groq("moonshotai/kimi-k2-instruct-0905");
  }
  return anthropic("claude-sonnet-4-6");
}

export function buildPrompt(
  subs: SubscriptionForPrompt[],
  totalMonthlySpend: number,
): { system: string; user: string } {
  const subList = subs
    .map(
      (s) =>
        `- ${s.name}: ${s.currency} ${s.price}/${s.billingCycle}${s.categoryName ? ` (${s.categoryName})` : ""}`,
    )
    .join("\n");

  const system = `You are a helpful financial advisor specializing in subscription management. Analyze the user's subscriptions and provide 3-5 actionable tips. Each tip must have a title (short headline), message (detailed advice, 1-2 sentences), and category (one of: savings, warning, info, comparison). Respond with a JSON array only, no markdown wrapping.`;

  const user = `Here are my current subscriptions (total monthly spend: $${totalMonthlySpend.toFixed(2)}):

${subList}

Provide 3-5 personalized tips as a JSON array of objects with "title", "message", and "category" fields.`;

  return { system, user };
}

export function parseTipsResponse(text: string): {
  title: string;
  message: string;
  category: "savings" | "warning" | "info" | "comparison";
}[] {
  // Try to extract JSON from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = (codeBlockMatch ? codeBlockMatch[1] : undefined) ?? text;

  try {
    const parsed = JSON.parse(jsonStr.trim());
    const items: unknown = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { elements?: unknown }).elements)
        ? (parsed as { elements: unknown[] }).elements
        : null;

    if (!items) {
      return [];
    }

    const validated = (items as unknown[])
      .map((item: unknown) => {
        const result = tipSchema.safeParse(item);
        return result.success ? result.data : null;
      })
      .filter((t): t is z.infer<typeof tipSchema> => t !== null);

    return validated.slice(0, 5);
  } catch {
    return [];
  }
}

export async function generateTipsForUser(
  model: LanguageModel,
  subs: SubscriptionForPrompt[],
  totalMonthlySpend: number,
): Promise<
  {
    title: string;
    message: string;
    category: "savings" | "warning" | "info" | "comparison";
  }[]
> {
  try {
    const { system, user } = buildPrompt(subs, totalMonthlySpend);
    const result = await generateText({
      model,
      system,
      prompt: user,
      output: Output.array({
        element: tipSchema,
      }),
    });
    return parseTipsResponse(result.text);
  } catch (error) {
    aiServiceLog.error({ err: error }, "Failed to generate tips");
    return [];
  }
}
