import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/hooks/use-is-admin", () => ({
  useIsAdmin: vi.fn(),
}));

vi.mock("@/components/admin/admin-stats", () => ({
  AdminStats: () => <div data-testid="admin-stats">Stats</div>,
}));

vi.mock("@/components/admin/admin-user-table", () => ({
  AdminUserTable: () => <div data-testid="admin-user-table">User Table</div>,
}));

vi.mock("@/hooks/use-admin-users", () => ({
  useAdminUsers: vi.fn(() => ({
    data: { users: [], total: 0 },
    isLoading: false,
  })),
}));

import React from "react";
import AdminPage from "@/app/[locale]/(dashboard)/admin/page";
import { useIsAdmin } from "@/hooks/use-is-admin";

const mockUseIsAdmin = vi.mocked(useIsAdmin);

describe("AdminPage", () => {
  it("shows access denied for non-admin users", () => {
    mockUseIsAdmin.mockReturnValue(false);
    renderWithProviders(<AdminPage />);
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it("renders admin stats and user table for admin users", () => {
    mockUseIsAdmin.mockReturnValue(true);
    renderWithProviders(<AdminPage />);
    expect(screen.getByTestId("admin-stats")).toBeInTheDocument();
    expect(screen.getByTestId("admin-user-table")).toBeInTheDocument();
  });

  it("shows page title for admin users", () => {
    mockUseIsAdmin.mockReturnValue(true);
    renderWithProviders(<AdminPage />);
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  it("does not render admin components when access denied", () => {
    mockUseIsAdmin.mockReturnValue(false);
    renderWithProviders(<AdminPage />);
    expect(screen.queryByTestId("admin-stats")).not.toBeInTheDocument();
    expect(screen.queryByTestId("admin-user-table")).not.toBeInTheDocument();
  });
});
