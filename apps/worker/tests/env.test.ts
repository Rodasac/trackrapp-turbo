import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("validateAiEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns anthropic config when AI_PROVIDER is anthropic", async () => {
    process.env.AI_PROVIDER = "anthropic";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const { validateAiEnv } = await import("../src/env.js");
    const result = validateAiEnv();
    expect(result).toEqual({
      provider: "anthropic",
      apiKey: "sk-ant-test",
    });
  });

  it("returns openai config when AI_PROVIDER is openai", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "sk-test";
    const { validateAiEnv } = await import("../src/env.js");
    const result = validateAiEnv();
    expect(result).toEqual({
      provider: "openai",
      apiKey: "sk-test",
    });
  });

  it("defaults to anthropic when AI_PROVIDER not set", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const { validateAiEnv } = await import("../src/env.js");
    const result = validateAiEnv();
    expect(result).toEqual({
      provider: "anthropic",
      apiKey: "sk-ant-test",
    });
  });

  it("returns null when no API key is set", async () => {
    delete process.env.AI_PROVIDER;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const { validateAiEnv } = await import("../src/env.js");
    const result = validateAiEnv();
    expect(result).toBeNull();
  });
});
