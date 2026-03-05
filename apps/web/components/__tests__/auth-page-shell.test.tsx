import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthPageShell } from "../auth/auth-page-shell";

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle theme</button>,
}));

vi.mock("@/components/language-switcher", () => ({
  LanguageSwitcher: () => <button data-testid="language-switcher">Lang</button>,
}));

describe("AuthPageShell", () => {
  it("renders logo links to /", () => {
    render(
      <AuthPageShell>
        <div>Test content</div>
      </AuthPageShell>,
    );
    const links = screen.getAllByRole("link");
    const logoLinks = links.filter((l) => l.getAttribute("href") === "/");
    expect(logoLinks.length).toBeGreaterThan(0);
  });

  it("renders TrackrApp brand name", () => {
    render(
      <AuthPageShell>
        <div>Test content</div>
      </AuthPageShell>,
    );
    const brandNames = screen.getAllByText("TrackrApp");
    expect(brandNames.length).toBeGreaterThan(0);
  });

  it("renders tagline text", () => {
    render(
      <AuthPageShell>
        <div>Test content</div>
      </AuthPageShell>,
    );
    expect(screen.getByText(/never miss a renewal/i)).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <AuthPageShell>
        <div>Test content</div>
      </AuthPageShell>,
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders ThemeToggle", () => {
    render(
      <AuthPageShell>
        <div>Test content</div>
      </AuthPageShell>,
    );
    expect(screen.getAllByTestId("theme-toggle").length).toBeGreaterThan(0);
  });
});
