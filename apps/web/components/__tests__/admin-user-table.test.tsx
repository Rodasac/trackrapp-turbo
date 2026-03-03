import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/hooks/use-admin-mutations", () => ({
  useBanUser: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUnbanUser: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useSetUserRole: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

// Mock dropdown-menu to avoid Radix jsdom issues
vi.mock("@repo/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  DropdownMenuSeparator: () => <hr />,
}));

import React from "react";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import type { AdminUser } from "@/lib/types/api";

const mockUsers: AdminUser[] = [
  {
    id: "user-1",
    name: "Alice Smith",
    email: "alice@example.com",
    emailVerified: true,
    image: null,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "user-2",
    name: "Bob Jones",
    email: "bob@example.com",
    emailVerified: false,
    image: null,
    role: "admin",
    banned: true,
    banReason: "Spam",
    banExpires: null,
    createdAt: "2025-02-01T00:00:00.000Z",
  },
];

describe("AdminUserTable", () => {
  it("renders user rows", () => {
    renderWithProviders(
      <AdminUserTable users={mockUsers} total={2} onSearch={vi.fn()} />,
    );
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("renders user names", () => {
    renderWithProviders(
      <AdminUserTable users={mockUsers} total={2} onSearch={vi.fn()} />,
    );
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("renders roles for each user", () => {
    renderWithProviders(
      <AdminUserTable users={mockUsers} total={2} onSearch={vi.fn()} />,
    );
    expect(screen.getByText("user")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("shows banned badge for banned users", () => {
    renderWithProviders(
      <AdminUserTable users={mockUsers} total={2} onSearch={vi.fn()} />,
    );
    expect(screen.getByText(/banned/i)).toBeInTheDocument();
  });

  it("calls onSearch when search input changes", () => {
    const onSearch = vi.fn();
    renderWithProviders(
      <AdminUserTable users={mockUsers} total={2} onSearch={onSearch} />,
    );
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "alice" } });
    expect(onSearch).toHaveBeenCalledWith("alice");
  });

  it("shows empty state when no users", () => {
    renderWithProviders(
      <AdminUserTable users={[]} total={0} onSearch={vi.fn()} />,
    );
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });
});
