import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSubscription } from "../use-subscription";
import { createWrapper } from "@/tests/test-utils";
import { mockSubscriptionDetail } from "@/tests/fixtures";

describe("useSubscription", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/subscriptions/:id", async () => {
    const detail = mockSubscriptionDetail({ id: 5 });
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(detail), { status: 200 }),
    );

    const { result } = renderHook(() => useSubscription(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/subscriptions/5");
    expect(result.current.data).toEqual(detail);
  });

  it("throws on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Not Found" }), { status: 404 }),
    );

    const { result } = renderHook(() => useSubscription(99), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("starts in loading state", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useSubscription(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });
});
