import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Footer } from "@/components/landing/footer";

describe("Footer", () => {
  it("renders TrackrApp logo and brand text", async () => {
    await act(async () => {
      render(await Footer());
    });
    expect(screen.getByText("TrackrApp")).toBeInTheDocument();
  });

  it("renders copyright with current year", async () => {
    await act(async () => {
      render(await Footer());
    });
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
  });

  it("renders product navigation links", async () => {
    await act(async () => {
      render(await Footer());
    });
    expect(screen.getByRole("link", { name: /features/i })).toHaveAttribute(
      "href",
      "/#features",
    );
    expect(screen.getByRole("link", { name: /pricing/i })).toHaveAttribute(
      "href",
      "/#pricing",
    );
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("renders Terms of Service link", async () => {
    await act(async () => {
      render(await Footer());
    });
    expect(
      screen.getByRole("link", { name: /terms of service/i }),
    ).toHaveAttribute("href", "/terms");
  });

  it("renders Privacy Policy link", async () => {
    await act(async () => {
      render(await Footer());
    });
    expect(
      screen.getByRole("link", { name: /privacy policy/i }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("renders Cookie Policy link", async () => {
    await act(async () => {
      render(await Footer());
    });
    expect(
      screen.getByRole("link", { name: /cookie policy/i }),
    ).toHaveAttribute("href", "/cookies");
  });
});
