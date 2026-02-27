import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/landing/navbar";

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
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows Sign in link and Get started button when unauthenticated", () => {
    setupLoggedOut();
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get started/i }),
    ).toBeInTheDocument();
  });

  it("shows Dashboard link when authenticated", () => {
    setupLoggedIn();
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
  });
});
