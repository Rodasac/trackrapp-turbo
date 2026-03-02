import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqSection } from "@/components/landing/faq-section";

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Accordion to simple disclosure pattern for jsdom
vi.mock("@repo/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AccordionItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  AccordionTrigger: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("FaqSection", () => {
  it("renders section heading", () => {
    render(<FaqSection />);
    expect(
      screen.getByRole("heading", { name: /frequently asked questions/i }),
    ).toBeInTheDocument();
  });

  it("renders all FAQ questions", () => {
    render(<FaqSection />);
    expect(screen.getByText(/is there a free plan/i)).toBeInTheDocument();
    expect(screen.getByText(/can I cancel anytime/i)).toBeInTheDocument();
    expect(screen.getByText(/how does the ai tips/i)).toBeInTheDocument();
    expect(screen.getByText(/is my data secure/i)).toBeInTheDocument();
    expect(
      screen.getByText(/import my existing subscriptions/i),
    ).toBeInTheDocument();
  });

  it("renders at least 5 FAQ items", () => {
    render(<FaqSection />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });
});
