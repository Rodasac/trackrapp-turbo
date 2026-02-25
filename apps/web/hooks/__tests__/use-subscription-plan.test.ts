import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSubscriptionPlan, useIsPro } from "../use-subscription-plan";
import { createWrapper } from "@/tests/test-utils";
import { mockSubscriptionPlan, mockProPlan } from "@/tests/fixtures";

describe("useSubscriptionPlan", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/subscription-plan", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockSubscriptionPlan()), { status: 200 }),
    );

    const { result } = renderHook(() => useSubscriptionPlan(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(url).toBe("/api/subscription-plan");
  });

  it("returns plan data on success", async () => {
    const plan = mockProPlan();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(plan), { status: 200 }),
    );

    const { result } = renderHook(() => useSubscriptionPlan(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(plan);
  });

  it("does not fetch when enabled is false", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockSubscriptionPlan()), { status: 200 }),
    );

    const { result } = renderHook(
      () => useSubscriptionPlan({ enabled: false }),
      { wrapper: createWrapper() },
    );

    // Should stay in "pending" (not loading, not success)
    expect(result.current.fetchStatus).toBe("idle");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("useIsPro", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false for free plan", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockSubscriptionPlan()), { status: 200 }),
    );

    const { result } = renderHook(() => useIsPro(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it("returns true for active pro plan", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockProPlan()), { status: 200 }),
    );

    const { result } = renderHook(() => useIsPro(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBe(true));
  });
});
