import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { mockSession, mockAdminSession } from "@/tests/fixtures";

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: mockUseSession,
  signOut: vi.fn(),
}));

vi.mock("@/components/notification-bell", () => ({
  NotificationBell: () => <span>Bell</span>,
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button>Theme</button>,
}));

vi.mock("@/components/language-switcher", () => ({
  LanguageSwitcher: () => <button>Lang</button>,
}));

import React from "react";
import { SidebarNav } from "@/components/sidebar-nav";

describe("SidebarNav", () => {
  it("does not show admin link for regular users", () => {
    mockUseSession.mockReturnValue({ data: mockSession() });
    renderWithProviders(<SidebarNav />);
    expect(screen.queryByRole("link", { name: /admin/i })).toBeNull();
  });

  it("shows admin link for admin users", () => {
    mockUseSession.mockReturnValue({ data: mockAdminSession() });
    renderWithProviders(<SidebarNav />);
    expect(screen.getByRole("link", { name: /admin/i })).toBeInTheDocument();
  });

  it("renders base nav items for regular users", () => {
    mockUseSession.mockReturnValue({ data: mockSession() });
    renderWithProviders(<SidebarNav />);
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /subscriptions/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tips/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });
});
