import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/hooks/use-subscription-plan", () => ({
  useIsPro: vi.fn(),
}));

import { CsvImportButton } from "../csv-import-button";
import { useIsPro } from "@/hooks/use-subscription-plan";

const mockUseIsPro = vi.mocked(useIsPro);

describe("CsvImportButton", () => {
  it("renders the import button for Pro users", () => {
    mockUseIsPro.mockReturnValue(true);
    renderWithProviders(<CsvImportButton />);
    expect(
      screen.getByRole("link", { name: /import csv/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing for free users", () => {
    mockUseIsPro.mockReturnValue(false);
    renderWithProviders(<CsvImportButton />);
    expect(screen.queryByRole("link", { name: /import csv/i })).toBeNull();
  });

  it("renders nothing when plan is loading (undefined)", () => {
    mockUseIsPro.mockReturnValue(undefined as unknown as boolean);
    renderWithProviders(<CsvImportButton />);
    expect(screen.queryByRole("link", { name: /import csv/i })).toBeNull();
  });
});
