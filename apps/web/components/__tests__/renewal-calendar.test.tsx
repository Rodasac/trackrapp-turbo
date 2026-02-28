import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("shows all renewals in list when no date selected", () => {
    mockUseRenewalCalendar.mockReturnValue({
      data: mockRenewals,
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);
    const list = screen.getByTestId("renewal-list");
    expect(within(list).getByText("Netflix")).toBeInTheDocument();
    expect(within(list).getByText("Spotify")).toBeInTheDocument();
  });

  it("shows all renewals with dates and billing cycle when no date selected", () => {
    mockUseRenewalCalendar.mockReturnValue({
      data: mockRenewals,
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);
    const list = screen.getByTestId("renewal-list");
    // Dates shown in unfiltered view
    expect(within(list).getByText("Mar 5, 2026")).toBeInTheDocument();
    expect(within(list).getByText("Mar 10, 2026")).toBeInTheDocument();
    // Billing cycle labels appear in each item
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(item).toHaveTextContent("/mo"));
  });

  it("filters to selected date and shows clear button", async () => {
    const user = userEvent.setup();
    mockUseRenewalCalendar.mockReturnValue({
      data: mockRenewals,
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);

    await user.click(screen.getByTestId("select-date"));

    const list = screen.getByTestId("renewal-list");
    expect(within(list).getByText("Netflix")).toBeInTheDocument();
    expect(within(list).queryByText("Spotify")).not.toBeInTheDocument();
    expect(screen.getByTestId("clear-date-filter")).toBeInTheDocument();
  });

  it("clear button restores full list", async () => {
    const user = userEvent.setup();
    mockUseRenewalCalendar.mockReturnValue({
      data: mockRenewals,
      isLoading: false,
    } as never);
    renderWithProviders(<RenewalCalendar />);

    await user.click(screen.getByTestId("select-date"));
    await user.click(screen.getByTestId("clear-date-filter"));

    const list = screen.getByTestId("renewal-list");
    expect(within(list).getByText("Netflix")).toBeInTheDocument();
    expect(within(list).getByText("Spotify")).toBeInTheDocument();
  });
});
