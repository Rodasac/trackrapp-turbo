import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MappingStep } from "@/components/csv-import/mapping-step";
import { TRACKR_EXPORT_HEADERS } from "@repo/shared/column-detect";
import type { ImportDefaults } from "@/components/csv-import/mapping-step";

// Capture the onChange callback so tests can simulate defaults being set
const { capturedOnChange } = vi.hoisted(() => ({
  capturedOnChange: {
    current: null as ((d: ImportDefaults) => void) | null,
  },
}));

vi.mock("@repo/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: () => null,
  SelectItem: () => null,
}));

vi.mock("@/components/csv-import/import-defaults", () => ({
  ImportDefaultsPanel: ({
    onChange,
  }: {
    defaults: ImportDefaults;
    onChange: (d: ImportDefaults) => void;
  }) => {
    capturedOnChange.current = onChange;
    return (
      <div data-testid="import-defaults-panel">Default Values Panel</div>
    );
  },
}));

const mockOnContinue = vi.fn();

const trackrHeaders = [...TRACKR_EXPORT_HEADERS];
const sampleRows = [
  [
    "Netflix",
    "15.99",
    "USD",
    "monthly",
    "2026-03-15",
    "Entertainment",
    "2025-01-01",
    "active",
  ],
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

  describe("defaults integration", () => {
    it("renders the ImportDefaultsPanel", () => {
      render(
        <MappingStep
          headers={trackrHeaders}
          rows={sampleRows}
          onContinue={mockOnContinue}
        />,
      );
      expect(
        screen.getByTestId("import-defaults-panel"),
      ).toBeInTheDocument();
    });

    it("disables Continue when only name+price are in CSV and nextRenewalDate has no default", () => {
      render(
        <MappingStep
          headers={["Name", "Price"]}
          rows={[["Netflix", "9.99"]]}
          onContinue={mockOnContinue}
        />,
      );
      // billingCycle default is "monthly" (pre-set), nextRenewalDate default is "" → disabled
      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeDisabled();
    });

    it("enables Continue when name+price are in CSV and defaults cover billingCycle+nextRenewalDate", async () => {
      capturedOnChange.current = null;
      render(
        <MappingStep
          headers={["Name", "Price"]}
          rows={[["Netflix", "9.99"]]}
          onContinue={mockOnContinue}
        />,
      );
      // Initially disabled — nextRenewalDate default is ""
      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeDisabled();

      // Simulate user setting nextRenewalDate via the defaults panel
      await act(async () => {
        capturedOnChange.current?.({
          billingCycle: "monthly",
          nextRenewalDate: "2026-12-01",
          currency: "USD",
          categoryName: "",
          startDate: "",
        });
      });

      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeEnabled();
    });

    it("keeps Continue enabled when full TrackrApp CSV is used (no defaults needed)", () => {
      render(
        <MappingStep
          headers={trackrHeaders}
          rows={sampleRows}
          onContinue={mockOnContinue}
        />,
      );
      // All required fields are mapped from CSV — defaults not needed
      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeEnabled();
    });
  });
});
