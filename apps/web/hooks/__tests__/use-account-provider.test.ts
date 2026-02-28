import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAccountProvider } from "../use-account-provider";
import { createWrapper } from "@/tests/test-utils";
import { mockAccountProvider } from "@/tests/fixtures";

describe("useAccountProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/account-provider", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockAccountProvider()), { status: 200 }),
    );

    const { result } = renderHook(() => useAccountProvider(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(url).toBe("/api/account-provider");
  });

  it("returns credential provider for email/password users", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify(mockAccountProvider({ provider: "credential" })),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useAccountProvider(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.provider).toBe("credential");
  });

  it("returns google provider for OAuth users", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify(mockAccountProvider({ provider: "google" })),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useAccountProvider(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.provider).toBe("google");
  });

  it("returns error state on fetch failure", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );

    const { result } = renderHook(() => useAccountProvider(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
