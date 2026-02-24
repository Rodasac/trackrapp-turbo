import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCategories } from "../use-categories";
import { createWrapper } from "@/tests/test-utils";
import { mockCategory } from "@/tests/fixtures";

describe("useCategories", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/categories and returns data", async () => {
    const categories = [mockCategory({ id: 1 }), mockCategory({ id: 2, name: "Work" })];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(categories), { status: 200 }),
    );

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(categories);
    expect(fetch).toHaveBeenCalledWith("/api/categories");
  });

  it("throws when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it("starts in loading state", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
  });
});
