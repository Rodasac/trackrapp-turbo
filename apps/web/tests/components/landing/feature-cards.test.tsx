import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureCards } from "@/components/landing/feature-cards";

vi.mock("@/components/landing/motion/stagger-children", () => ({
  StaggerChildren: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  itemVariants: {},
}));

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("FeatureCards", () => {
  it("renders section heading", () => {
    render(<FeatureCards />);
    expect(
      screen.getByRole("heading", { name: /everything you need/i }),
    ).toBeInTheDocument();
  });

  it("renders exactly 6 feature cards", () => {
    render(<FeatureCards />);
    // Each card has a heading — we count those
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(6);
  });

  it("each card has a title and description", () => {
    render(<FeatureCards />);
    expect(screen.getByText(/renewal reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/spending analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-powered tips/i)).toBeInTheDocument();
    expect(screen.getByText(/csv/i)).toBeInTheDocument();
    expect(screen.getAllByText(/calendar/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/dark mode/i)).toBeInTheDocument();
  });
});
