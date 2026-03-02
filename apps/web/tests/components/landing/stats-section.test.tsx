import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsSection } from "@/components/landing/stats-section";
import type { PlatformStatsResponse } from "@/lib/types/api";

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/landing/motion/animated-counter", () => ({
  AnimatedCounter: ({
    to,
    suffix,
    prefix,
  }: {
    to: number;
    suffix?: string;
    prefix?: string;
  }) => (
    <span>
      {prefix}
      {to}
      {suffix}
    </span>
  ),
}));

const mockUsePlatformStats = vi.fn();
vi.mock("@/hooks/use-platform-stats", () => ({
  usePlatformStats: () => mockUsePlatformStats(),
}));

const fakeStats: PlatformStatsResponse = {
  totalSubscriptions: 42,
  totalUsers: 100,
  totalReminders: 500,
  totalSaved: "150.00",
  computedAt: "2026-03-01T00:00:00.000Z",
};

describe("StatsSection", () => {
  it("renders all 4 stat labels", () => {
    mockUsePlatformStats.mockReturnValue({ data: fakeStats });
    render(<StatsSection />);
    expect(screen.getByText(/subscriptions tracked/i)).toBeInTheDocument();
    expect(screen.getByText(/users signed up/i)).toBeInTheDocument();
    expect(screen.getByText(/reminders sent/i)).toBeInTheDocument();
    expect(screen.getByText(/saved by users/i)).toBeInTheDocument();
  });

  it("shows real values from API when data is available", () => {
    mockUsePlatformStats.mockReturnValue({ data: fakeStats });
    render(<StatsSection />);
    expect(screen.getByText(/42\+/)).toBeInTheDocument();
    expect(screen.getByText(/100\+/)).toBeInTheDocument();
    expect(screen.getByText(/500\+/)).toBeInTheDocument();
  });

  it("shows 0 fallback values when loading", () => {
    mockUsePlatformStats.mockReturnValue({ data: undefined });
    render(<StatsSection />);
    const zeros = screen.getAllByText(/^0\+$/);
    // 3 of the 4 stats show 0+, the money stat shows $0+
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it("shows $ prefix for the saved stat", () => {
    mockUsePlatformStats.mockReturnValue({ data: fakeStats });
    render(<StatsSection />);
    expect(screen.getByText(/\$150\+/)).toBeInTheDocument();
  });
});
