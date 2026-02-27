import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme-toggle";

const mockSetTheme = vi.fn();
let mockTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme,
  }),
}));

// Mock the entire dropdown-menu to avoid Radix context/portal requirements in jsdom
vi.mock("@repo/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div role="menu">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button role="menuitem" onClick={onClick}>
      {children}
    </button>
  ),
}));

beforeEach(() => {
  mockSetTheme.mockClear();
  mockTheme = "light";
});

describe("ThemeToggle", () => {
  it("renders a trigger button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows Sun icon when theme is light", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
  });

  it("shows Moon icon when theme is dark", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
  });

  it("clicking Dark calls setTheme('dark')", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Dark"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("clicking Light calls setTheme('light')", async () => {
    mockTheme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Light"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("clicking System calls setTheme('system')", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("System"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});
