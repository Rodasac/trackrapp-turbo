import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../src/logger.js", () => {
  const noop = () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
  });
  return {
    autoRenewLog: noop(),
    workerLog: noop(),
    remindersLog: noop(),
    cleanupLog: noop(),
    aiTipsLog: noop(),
    runJobLog: noop(),
    aiServiceLog: noop(),
  };
});

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: {
    array: vi.fn(() => null),
  },
}));

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: vi.fn(() => "mock-anthropic-model"),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mock-openai-model"),
}));

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  getAiModel,
  buildPrompt,
  parseTipsResponse,
  generateTipsForUser,
} from "../../src/services/ai.js";

describe("AI service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAiModel", () => {
    it("returns anthropic model for anthropic provider", () => {
      getAiModel("anthropic");
      expect(anthropic).toHaveBeenCalledWith("claude-sonnet-4-6");
    });

    it("returns openai model for openai provider", () => {
      getAiModel("openai");
      expect(openai).toHaveBeenCalledWith("gpt-5-mini");
    });
  });

  describe("buildPrompt", () => {
    it("includes subscription names, prices, and total spend", () => {
      const subs = [
        {
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: "Streaming",
        },
        {
          name: "Spotify",
          price: "9.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: "Music",
        },
      ];
      const { system, user } = buildPrompt(subs, 25.98);
      expect(system).toContain("financial advisor");
      expect(user).toContain("Netflix");
      expect(user).toContain("15.99");
      expect(user).toContain("Spotify");
      expect(user).toContain("25.98");
    });

    it("includes billing cycle and category in prompt", () => {
      const subs = [
        {
          name: "Adobe CC",
          price: "54.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: "Software",
        },
      ];
      const { user } = buildPrompt(subs, 54.99);
      expect(user).toContain("monthly");
      expect(user).toContain("Software");
    });

    it("does NOT include language instruction for en locale", () => {
      const subs = [
        {
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: null,
        },
      ];
      const { system } = buildPrompt(subs, 15.99, "en");
      expect(system).not.toContain("IMPORTANT: All tip titles");
    });

    it("includes Spanish language instruction for es locale", () => {
      const subs = [
        {
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: null,
        },
      ];
      const { system } = buildPrompt(subs, 15.99, "es");
      expect(system).toContain("Spanish");
      expect(system).toContain(
        "IMPORTANT: All tip titles and messages must be written in Spanish",
      );
    });

    it("does NOT include language instruction when locale defaults to en", () => {
      const subs = [
        {
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: null,
        },
      ];
      const { system } = buildPrompt(subs, 15.99);
      expect(system).not.toContain("IMPORTANT: All tip titles");
    });
  });

  describe("parseTipsResponse", () => {
    it("parses valid JSON array", () => {
      const json = JSON.stringify([
        {
          title: "Save money",
          message: "Switch to annual",
          category: "savings",
        },
      ]);
      const tips = parseTipsResponse(json);
      expect(tips).toHaveLength(1);
      expect(tips[0].title).toBe("Save money");
    });

    it("extracts JSON from markdown code blocks", () => {
      const text =
        "Here are your tips:\n```json\n" +
        JSON.stringify([{ title: "Tip", message: "Msg", category: "info" }]) +
        "\n```";
      const tips = parseTipsResponse(text);
      expect(tips).toHaveLength(1);
    });

    it("returns empty array for malformed JSON", () => {
      const tips = parseTipsResponse("not json at all");
      expect(tips).toEqual([]);
    });

    it("caps at 5 tips", () => {
      const sixTips = Array.from({ length: 6 }, (_, i) => ({
        title: `Tip ${i}`,
        message: `Message ${i}`,
        category: "info",
      }));
      const tips = parseTipsResponse(JSON.stringify(sixTips));
      expect(tips).toHaveLength(5);
    });

    it("filters out tips with invalid category", () => {
      const tips = parseTipsResponse(
        JSON.stringify([
          { title: "Valid", message: "Msg", category: "savings" },
          { title: "Invalid", message: "Msg", category: "unknown" },
        ]),
      );
      expect(tips).toHaveLength(1);
      expect(tips[0].title).toBe("Valid");
    });
  });

  describe("generateTipsForUser", () => {
    it("calls generateText and returns parsed tips", async () => {
      const mockTips = [
        {
          title: "Save on streaming",
          message: "Consider annual plan",
          category: "savings",
        },
      ];
      vi.mocked(generateText).mockResolvedValue({
        text: JSON.stringify(mockTips),
      } as never);

      const subs = [
        {
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: "Streaming",
        },
      ];
      const model = getAiModel("anthropic");
      const tips = await generateTipsForUser(model, subs, 15.99);
      expect(generateText).toHaveBeenCalledOnce();
      expect(tips).toHaveLength(1);
      expect(tips[0].title).toBe("Save on streaming");
    });

    it("returns empty array when generateText throws", async () => {
      vi.mocked(generateText).mockRejectedValue(new Error("API error"));

      const model = getAiModel("anthropic");
      const tips = await generateTipsForUser(model, [], 0);
      expect(tips).toEqual([]);
    });

    it("passes locale to buildPrompt (es locale includes Spanish in system prompt)", async () => {
      vi.mocked(generateText).mockResolvedValue({
        text: JSON.stringify([
          {
            title: "Ahorra",
            message: "Cambia al plan anual",
            category: "savings",
          },
        ]),
      } as never);

      const subs = [
        {
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          categoryName: null,
        },
      ];
      const model = getAiModel("anthropic");
      await generateTipsForUser(model, subs, 15.99, "es");

      const callArgs = vi.mocked(generateText).mock.calls[0][0] as {
        system: string;
      };
      expect(callArgs.system).toContain("Spanish");
    });
  });
});
