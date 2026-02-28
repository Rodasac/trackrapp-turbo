import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useUpgradeToPro,
  useOpenBillingPortal,
} from "../use-subscription-plan-mutations";
import { queryKeys } from "@/lib/query-keys";

// vi.mock is hoisted — use vi.hoisted() to share mock references safely
const { mockUpgrade, mockBillingPortal } = vi.hoisted(() => ({
  mockUpgrade: vi.fn(),
  mockBillingPortal: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    subscription: {
      upgrade: mockUpgrade,
      cancel: vi.fn(),
      billingPortal: mockBillingPortal,
    },
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

describe("useUpgradeToPro", () => {
  beforeEach(() => {
    mockUpgrade.mockReset();
    mockBillingPortal.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls authClient.subscription.upgrade with monthly plan params", async () => {
    mockUpgrade.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useUpgradeToPro(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        annual: false,
        successUrl: "http://localhost:3000/settings?tab=billing&upgraded=true",
        cancelUrl: "http://localhost:3000/pricing",
      }),
    );

    expect(mockUpgrade).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "pro",
        annual: false,
        successUrl: "http://localhost:3000/settings?tab=billing&upgraded=true",
        cancelUrl: "http://localhost:3000/pricing",
      }),
    );
  });

  it("calls authClient.subscription.upgrade with annual flag when annual=true", async () => {
    mockUpgrade.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useUpgradeToPro(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        annual: true,
        successUrl: "http://localhost:3000/settings?tab=billing&upgraded=true",
        cancelUrl: "http://localhost:3000/pricing",
      }),
    );

    expect(mockUpgrade).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "pro", annual: true }),
    );
  });

  it("invalidates subscriptionPlan.all on success", async () => {
    mockUpgrade.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidate = vi.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useUpgradeToPro(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        annual: false,
        successUrl: "http://localhost:3000/settings?tab=billing&upgraded=true",
        cancelUrl: "http://localhost:3000/pricing",
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.subscriptionPlan.all }),
    );
  });

  it("throws when upgrade returns an error", async () => {
    mockUpgrade.mockResolvedValue({
      data: null,
      error: { message: "Payment required" },
    });
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useUpgradeToPro(), {
      wrapper: makeWrapper(qc),
    });

    await expect(
      act(() =>
        result.current.mutateAsync({
          annual: false,
          successUrl:
            "http://localhost:3000/settings?tab=billing&upgraded=true",
          cancelUrl: "http://localhost:3000/pricing",
        }),
      ),
    ).rejects.toThrow("Payment required");
  });
});

describe("useOpenBillingPortal", () => {
  beforeEach(() => {
    mockUpgrade.mockReset();
    mockBillingPortal.mockReset();
  });

  it("calls authClient.billing.portal with returnUrl", async () => {
    mockBillingPortal.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useOpenBillingPortal(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        returnUrl: "http://localhost:3000/settings?tab=billing",
      }),
    );

    expect(mockBillingPortal).toHaveBeenCalledWith(
      expect.objectContaining({
        returnUrl: "http://localhost:3000/settings?tab=billing",
      }),
    );
  });

  it("invalidates subscriptionPlan.all on success", async () => {
    mockBillingPortal.mockResolvedValue({ data: {}, error: null });
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidate = vi.spyOn(qc, "invalidateQueries");

    const { result } = renderHook(() => useOpenBillingPortal(), {
      wrapper: makeWrapper(qc),
    });

    await act(() =>
      result.current.mutateAsync({
        returnUrl: "http://localhost:3000/settings?tab=billing",
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.subscriptionPlan.all }),
    );
  });

  it("throws when billing portal returns an error", async () => {
    mockBillingPortal.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(() => useOpenBillingPortal(), {
      wrapper: makeWrapper(qc),
    });

    await expect(
      act(() =>
        result.current.mutateAsync({
          returnUrl: "http://localhost:3000/settings?tab=billing",
        }),
      ),
    ).rejects.toThrow("Not found");
  });
});
