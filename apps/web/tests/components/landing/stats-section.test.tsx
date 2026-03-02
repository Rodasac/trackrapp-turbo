import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsSection } from "@/components/landing/stats-section";

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

describe("StatsSection", () => {
  it("renders subscriptions tracked stat", () => {
    render(<StatsSection />);
    expect(screen.getByText(/subscriptions tracked/i)).toBeInTheDocument();
  });

  it("renders saved by users stat", () => {
    render(<StatsSection />);
    expect(screen.getByText(/saved by users/i)).toBeInTheDocument();
  });

  it("renders uptime stat", () => {
    render(<StatsSection />);
    expect(screen.getByText(/uptime/i)).toBeInTheDocument();
  });

  it("renders user rating stat", () => {
    render(<StatsSection />);
    expect(screen.getByText(/user rating/i)).toBeInTheDocument();
  });
});
