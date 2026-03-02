import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppMockup } from "@/components/landing/app-mockup";

describe("AppMockup", () => {
  it("renders without crashing", () => {
    render(<AppMockup />);
    expect(document.body).toBeInTheDocument();
  });

  it("shows subscription count KPI", () => {
    render(<AppMockup />);
    expect(screen.getByText(/subscriptions/i)).toBeInTheDocument();
  });

  it("shows monthly spend KPI", () => {
    render(<AppMockup />);
    expect(screen.getByText(/monthly spend/i)).toBeInTheDocument();
  });

  it("renders subscription list items", () => {
    render(<AppMockup />);
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
  });
});
