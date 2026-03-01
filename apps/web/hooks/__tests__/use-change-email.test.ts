import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useChangeEmail } from "../use-change-email";

const { mockChangeEmail, mockInvalidateQueries } = vi.hoisted(() => ({
  mockChangeEmail: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    changeEmail: mockChangeEmail,
  },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useChangeEmail", () => {
  beforeEach(() => {
    mockChangeEmail.mockReset();
    mockInvalidateQueries.mockReset();
  });
  afterEach(() => vi.clearAllMocks());

  it("calls authClient.changeEmail with newEmail and callbackURL", async () => {
    mockChangeEmail.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useChangeEmail(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({ newEmail: "new@example.com" }),
    );

    expect(mockChangeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ newEmail: "new@example.com" }),
    );
  });

  it("uses custom callbackURL when provided", async () => {
    mockChangeEmail.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useChangeEmail(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        newEmail: "new@example.com",
        callbackURL: "/profile",
      }),
    );

    expect(mockChangeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ callbackURL: "/profile" }),
    );
  });

  it("invalidates session query on success", async () => {
    mockChangeEmail.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useChangeEmail(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({ newEmail: "new@example.com" }),
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["session"] }),
    );
  });

  it("throws when authClient.changeEmail returns an error", async () => {
    mockChangeEmail.mockResolvedValue({
      data: null,
      error: { message: "Email already in use" },
    });
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useChangeEmail(), {
      wrapper: makeWrapper(qc),
    });

    await expect(
      act(() => result.current.mutateAsync({ newEmail: "taken@example.com" })),
    ).rejects.toThrow("Email already in use");
  });
});
