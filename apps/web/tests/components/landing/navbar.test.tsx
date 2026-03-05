import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/landing/navbar";

vi.mock("@/components/language-switcher", () => ({
  LanguageSwitcher: () => <button data-testid="language-switcher">Lang</button>,
}));

// Mock dropdown-menu to avoid Radix context/portal requirements in jsdom
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

// Mock Sheet to avoid Radix portal in jsdom
vi.mock("@repo/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetClose: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
  }),
}));

import { useSession } from "@/lib/auth-client";

function setupLoggedOut() {
  vi.mocked(useSession).mockReturnValue({ data: null } as never);
}

function setupLoggedIn() {
  vi.mocked(useSession).mockReturnValue({
    data: { user: { id: "u1", name: "Alice" }, session: {} },
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  setupLoggedOut();
});

describe("Navbar", () => {
  it("renders logo with TrackrApp text", () => {
    render(<Navbar />);
    expect(screen.getByText("TrackrApp")).toBeInTheDocument();
  });

  it("renders ThemeToggle", () => {
    render(<Navbar />);
    // ThemeToggle renders a button (Sun/Moon icon)
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("shows Sign in link and Get started button when unauthenticated", () => {
    setupLoggedOut();
    render(<Navbar />);
    // Links appear in both desktop nav and mobile sheet mock
    const signInLinks = screen.getAllByRole("link", { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    const getStartedLinks = screen.getAllByRole("link", {
      name: /get started/i,
    });
    expect(getStartedLinks.length).toBeGreaterThan(0);
  });

  it("shows Dashboard link when authenticated", () => {
    setupLoggedIn();
    render(<Navbar />);
    // Dashboard link appears in both desktop nav and mobile sheet mock
    const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
    expect(dashboardLinks.length).toBeGreaterThan(0);
  });

  it("renders mobile menu trigger button", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /open menu/i }),
    ).toBeInTheDocument();
  });

  it("renders How it works nav link", () => {
    render(<Navbar />);
    expect(
      screen.getAllByRole("link", { name: /how it works/i })[0],
    ).toBeInTheDocument();
  });
});
