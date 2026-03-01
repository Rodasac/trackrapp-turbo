import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useUserPreferences,
  useUpdateUserPreferences,
} from "../use-user-preferences";
import { queryKeys } from "@/lib/query-keys";

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useUserPreferences", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("fetches from /api/user-preferences", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ autoRenewDefault: true }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.autoRenewDefault).toBe(true);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/user-preferences");
  });

  it("surfaces error state on fetch failure", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("Server error", { status: 500 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: makeWrapper(qc),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useUpdateUserPreferences", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("PUTs to /api/user-preferences", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ autoRenewDefault: false }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useUpdateUserPreferences(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync({ autoRenewDefault: false }));

    const [url, opts] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/user-preferences");
    expect((opts as RequestInit).method).toBe("PUT");
    expect(JSON.parse((opts as RequestInit).body as string)).toEqual({
      autoRenewDefault: false,
    });
  });

  it("invalidates userPreferences.all on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ autoRenewDefault: false }), { status: 200 }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    const { result } = renderHook(() => useUpdateUserPreferences(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync({ autoRenewDefault: false }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.userPreferences.all }),
    );
  });
});
