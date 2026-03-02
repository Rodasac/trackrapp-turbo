import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedCounter } from "@/components/landing/motion/animated-counter";

// MotionValue is an object with a .get() method — mock motion.span to handle it
vi.mock("motion/react", () => ({
  useInView: () => true,
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
    on: vi.fn(),
  }),
  useTransform: (val: { get: () => number }, fn: (v: number) => string) => ({
    get: () => fn(val.get()),
  }),
  animate: vi.fn(),
  motion: {
    span: ({
      children,
      ...rest
    }: {
      children?: { get?: () => string } | React.ReactNode;
      [key: string]: unknown;
    }) => {
      // If children is a MotionValue, call .get() to render its string value
      const content =
        children && typeof children === "object" && "get" in children
          ? (children as { get: () => string }).get()
          : children;
      return <span {...(rest as object)}>{content as React.ReactNode}</span>;
    },
  },
}));

describe("AnimatedCounter", () => {
  it("renders with a suffix", () => {
    render(<AnimatedCounter to={100} suffix="+" />);
    expect(screen.getByText(/\+/)).toBeInTheDocument();
  });

  it("renders with a prefix", () => {
    render(<AnimatedCounter to={50000} prefix="$" />);
    expect(screen.getByText(/\$/)).toBeInTheDocument();
  });

  it("renders without crashing when to=0", () => {
    render(<AnimatedCounter to={0} />);
    expect(document.body).toBeInTheDocument();
  });
});
