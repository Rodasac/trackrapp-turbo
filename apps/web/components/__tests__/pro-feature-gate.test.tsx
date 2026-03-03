import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { ProFeatureGate } from "../pro-feature-gate";

describe("ProFeatureGate", () => {
  it("renders the feature name", () => {
    renderWithProviders(
      <ProFeatureGate
        feature="CSV Import"
        description="Import subscriptions from a CSV file."
      />,
    );
    expect(screen.getByText("CSV Import")).toBeInTheDocument();
  });

  it("renders the description", () => {
    renderWithProviders(
      <ProFeatureGate
        feature="CSV Import"
        description="Import subscriptions from a CSV file."
      />,
    );
    expect(
      screen.getByText("Import subscriptions from a CSV file."),
    ).toBeInTheDocument();
  });

  it("renders a link to /pricing", () => {
    renderWithProviders(
      <ProFeatureGate feature="CSV Import" description="Import from CSV." />,
    );
    const link = screen.getByRole("link", { name: /view plans/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/pricing");
  });

  it("renders a lock icon indicator", () => {
    renderWithProviders(
      <ProFeatureGate feature="CSV Import" description="Import from CSV." />,
    );
    // The component should indicate this is a Pro feature
    expect(screen.getByText(/pro/i)).toBeInTheDocument();
  });
});
