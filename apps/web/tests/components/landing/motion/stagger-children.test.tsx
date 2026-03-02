import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaggerChildren } from "@/components/landing/motion/stagger-children";

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      className,
      ...rest
    }: {
      children?: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div className={className} data-testid="motion-div" {...rest}>
        {children}
      </div>
    ),
  },
}));

describe("StaggerChildren", () => {
  it("renders children", () => {
    render(
      <StaggerChildren>
        <span>Child 1</span>
        <span>Child 2</span>
      </StaggerChildren>,
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(
      <StaggerChildren className="grid-cols-3">
        <span>X</span>
      </StaggerChildren>,
    );
    expect(screen.getByTestId("motion-div")).toHaveClass("grid-cols-3");
  });
});
