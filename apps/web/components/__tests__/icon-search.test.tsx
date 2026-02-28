import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconSearch } from "../icon-search";
import { renderWithProviders } from "@/tests/test-utils";

// vi.hoisted ensures MOCK_ICONS is available when vi.mock factory is hoisted to top
const { MOCK_ICONS } = vi.hoisted(() => ({
  MOCK_ICONS: [
    "music",
    "music-2",
    "alarm-clock",
    "alarm-clock-check",
    "heart",
    "heart-pulse",
    "star",
    "star-half",
    "home",
    "home-icon",
    "bell",
    "camera",
  ],
}));

vi.mock("lucide-react/dynamic", () => ({
  dynamicIconImports: Object.fromEntries(MOCK_ICONS.map((name) => [name, {}])),
  // Render a testid-only span — no text content so getByText("music") is unambiguous
  DynamicIcon: ({ name }: { name: string }) => (
    <span data-testid={`icon-${name}`} aria-hidden="true" />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("IconSearch", () => {
  it("renders input with Search icons... placeholder", () => {
    renderWithProviders(<IconSearch value={undefined} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search icons...")).toBeInTheDocument();
  });

  it("shows no dropdown when query is empty", () => {
    renderWithProviders(<IconSearch value={undefined} onChange={vi.fn()} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows no dropdown for single-char query (minimum 2 chars)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IconSearch value={undefined} onChange={vi.fn()} />);
    await user.type(screen.getByPlaceholderText("Search icons..."), "m");
    // no dropdown for < 2 chars
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows filtered results for 2+ character query", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IconSearch value={undefined} onChange={vi.fn()} />);
    await user.type(screen.getByPlaceholderText("Search icons..."), "mu");

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText("music")).toBeInTheDocument();
      expect(screen.getByText("music-2")).toBeInTheDocument();
    });
  });

  it("supports space-separated multi-word search (alarm clock → alarm-clock)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IconSearch value={undefined} onChange={vi.fn()} />);
    await user.type(
      screen.getByPlaceholderText("Search icons..."),
      "alarm clock",
    );

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText("alarm-clock")).toBeInTheDocument();
      expect(screen.getByText("alarm-clock-check")).toBeInTheDocument();
    });
    // "music" should NOT appear
    expect(screen.queryByText("music")).not.toBeInTheDocument();
  });

  it("shows No matching icons when no results", async () => {
    const user = userEvent.setup();
    renderWithProviders(<IconSearch value={undefined} onChange={vi.fn()} />);
    await user.type(screen.getByPlaceholderText("Search icons..."), "zzz");

    await waitFor(() => {
      expect(screen.getByText(/no matching icons/i)).toBeInTheDocument();
    });
  });

  it("calls onChange with icon name on item click and closes dropdown", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<IconSearch value={undefined} onChange={onChange} />);
    await user.type(screen.getByPlaceholderText("Search icons..."), "mu");

    await waitFor(() => screen.getByText("music"));

    await user.pointer({
      target: screen.getByText("music"),
      keys: "[MouseLeft>]",
    });

    expect(onChange).toHaveBeenCalledWith("music");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("clears selection via X button and calls onChange(undefined)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<IconSearch value="heart" onChange={onChange} />);

    // Should show clear button when value is set
    const clearBtn = screen.getByRole("button", { name: /clear icon/i });
    await user.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("shows selected icon preview when value is set", () => {
    renderWithProviders(<IconSearch value="star" onChange={vi.fn()} />);
    expect(screen.getByTestId("icon-star")).toBeInTheDocument();
  });

  it("closes dropdown on outside click", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <div>
        <IconSearch value={undefined} onChange={vi.fn()} />
        <button>Outside</button>
      </div>,
    );
    await user.type(screen.getByPlaceholderText("Search icons..."), "mu");
    await waitFor(() => screen.getByRole("listbox"));

    await user.pointer({
      target: screen.getByRole("button", { name: "Outside" }),
      keys: "[MouseLeft>]",
    });

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("shows Clear icon footer button when value is set", () => {
    renderWithProviders(<IconSearch value="bell" onChange={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /clear icon/i }),
    ).toBeInTheDocument();
  });
});
