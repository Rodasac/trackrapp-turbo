import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useUpdateProfile, useChangePassword } from "../use-profile-mutations";

const { mockUpdateUser, mockChangePassword } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
  mockChangePassword: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    updateUser: mockUpdateUser,
    changePassword: mockChangePassword,
  },
}));

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useUpdateProfile", () => {
  beforeEach(() => mockUpdateUser.mockReset());
  afterEach(() => vi.clearAllMocks());

  it("calls authClient.updateUser with name and image", async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        name: "Jane Doe",
        image: "https://example.com/avatar.jpg",
      }),
    );

    expect(mockUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Doe",
        image: "https://example.com/avatar.jpg",
      }),
    );
  });

  it("calls authClient.updateUser with name only when image is omitted", async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: makeWrapper(qc),
    });

    await act(() => result.current.mutateAsync({ name: "Jane Doe" }));

    expect(mockUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Jane Doe" }),
    );
  });

  it("throws when updateUser returns an error", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: "Failed to update" },
    });
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: makeWrapper(qc),
    });

    await expect(
      act(() => result.current.mutateAsync({ name: "Jane" })),
    ).rejects.toThrow("Failed to update");
  });
});

describe("useChangePassword", () => {
  beforeEach(() => mockChangePassword.mockReset());
  afterEach(() => vi.clearAllMocks());

  it("calls authClient.changePassword with current and new password", async () => {
    mockChangePassword.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        currentPassword: "OldPass123",
        newPassword: "NewPass456",
      }),
    );

    expect(mockChangePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPassword: "OldPass123",
        newPassword: "NewPass456",
      }),
    );
  });

  it("passes revokeOtherSessions flag to authClient", async () => {
    mockChangePassword.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        currentPassword: "OldPass123",
        newPassword: "NewPass456",
        revokeOtherSessions: true,
      }),
    );

    expect(mockChangePassword).toHaveBeenCalledWith(
      expect.objectContaining({ revokeOtherSessions: true }),
    );
  });

  it("throws when changePassword returns an error", async () => {
    mockChangePassword.mockResolvedValue({
      data: null,
      error: { message: "Incorrect password" },
    });
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: makeWrapper(qc),
    });

    await expect(
      act(() =>
        result.current.mutateAsync({
          currentPassword: "wrong",
          newPassword: "NewPass456",
        }),
      ),
    ).rejects.toThrow("Incorrect password");
  });
});
