import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAdminStats } from "../use-admin-stats";
import { createWrapper } from "@/tests/test-utils";

describe("useAdminStats", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/admin/stats", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ totalUsers: 10 }), { status: 200 }),
    );

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/admin/stats");
  });

  it("returns stats object on success", async () => {
    const stats = {
      totalUsers: 100,
      activeUsers30d: 42,
      proUsers: 15,
      freeUsers: 85,
      totalSubscriptions: 300,
      signups7d: 7,
      signups30d: 25,
      bannedUsers: 2,
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(stats), { status: 200 }),
    );

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(stats);
  });

  it("sets error on failure", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 403 }));

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
