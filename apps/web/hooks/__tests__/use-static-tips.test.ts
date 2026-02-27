import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStaticTips } from "../use-static-tips";
import { createWrapper } from "@/tests/test-utils";

const mockTips = [
  {
    id: "annual-savings",
    title: "Switch to annual billing",
    message: "You could save $30/year.",
    type: "savings",
  },
  {
    id: "daily-cost",
    title: "Your subscription cost per day",
    message: "You spend $1.50/day.",
    type: "info",
  },
];

describe("useStaticTips", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/dashboard/tips", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockTips), { status: 200 }),
    );

    const { result } = renderHook(() => useStaticTips(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/dashboard/tips");
  });

  it("returns array of tips with id, title, message, type", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockTips), { status: 200 }),
    );

    const { result } = renderHook(() => useStaticTips(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toHaveProperty("id");
    expect(result.current.data?.[0]).toHaveProperty("title");
    expect(result.current.data?.[0]).toHaveProperty("type");
  });

  it("sets error on failure", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useStaticTips(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
