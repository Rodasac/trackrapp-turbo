import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import TermsPage from "@/app/[locale]/terms/page";

vi.mock("@/components/landing/navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/landing/footer", () => ({ Footer: () => null }));

describe("Terms of Service page", () => {
  it("renders main heading", async () => {
    await act(async () => {
      render(await TermsPage());
    });
    expect(
      screen.getByRole("heading", { name: /terms of service/i }),
    ).toBeInTheDocument();
  });

  it("renders Acceptance of Terms section", async () => {
    await act(async () => {
      render(await TermsPage());
    });
    expect(screen.getByText(/acceptance of terms/i)).toBeInTheDocument();
  });

  it("renders Limitation of Liability section", async () => {
    await act(async () => {
      render(await TermsPage());
    });
    expect(screen.getByText(/limitation of liability/i)).toBeInTheDocument();
  });

  it("renders contact info", async () => {
    await act(async () => {
      render(await TermsPage());
    });
    expect(screen.getByText(/legal@trackrapp/i)).toBeInTheDocument();
  });
});
