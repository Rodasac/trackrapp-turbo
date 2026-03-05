import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CookiesPage from "@/app/[locale]/cookies/page";

vi.mock("@/components/landing/navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/landing/footer", () => ({ Footer: () => null }));

describe("Cookie Policy page", () => {
  it("renders main heading", async () => {
    await act(async () => {
      render(await CookiesPage());
    });
    expect(
      screen.getByRole("heading", { name: /cookie policy/i }),
    ).toBeInTheDocument();
  });

  it("renders What Are Cookies section", async () => {
    await act(async () => {
      render(await CookiesPage());
    });
    expect(screen.getByText(/what are cookies/i)).toBeInTheDocument();
  });

  it("renders GDPR rights section", async () => {
    await act(async () => {
      render(await CookiesPage());
    });
    // "GDPR" appears in both heading and body text
    const gdprElements = screen.getAllByText(/gdpr/i);
    expect(gdprElements.length).toBeGreaterThan(0);
  });

  it("renders contact info", async () => {
    await act(async () => {
      render(await CookiesPage());
    });
    expect(screen.getByText(/privacy@trackrapp/i)).toBeInTheDocument();
  });
});
