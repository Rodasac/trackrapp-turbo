import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UploadStep } from "@/components/csv-import/upload-step";

const mockOnParsed = vi.fn();

describe("UploadStep", () => {
  it("renders the drop zone with instructions", () => {
    render(<UploadStep onParsed={mockOnParsed} />);
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
  });

  it("accepts a valid CSV file and calls onParsed", async () => {
    render(<UploadStep onParsed={mockOnParsed} />);
    const csvContent = "Name,Price\nNetflix,15.99";
    const file = new File([csvContent], "subs.csv", { type: "text/csv" });
    const input = screen.getByTestId("csv-file-input");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(mockOnParsed).toHaveBeenCalledWith({
        headers: ["Name", "Price"],
        rows: [["Netflix", "15.99"]],
      });
    });
  });

  it("shows an error for non-CSV files", async () => {
    render(<UploadStep onParsed={mockOnParsed} />);
    const file = new File(["hello"], "data.json", { type: "application/json" });
    const input = screen.getByTestId("csv-file-input");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/csv files only/i)).toBeInTheDocument();
    });
  });

  it("shows an error when file exceeds 1MB", async () => {
    render(<UploadStep onParsed={mockOnParsed} />);
    const bigContent = "a".repeat(1024 * 1024 + 1);
    const file = new File([bigContent], "big.csv", { type: "text/csv" });
    const input = screen.getByTestId("csv-file-input");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/1mb/i)).toBeInTheDocument();
    });
  });
});
