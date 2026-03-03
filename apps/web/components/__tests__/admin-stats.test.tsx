import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/hooks/use-admin-stats", () => ({
  useAdminStats: vi.fn(),
}));

import { AdminStats } from "@/components/admin/admin-stats";
import { useAdminStats } from "@/hooks/use-admin-stats";

const mockUseAdminStats = vi.mocked(useAdminStats);

const fullStats = {
  totalUsers: 100,
  activeUsers30d: 42,
  proUsers: 15,
  freeUsers: 85,
  totalSubscriptions: 300,
  signups7d: 7,
  signups30d: 25,
  bannedUsers: 2,
};

describe("AdminStats", () => {
  beforeEach(() => {
    mockUseAdminStats.mockReturnValue({
      data: fullStats,
      isLoading: false,
    } as never);
  });

  it("renders all 8 KPI stat values", () => {
    renderWithProviders(<AdminStats />);
    expect(screen.getByText("100")).toBeInTheDocument(); // totalUsers
    expect(screen.getByText("42")).toBeInTheDocument(); // activeUsers30d
    expect(screen.getByText("15")).toBeInTheDocument(); // proUsers
    expect(screen.getByText("85")).toBeInTheDocument(); // freeUsers
    expect(screen.getByText("300")).toBeInTheDocument(); // totalSubscriptions
    expect(screen.getByText("7")).toBeInTheDocument(); // signups7d
    expect(screen.getByText("25")).toBeInTheDocument(); // signups30d
    expect(screen.getByText("2")).toBeInTheDocument(); // bannedUsers
  });

  it("renders KPI card labels", () => {
    renderWithProviders(<AdminStats />);
    expect(screen.getByText(/total users/i)).toBeInTheDocument();
    expect(screen.getByText(/active \(30d\)/i)).toBeInTheDocument();
    expect(screen.getByText(/pro users/i)).toBeInTheDocument();
    expect(screen.getByText(/free users/i)).toBeInTheDocument();
    expect(screen.getByText(/tracked subscriptions/i)).toBeInTheDocument();
    expect(screen.getByText(/signups \(7d\)/i)).toBeInTheDocument();
    expect(screen.getByText(/signups \(30d\)/i)).toBeInTheDocument();
    expect(screen.getByText(/banned users/i)).toBeInTheDocument();
  });

  it("shows placeholder dashes while loading", () => {
    mockUseAdminStats.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    renderWithProviders(<AdminStats />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(8);
  });
});
