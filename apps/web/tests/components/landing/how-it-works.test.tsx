import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HowItWorks } from "@/components/landing/how-it-works";

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/landing/motion/stagger-children", () => ({
  StaggerChildren: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  itemVariants: {},
}));

describe("HowItWorks", () => {
  it("renders section heading", () => {
    render(<HowItWorks />);
    expect(
      screen.getByRole("heading", { name: /how it works/i }),
    ).toBeInTheDocument();
  });

  it("renders exactly 3 steps", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Add your subscriptions")).toBeInTheDocument();
    expect(screen.getByText("Get smart reminders")).toBeInTheDocument();
    expect(screen.getByText("Save money")).toBeInTheDocument();
  });

  it("renders step numbers 1, 2, 3", () => {
    render(<HowItWorks />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
