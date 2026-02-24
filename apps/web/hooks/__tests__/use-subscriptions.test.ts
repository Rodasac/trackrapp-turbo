import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSubscriptions } from "../use-subscriptions";
import { createWrapper } from "@/tests/test-utils";
import { mockSubscriptionListItem } from "@/tests/fixtures";

describe("useSubscriptions", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/subscriptions with no params when filters are empty", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const { result } = renderHook(() => useSubscriptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(url).toBe("/api/subscriptions?");
  });

  it("includes search param in URL when provided", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const { result } = renderHook(() => useSubscriptions({ search: "netflix" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(url).toContain("search=netflix");
  });

  it("includes active param when provided", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const { result } = renderHook(
      () => useSubscriptions({ active: false }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(url).toContain("active=false");
  });

  it("omits undefined filter values from URL", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const { result } = renderHook(
      () => useSubscriptions({ search: undefined, category: undefined }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(url).not.toContain("search=");
    expect(url).not.toContain("category=");
  });

  it("returns data on success", async () => {
    const items = [mockSubscriptionListItem(), mockSubscriptionListItem({ id: 2, name: "Spotify" })];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(items), { status: 200 }),
    );

    const { result } = renderHook(() => useSubscriptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(items);
  });
});
