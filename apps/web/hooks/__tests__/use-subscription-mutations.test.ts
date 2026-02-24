import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useSaveSubscription,
  useCreateCategory,
  useDeactivateSubscription,
  useDeleteSubscription,
} from "../use-subscription-mutations";
import { queryKeys } from "@/lib/query-keys";

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const validSubscriptionPayload = {
  name: "Netflix",
  price: "15.99",
  currency: "USD",
  billingCycle: "monthly" as const,
  nextRenewalDate: "2026-03-15",
};

describe("useSaveSubscription", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("POSTs to /api/subscriptions in create mode", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useSaveSubscription("create"), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync(validSubscriptionPayload));

    const [url, opts] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/subscriptions");
    expect((opts as RequestInit).method).toBe("POST");
  });

  it("PUTs to /api/subscriptions/:id in edit mode", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 7 }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useSaveSubscription("edit", 7), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync(validSubscriptionPayload));

    const [url, opts] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/subscriptions/7");
    expect((opts as RequestInit).method).toBe("PUT");
  });

  it("invalidates subscriptions.all on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = vi.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useSaveSubscription("create"), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync(validSubscriptionPayload));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.subscriptions.all }),
    );
  });
});

describe("useCreateCategory", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("POSTs to /api/categories", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync({ name: "Work" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/categories",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("invalidates categories.all on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = vi.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync({ name: "Work" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.categories.all }),
    );
  });
});

describe("useDeactivateSubscription", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("DELETEs to /api/subscriptions/:id (no hard param)", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useDeactivateSubscription(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync(3));

    const [url, opts] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/subscriptions/3");
    expect((opts as RequestInit).method).toBe("DELETE");
    expect(url as string).not.toContain("hard=true");
  });

  it("invalidates subscriptions.all on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = vi.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useDeactivateSubscription(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync(3));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.subscriptions.all }),
    );
  });
});

describe("useDeleteSubscription", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("DELETEs to /api/subscriptions/:id?hard=true", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useDeleteSubscription(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync(5));

    const [url] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/subscriptions/5?hard=true");
  });
});
