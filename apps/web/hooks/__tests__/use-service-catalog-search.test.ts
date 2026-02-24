import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useServiceCatalogSearch } from "../use-service-catalog-search";
import { createWrapper } from "@/tests/test-utils";
import { mockServiceCatalogEntry } from "@/tests/fixtures";

describe("useServiceCatalogSearch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is disabled (does not fetch) when query is empty", () => {
    const { result } = renderHook(() => useServiceCatalogSearch(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches with encoded query when query is non-empty", async () => {
    const entries = [mockServiceCatalogEntry()];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(entries), { status: 200 }),
    );

    const { result } = renderHook(() => useServiceCatalogSearch("netflix"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(url).toContain("q=netflix");
    expect(url).toContain("limit=10");
  });

  it("returns data on success", async () => {
    const entries = [mockServiceCatalogEntry({ id: 1, name: "Netflix" })];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(entries), { status: 200 }),
    );

    const { result } = renderHook(() => useServiceCatalogSearch("net"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(entries);
  });
});
