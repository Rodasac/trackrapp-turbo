import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { makeQueryClient } from "../query-client";

describe("makeQueryClient", () => {
  it("returns a QueryClient instance", () => {
    expect(makeQueryClient()).toBeInstanceOf(QueryClient);
  });

  it("each call returns a new instance", () => {
    const a = makeQueryClient();
    const b = makeQueryClient();
    expect(a).not.toBe(b);
  });

  it("staleTime is 30 seconds", () => {
    const qc = makeQueryClient();
    expect(qc.getDefaultOptions().queries?.staleTime).toBe(30 * 1000);
  });

  it("gcTime is 5 minutes", () => {
    const qc = makeQueryClient();
    expect(qc.getDefaultOptions().queries?.gcTime).toBe(5 * 60 * 1000);
  });

  it("retry is 1", () => {
    const qc = makeQueryClient();
    expect(qc.getDefaultOptions().queries?.retry).toBe(1);
  });

  it("refetchOnWindowFocus is false", () => {
    const qc = makeQueryClient();
    expect(qc.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });
});
