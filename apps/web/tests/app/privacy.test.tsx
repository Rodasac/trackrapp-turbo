import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import PrivacyPage from "@/app/[locale]/privacy/page";

vi.mock("@/components/landing/navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/landing/footer", () => ({ Footer: () => null }));

describe("Privacy Policy page", () => {
  it("renders main heading", async () => {
    await act(async () => {
      render(await PrivacyPage());
    });
    expect(
      screen.getByRole("heading", { name: /privacy policy/i }),
    ).toBeInTheDocument();
  });

  it("renders Information We Collect section", async () => {
    await act(async () => {
      render(await PrivacyPage());
    });
    expect(screen.getByText(/information we collect/i)).toBeInTheDocument();
  });

  it("renders Your Rights section", async () => {
    await act(async () => {
      render(await PrivacyPage());
    });
    expect(screen.getByText(/your rights/i)).toBeInTheDocument();
  });

  it("renders contact info", async () => {
    await act(async () => {
      render(await PrivacyPage());
    });
    // Email appears as link text — could appear multiple times
    const contactLinks = screen.getAllByText(/privacy@trackrapp/i);
    expect(contactLinks.length).toBeGreaterThan(0);
  });
});
