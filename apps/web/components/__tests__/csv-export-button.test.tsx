import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/tests/test-utils";
import { CsvExportButton } from "../csv-export-button";

// Stub browser download APIs at module level to avoid Object.defineProperty issues
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

describe("CsvExportButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders the Export CSV button", () => {
    renderWithProviders(<CsvExportButton />);
    expect(
      screen.getByRole("button", { name: /export csv/i }),
    ).toBeInTheDocument();
  });

  it("calls /api/subscriptions/export on click", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        new Blob(["Name,Price\nNetflix,15.99"], { type: "text/csv" }),
        {
          status: 200,
          headers: { "Content-Type": "text/csv" },
        },
      ),
    );

    // Stub anchor click to avoid JSDOM navigation errors
    const mockAnchorClick = vi.fn();
    vi.spyOn(document, "createElement").mockImplementationOnce((tag) => {
      if (tag === "a") {
        const el = document.createElement("a");
        el.click = mockAnchorClick;
        return el;
      }
      return document.createElement(tag);
    });

    renderWithProviders(<CsvExportButton />);
    await user.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/subscriptions/export"),
    );
  });

  it("shows error toast when export fails", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    renderWithProviders(<CsvExportButton />);
    await user.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/subscriptions/export"),
    );
  });
});
