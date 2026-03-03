import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useBanUser, useUnbanUser, useSetUserRole } from "../use-admin-mutations";
import { queryKeys } from "@/lib/query-keys";

const { mockBanUser, mockUnbanUser, mockSetRole } = vi.hoisted(() => ({
  mockBanUser: vi.fn(),
  mockUnbanUser: vi.fn(),
  mockSetRole: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    admin: {
      banUser: mockBanUser,
      unbanUser: mockUnbanUser,
      setRole: mockSetRole,
    },
  },
}));

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("useBanUser", () => {
  beforeEach(() => {
    mockBanUser.mockReset();
  });

  it("calls authClient.admin.banUser with userId", async () => {
    mockBanUser.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const { result } = renderHook(() => useBanUser(), { wrapper: makeWrapper(qc) });

    await act(() => result.current.mutateAsync({ userId: "user-123" }));

    expect(mockBanUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-123" }),
    );
  });

  it("calls authClient.admin.banUser with banReason when provided", async () => {
    mockBanUser.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const { result } = renderHook(() => useBanUser(), { wrapper: makeWrapper(qc) });

    await act(() =>
      result.current.mutateAsync({ userId: "user-123", banReason: "Spam" }),
    );

    expect(mockBanUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-123", banReason: "Spam" }),
    );
  });

  it("invalidates admin.users on success", async () => {
    mockBanUser.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    const { result } = renderHook(() => useBanUser(), { wrapper: makeWrapper(qc) });

    await act(() => result.current.mutateAsync({ userId: "user-123" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "users"] }),
    );
  });

  it("throws when banUser returns an error", async () => {
    mockBanUser.mockResolvedValue({ data: null, error: { message: "Forbidden" } });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const { result } = renderHook(() => useBanUser(), { wrapper: makeWrapper(qc) });

    await expect(
      act(() => result.current.mutateAsync({ userId: "user-123" })),
    ).rejects.toThrow("Forbidden");
  });
});

describe("useUnbanUser", () => {
  beforeEach(() => {
    mockUnbanUser.mockReset();
  });

  it("calls authClient.admin.unbanUser with userId", async () => {
    mockUnbanUser.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const { result } = renderHook(() => useUnbanUser(), { wrapper: makeWrapper(qc) });

    await act(() => result.current.mutateAsync({ userId: "user-123" }));

    expect(mockUnbanUser).toHaveBeenCalledWith({ userId: "user-123" });
  });

  it("invalidates admin.users on success", async () => {
    mockUnbanUser.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    const { result } = renderHook(() => useUnbanUser(), { wrapper: makeWrapper(qc) });

    await act(() => result.current.mutateAsync({ userId: "user-123" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "users"] }),
    );
  });
});

describe("useSetUserRole", () => {
  beforeEach(() => {
    mockSetRole.mockReset();
  });

  it("calls authClient.admin.setRole with userId and role", async () => {
    mockSetRole.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const { result } = renderHook(() => useSetUserRole(), { wrapper: makeWrapper(qc) });

    await act(() =>
      result.current.mutateAsync({ userId: "user-123", role: "admin" }),
    );

    expect(mockSetRole).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-123", role: "admin" }),
    );
  });

  it("invalidates admin.users on success", async () => {
    mockSetRole.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    const { result } = renderHook(() => useSetUserRole(), { wrapper: makeWrapper(qc) });

    await act(() =>
      result.current.mutateAsync({ userId: "user-123", role: "user" }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "users"] }),
    );
  });
});
