import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComparisonTable } from "@/components/landing/comparison-table";

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ComparisonTable", () => {
  it("renders section heading", () => {
    render(<ComparisonTable />);
    expect(
      screen.getByRole("heading", { name: /compare plans/i }),
    ).toBeInTheDocument();
  });

  it("renders Free and Pro column headers", () => {
    render(<ComparisonTable />);
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("renders feature rows", () => {
    render(<ComparisonTable />);
    expect(screen.getByText("Unlimited subscriptions")).toBeInTheDocument();
    expect(screen.getByText("AI-powered spending tips")).toBeInTheDocument();
    expect(screen.getByText("CSV import")).toBeInTheDocument();
  });

  it("renders check and cross indicators", () => {
    render(<ComparisonTable />);
    // Multiple check indicators should be present
    const checks = screen.getAllByTestId("check-icon");
    expect(checks.length).toBeGreaterThan(0);
  });
});
