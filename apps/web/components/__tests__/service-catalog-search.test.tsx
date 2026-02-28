import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServiceCatalogSearch } from "../service-catalog-search";
import { renderWithProviders } from "@/tests/test-utils";
import { mockServiceCatalogEntry } from "@/tests/fixtures";

vi.mock("@/hooks/use-service-catalog-search", () => ({
  useServiceCatalogSearch: vi.fn(),
}));

import { useServiceCatalogSearch } from "@/hooks/use-service-catalog-search";
const mockUseSearch = vi.mocked(useServiceCatalogSearch);

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers(); // always start with real timers
  mockUseSearch.mockReturnValue({
    data: [],
    isFetching: false,
  } as never);
});

afterEach(() => {
  vi.useRealTimers(); // always restore real timers
});

describe("ServiceCatalogSearch", () => {
  it("renders the search input", () => {
    renderWithProviders(<ServiceCatalogSearch onSelect={vi.fn()} />);
    expect(
      screen.getByPlaceholderText(/search for a service/i),
    ).toBeInTheDocument();
  });

  it("shows no dropdown initially when input is empty", () => {
    renderWithProviders(<ServiceCatalogSearch onSelect={vi.fn()} />);
    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no matches/i)).not.toBeInTheDocument();
  });

  it("shows Searching… when hook is fetching and input has content", async () => {
    // The component shows "Searching…" when isFetching=true AND the dropdown is open.
    // The dropdown opens when open=true (set by typing) and any of: isFetching, results, query.
    // We don't test debounce timing here — just that the UI reflects isFetching correctly.
    const user = userEvent.setup();
    mockUseSearch.mockReturnValue({ data: [], isFetching: true } as never);

    renderWithProviders(<ServiceCatalogSearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText(/search for a service/i);
    await user.type(input, "net");

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it("renders results after typing", async () => {
    const user = userEvent.setup();
    const entry = mockServiceCatalogEntry({ id: 1, name: "Netflix" });
    mockUseSearch.mockReturnValue({
      data: [entry],
      isFetching: false,
    } as never);

    renderWithProviders(<ServiceCatalogSearch onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText(/search for a service/i);
    await user.type(input, "N");

    await waitFor(() => {
      expect(screen.getByText("Netflix")).toBeInTheDocument();
    });
  });

  it("calls onSelect when a result is clicked", async () => {
    const user = userEvent.setup();
    const entry = mockServiceCatalogEntry({ id: 1, name: "Netflix" });
    mockUseSearch.mockReturnValue({
      data: [entry],
      isFetching: false,
    } as never);

    const onSelect = vi.fn();
    renderWithProviders(<ServiceCatalogSearch onSelect={onSelect} />);

    await user.type(screen.getByPlaceholderText(/search for a service/i), "N");
    await waitFor(() => screen.getByText("Netflix"));
    // Use pointer mousedown (component uses onMouseDown, not onClick)
    await user.pointer({
      target: screen.getByText("Netflix"),
      keys: "[MouseLeft>]",
    });

    expect(onSelect).toHaveBeenCalledWith(entry);
  });

  it("shows No matches when results are empty and query is non-empty", async () => {
    const user = userEvent.setup();
    mockUseSearch.mockReturnValue({ data: [], isFetching: false } as never);

    renderWithProviders(<ServiceCatalogSearch onSelect={vi.fn()} />);
    await user.type(
      screen.getByPlaceholderText(/search for a service/i),
      "xyz",
    );

    await waitFor(() => {
      expect(screen.getByText(/no matches/i)).toBeInTheDocument();
    });
  });

  it("shows Enter manually button when results exist", async () => {
    const user = userEvent.setup();
    const entry = mockServiceCatalogEntry();
    mockUseSearch.mockReturnValue({
      data: [entry],
      isFetching: false,
    } as never);

    renderWithProviders(<ServiceCatalogSearch onSelect={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/search for a service/i), "N");

    await waitFor(() => {
      expect(screen.getByText(/enter manually/i)).toBeInTheDocument();
    });
  });

  it("clears input when Enter manually is clicked", async () => {
    const user = userEvent.setup();
    const entry = mockServiceCatalogEntry();
    mockUseSearch.mockReturnValue({
      data: [entry],
      isFetching: false,
    } as never);

    renderWithProviders(<ServiceCatalogSearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText(
      /search for a service/i,
    ) as HTMLInputElement;
    await user.type(input, "N");
    await waitFor(() => screen.getByText(/enter manually/i));

    await user.pointer({
      target: screen.getByText(/enter manually/i),
      keys: "[MouseLeft>]",
    });

    expect(input.value).toBe("");
  });
});
