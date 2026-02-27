import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { RenewalCalendar } from "../renewal-calendar";

vi.mock("@/hooks/use-renewal-calendar", () => ({
  useRenewalCalendar: vi.fn(),
}));

// Calendar has jsdom issues with Radix primitives
vi.mock("@repo/ui/calendar", () => ({
  Calendar: ({
    modifiers,
    onSelect,
  }: {
    modifiers?: { renewal?: Date[] };
    onSelect?: (d: Date | undefined) => void;
  }) => (
    <div data-testid="calendar">
      <span data-testid="renewal-count">
        {modifiers?.renewal?.length ?? 0} renewal dates
      </span>
      <button
        data-testid="select-date"
        onClick={() => onSelect?.(new Date("2026-03-05"))}
      >
        Select date
      </button>
    </div>
  ),
}));

import { useRenewalCalendar } from "@/hooks/use-renewal-calendar";
const mockUseRenewalCalendar = vi.mocked(useRenewalCalendar);

const mockRenewals = [
  {
    id: 1,
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-05",
    logoUrl: null,
  },
  {
    id: 2,
    name: "Spotify",
    price: "9.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-10",
    logoUrl: null,
  },
];

describe("RenewalCalendar", () => {
  it("shows loading skeleton while fetching", () => {
    mockUseRenewalCalendar.mockReturnValue({
      data: [],
      isLoading: true,
    } as never);
    const { container } = renderWithProviders(<RenewalCalendar />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders the calendar widget", () => {
    mockUseRenewalCalendar.mockReturnValue({
      data: mockRenewals,
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
    expect(screen.getByText("Upcoming renewals")).toBeInTheDocument();
  });

  it("passes renewal dates as modifiers to Calendar", () => {
    mockUseRenewalCalendar.mockReturnValue({
      data: mockRenewals,
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);
    expect(screen.getByText("2 renewal dates")).toBeInTheDocument();
  });

  it("shows empty message when no renewals", () => {
    mockUseRenewalCalendar.mockReturnValue({
      data: [],
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);
    expect(
      screen.getByText("No renewals in the next 30 days"),
    ).toBeInTheDocument();
  });

  it("shows renewal summary count when renewals exist", () => {
    mockUseRenewalCalendar.mockReturnValue({
      data: mockRenewals,
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);
    expect(screen.getByText(/2 renewals this month/)).toBeInTheDocument();
  });
});
