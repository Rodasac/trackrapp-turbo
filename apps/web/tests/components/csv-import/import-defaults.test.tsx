import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ImportDefaults } from "@/components/csv-import/mapping-step";

vi.mock("@repo/ui/select", () => ({
  Select: ({
    children,
  }: {
    value?: string;
    onValueChange?: (v: string) => void;
    children: React.ReactNode;
  }) => <div>{children}</div>,
  SelectTrigger: ({
    children,
    id,
  }: {
    children: React.ReactNode;
    id?: string;
    className?: string;
  }) => <div id={id}>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder ?? ""}</span>
  ),
  SelectContent: () => null,
  SelectItem: () => null,
}));

vi.mock("@/hooks/use-categories", () => ({
  useCategories: () => ({
    data: [{ id: 1, name: "Entertainment", color: null }],
  }),
}));

import { ImportDefaultsPanel } from "@/components/csv-import/import-defaults";

const BASE_DEFAULTS: ImportDefaults = {
  billingCycle: "monthly",
  nextRenewalDate: "",
  currency: "USD",
  categoryName: "",
  startDate: "",
};

describe("ImportDefaultsPanel", () => {
  it("renders a 'Default Values' collapsible heading", () => {
    render(<ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={vi.fn()} />);
    expect(screen.getByText(/default values/i)).toBeInTheDocument();
  });

  it("renders billing cycle label", () => {
    render(<ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={vi.fn()} />);
    expect(screen.getByText(/billing cycle/i)).toBeInTheDocument();
  });

  it("renders currency label", () => {
    render(<ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={vi.fn()} />);
    expect(screen.getByText(/currency/i)).toBeInTheDocument();
  });

  it("renders next renewal date label", () => {
    render(<ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={vi.fn()} />);
    expect(screen.getByText(/next renewal date/i)).toBeInTheDocument();
  });

  it("renders category label", () => {
    render(<ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={vi.fn()} />);
    expect(screen.getByText(/^category$/i)).toBeInTheDocument();
  });

  it("renders start date label", () => {
    render(<ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={vi.fn()} />);
    expect(screen.getByText(/start date/i)).toBeInTheDocument();
  });

  it("calls onChange with updated nextRenewalDate when date input changes", () => {
    const mockOnChange = vi.fn();
    render(
      <ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={mockOnChange} />,
    );
    const dateInput = screen.getByLabelText(/next renewal date/i);
    fireEvent.change(dateInput, { target: { value: "2026-12-01" } });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ nextRenewalDate: "2026-12-01" }),
    );
  });

  it("calls onChange with updated startDate when start date input changes", () => {
    const mockOnChange = vi.fn();
    render(
      <ImportDefaultsPanel defaults={BASE_DEFAULTS} onChange={mockOnChange} />,
    );
    const dateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(dateInput, { target: { value: "2026-01-01" } });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: "2026-01-01" }),
    );
  });

  it("preserves other defaults when one field changes", () => {
    const mockOnChange = vi.fn();
    const defaults: ImportDefaults = {
      ...BASE_DEFAULTS,
      billingCycle: "yearly",
      currency: "EUR",
    };
    render(<ImportDefaultsPanel defaults={defaults} onChange={mockOnChange} />);
    const dateInput = screen.getByLabelText(/next renewal date/i);
    fireEvent.change(dateInput, { target: { value: "2026-06-01" } });
    expect(mockOnChange).toHaveBeenCalledWith({
      billingCycle: "yearly",
      currency: "EUR",
      nextRenewalDate: "2026-06-01",
      categoryName: "",
      startDate: "",
    });
  });
});
