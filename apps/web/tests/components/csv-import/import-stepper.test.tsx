import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportStepper } from "@/components/csv-import/import-stepper";

describe("ImportStepper", () => {
  it("renders all three step labels", () => {
    render(<ImportStepper currentStep={1} />);
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Map Columns")).toBeInTheDocument();
    expect(screen.getByText("Preview & Import")).toBeInTheDocument();
  });

  it("highlights the active step", () => {
    render(<ImportStepper currentStep={2} />);
    const active = screen.getByTestId("step-2");
    expect(active).toHaveAttribute("data-active", "true");
  });

  it("marks earlier steps as completed", () => {
    render(<ImportStepper currentStep={3} />);
    expect(screen.getByTestId("step-1")).toHaveAttribute("data-completed", "true");
    expect(screen.getByTestId("step-2")).toHaveAttribute("data-completed", "true");
    expect(screen.getByTestId("step-3")).toHaveAttribute("data-active", "true");
  });
});
