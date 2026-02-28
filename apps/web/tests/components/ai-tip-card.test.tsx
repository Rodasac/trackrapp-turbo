import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiTipCard } from "@/components/ai-tip-card";
import type { AiTipItem } from "@/lib/types/api";

const baseTip: AiTipItem = {
  id: 1,
  title: "Switch to Annual",
  message: "You could save $48/year by switching Netflix to annual billing.",
  category: "savings",
  generatedAt: "2026-02-28T00:00:00.000Z",
  expiresAt: "2026-03-08T00:00:00.000Z",
};

describe("AiTipCard", () => {
  it("renders title and message", () => {
    render(<AiTipCard tip={baseTip} />);
    expect(screen.getByText("Switch to Annual")).toBeInTheDocument();
    expect(screen.getByText(/save \$48\/year/)).toBeInTheDocument();
  });

  it("shows correct badge for savings category", () => {
    render(<AiTipCard tip={baseTip} />);
    expect(screen.getByText("Savings")).toBeInTheDocument();
  });

  it("shows correct badge for warning category", () => {
    render(<AiTipCard tip={{ ...baseTip, category: "warning" }} />);
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("shows correct badge for info category", () => {
    render(<AiTipCard tip={{ ...baseTip, category: "info" }} />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("shows correct badge for comparison category", () => {
    render(<AiTipCard tip={{ ...baseTip, category: "comparison" }} />);
    expect(screen.getByText("Comparison")).toBeInTheDocument();
  });

  it("displays generated date", () => {
    render(<AiTipCard tip={baseTip} />);
    expect(screen.getByText(/generated/i)).toBeInTheDocument();
  });

  it("applies glass effect styling", () => {
    const { container } = render(<AiTipCard tip={baseTip} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("backdrop-blur");
  });
});
