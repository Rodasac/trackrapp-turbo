import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MappingStep } from "@/components/csv-import/mapping-step";
import { TRACKR_EXPORT_HEADERS } from "@repo/shared/column-detect";

vi.mock("@repo/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
  SelectContent: () => null,
  SelectItem: () => null,
}));

const mockOnContinue = vi.fn();

const trackrHeaders = [...TRACKR_EXPORT_HEADERS];
const sampleRows = [
  ["Netflix", "15.99", "USD", "monthly", "2026-03-15", "Entertainment", "2025-01-01", "active"],
];

describe("MappingStep", () => {
  it("renders all CSV headers in the mapping table", () => {
    render(
      <MappingStep
        headers={trackrHeaders}
        rows={sampleRows}
        onContinue={mockOnContinue}
      />,
    );
    // Headers appear in both the mapping table rows and the preview table — use getAllByText
    expect(screen.getAllByText("Name").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Price").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Billing Cycle").length).toBeGreaterThan(0);
  });

  it("auto-detects TrackrApp export columns", () => {
    render(
      <MappingStep
        headers={trackrHeaders}
        rows={sampleRows}
        onContinue={mockOnContinue}
      />,
    );
    // All 8 required/mapped fields shown
    expect(screen.getByText(/8 of/i)).toBeInTheDocument();
  });

  it("shows data preview rows", () => {
    render(
      <MappingStep
        headers={trackrHeaders}
        rows={sampleRows}
        onContinue={mockOnContinue}
      />,
    );
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("15.99")).toBeInTheDocument();
  });

  it("shows required field count indicator", () => {
    render(
      <MappingStep
        headers={["Unknown1", "Unknown2"]}
        rows={[["a", "b"]]}
        onContinue={mockOnContinue}
      />,
    );
    expect(screen.getByText(/0 of/i)).toBeInTheDocument();
  });
});
