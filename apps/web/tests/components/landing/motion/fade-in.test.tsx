import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FadeIn } from "@/components/landing/motion/fade-in";

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

describe("FadeIn", () => {
  it("renders children", () => {
    render(
      <FadeIn>
        <span>Hello</span>
      </FadeIn>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(
      <FadeIn className="my-class">
        <span>Content</span>
      </FadeIn>,
    );
    expect(screen.getByTestId("motion-div")).toHaveClass("my-class");
  });

  it("accepts delay prop without error", () => {
    render(
      <FadeIn delay={0.2}>
        <span>Delayed</span>
      </FadeIn>,
    );
    expect(screen.getByText("Delayed")).toBeInTheDocument();
  });
});
