import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import type { CsvImportPreviewRow } from "@/lib/types/api";

const {
  mockPreviewMutate,
  mockConfirmMutateAsync,
  mockPreviewData,
  mockPreviewPending,
} = vi.hoisted(() => ({
  mockPreviewMutate: vi.fn(),
  mockConfirmMutateAsync: vi
    .fn()
    .mockResolvedValue({ imported: 1, failed: 0, errors: [] }),
  mockPreviewData: {
    current: undefined as { rows: CsvImportPreviewRow[] } | undefined,
  },
  mockPreviewPending: { current: false },
}));

vi.mock("@/hooks/use-csv-import", () => ({
  usePreviewCsvImport: () => ({
    mutate: mockPreviewMutate,
    isPending: mockPreviewPending.current,
    data: mockPreviewData.current,
    error: null,
  }),
  useConfirmCsvImport: () => ({
    mutateAsync: mockConfirmMutateAsync,
    isPending: false,
  }),
}));

import { PreviewStep } from "@/components/csv-import/preview-step";

const mockOnSuccess = vi.fn();

const validRow: CsvImportPreviewRow = {
  rowIndex: 0,
  name: "Netflix",
  price: "15.99",
  currency: "USD",
  billingCycle: "monthly",
  nextRenewalDate: "2026-03-15",
  startDate: null,
  categoryName: null,
  matchedService: {
    id: 1,
    name: "Netflix",
    logoUrl: null,
    websiteUrl: null,
    defaultCategory: null,
  },
  matchConfidence: "exact",
  resolvedCategoryId: null,
  isValid: true,
  errors: [],
};

const invalidRow: CsvImportPreviewRow = {
  ...validRow,
  rowIndex: 1,
  name: "Bad",
  isValid: false,
  errors: [{ field: "name", message: "Name is required" }],
  matchedService: null,
  matchConfidence: "none",
};

const mappedRows = [
  {
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-15",
  },
];

describe("PreviewStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPreviewData.current = undefined;
    mockPreviewPending.current = false;
  });

  it("calls preview mutation on mount with mapped rows", () => {
    renderWithProviders(
      <PreviewStep mappedRows={mappedRows} onSuccess={mockOnSuccess} />,
    );
    expect(mockPreviewMutate).toHaveBeenCalledWith(mappedRows);
  });

  it("shows match confidence badge for a valid row", async () => {
    mockPreviewData.current = { rows: [validRow] };
    renderWithProviders(
      <PreviewStep mappedRows={mappedRows} onSuccess={mockOnSuccess} />,
    );
    await waitFor(() => expect(screen.getByText("Exact")).toBeInTheDocument());
  });

  it("disables checkbox for invalid rows", async () => {
    mockPreviewData.current = { rows: [validRow, invalidRow] };
    renderWithProviders(
      <PreviewStep mappedRows={mappedRows} onSuccess={mockOnSuccess} />,
    );
    await waitFor(() => screen.getByText("Netflix"));
    const checkboxes = screen.getAllByRole("checkbox");
    const disabledCb = checkboxes.find(
      (cb) => (cb as HTMLInputElement).disabled,
    );
    expect(disabledCb).toBeTruthy();
  });

  it("select-all selects all valid rows", async () => {
    mockPreviewData.current = { rows: [validRow] };
    renderWithProviders(
      <PreviewStep mappedRows={mappedRows} onSuccess={mockOnSuccess} />,
    );
    await waitFor(() => screen.getByText("Netflix"));
    const [selectAll, rowCb] = screen.getAllByRole(
      "checkbox",
    ) as HTMLInputElement[];
    expect((rowCb as HTMLInputElement).checked).toBe(false);
    fireEvent.click(selectAll!);
    await waitFor(() => expect((rowCb as HTMLInputElement).checked).toBe(true));
  });

  it("Import button triggers confirm mutation with selected rows", async () => {
    mockPreviewData.current = { rows: [validRow] };
    renderWithProviders(
      <PreviewStep mappedRows={mappedRows} onSuccess={mockOnSuccess} />,
    );
    await waitFor(() => screen.getByText("Netflix"));
    // Select row via select-all
    const [selectAll] = screen.getAllByRole("checkbox") as HTMLInputElement[];
    fireEvent.click(selectAll!);
    await waitFor(() => screen.getByRole("button", { name: /import/i }));
    fireEvent.click(screen.getByRole("button", { name: /import/i }));
    await waitFor(() => expect(mockConfirmMutateAsync).toHaveBeenCalled());
  });
});
