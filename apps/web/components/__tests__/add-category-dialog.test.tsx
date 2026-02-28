import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCategoryDialog } from "../add-category-dialog";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

vi.mock("@/hooks/use-subscription-mutations", () => ({
  useCreateCategory: vi.fn(),
  useSaveSubscription: vi.fn(),
  useDeactivateSubscription: vi.fn(),
  useDeleteSubscription: vi.fn(),
}));

// Simple stub so tests don't need to handle icon autocomplete interactions
vi.mock("@/components/icon-search", () => ({
  IconSearch: ({
    onChange,
  }: {
    value: string | undefined;
    onChange: (v: string | undefined) => void;
  }) => (
    <input
      aria-label="Icon search"
      placeholder="Search icons..."
      onChange={(e) => onChange(e.target.value || undefined)}
    />
  ),
}));

import { useCreateCategory } from "@/hooks/use-subscription-mutations";
const mockUseCreateCategory = vi.mocked(useCreateCategory);

const mockMutateAsync = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCreateCategory.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as never);
});

describe("AddCategoryDialog", () => {
  it("renders the trigger button initially", () => {
    renderWithProviders(<AddCategoryDialog onCreated={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /new category/i }),
    ).toBeInTheDocument();
  });

  it("opens the dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddCategoryDialog onCreated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /new category/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Dialog has Name input (use placeholder since "Icon (emoji or name)" also matches /name/i)
    expect(
      screen.getByPlaceholderText("e.g. Entertainment"),
    ).toBeInTheDocument();
  });

  it("shows validation error when submitting empty name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddCategoryDialog onCreated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /new category/i }));
    await user.click(screen.getByRole("button", { name: /^create$/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("calls mutateAsync and onCreated on successful submit", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const createdCat = {
      id: 5,
      name: "Work",
      color: null,
      icon: null,
      userId: "u1",
    };
    mockMutateAsync.mockResolvedValue(createdCat);

    renderWithProviders(<AddCategoryDialog onCreated={onCreated} />);
    await user.click(screen.getByRole("button", { name: /new category/i }));
    await user.type(screen.getByPlaceholderText(/entertainment/i), "Work");
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Work" }),
      );
      expect(onCreated).toHaveBeenCalledWith(createdCat);
    });
  });

  it("shows error toast on mutation failure", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error("Server error"));

    renderWithProviders(<AddCategoryDialog onCreated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /new category/i }));
    await user.type(screen.getByPlaceholderText(/entertainment/i), "Work");
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create category");
    });
  });

  it("closes dialog and resets form on success", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ id: 1, name: "Work" });

    renderWithProviders(<AddCategoryDialog onCreated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /new category/i }));
    await user.type(screen.getByPlaceholderText(/entertainment/i), "Work");
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("dialog submit does not trigger parent form submit", async () => {
    const user = userEvent.setup();
    const parentOnSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    mockMutateAsync.mockResolvedValue({ id: 1, name: "Work" });

    renderWithProviders(
      <form onSubmit={parentOnSubmit}>
        <AddCategoryDialog onCreated={vi.fn()} />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: /new category/i }));
    await user.type(screen.getByPlaceholderText(/entertainment/i), "Work");
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
    expect(parentOnSubmit).not.toHaveBeenCalled();
  });
});
