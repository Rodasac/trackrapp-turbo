import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/tests/test-utils";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { usePlatformStats } from "@/hooks/use-platform-stats";

const fakeStats = {
  totalSubscriptions: 42,
  totalUsers: 100,
  totalReminders: 500,
  totalSaved: "150.00",
  computedAt: "2026-03-01T00:00:00.000Z",
};

describe("usePlatformStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns platform stats data on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeStats),
    });

    const { result } = renderHook(() => usePlatformStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(fakeStats);
    expect(mockFetch).toHaveBeenCalledWith("/api/platform-stats");
  });

  it("returns error state when fetch fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => usePlatformStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
