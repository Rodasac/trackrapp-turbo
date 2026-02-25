import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { NotificationBell } from "../notification-bell";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/hooks/use-unread-notification-count", () => ({
  useUnreadNotificationCount: vi.fn(),
}));

import { useUnreadNotificationCount } from "@/hooks/use-unread-notification-count";
const mockUseCount = vi.mocked(useUnreadNotificationCount);

describe("NotificationBell", () => {
  it("renders without a badge when count is 0", () => {
    mockUseCount.mockReturnValue({ data: { count: 0 } } as never);
    const { container } = renderWithProviders(<NotificationBell />);
    // No badge span rendered
    expect(container.querySelector("span > span")).toBeNull();
  });

  it("renders without a badge when data is undefined (loading)", () => {
    mockUseCount.mockReturnValue({ data: undefined } as never);
    const { container } = renderWithProviders(<NotificationBell />);
    expect(container.querySelector("span > span")).toBeNull();
  });

  it("renders badge with count when count > 0", () => {
    mockUseCount.mockReturnValue({ data: { count: 3 } } as never);
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders badge with exact count for small numbers", () => {
    mockUseCount.mockReturnValue({ data: { count: 12 } } as never);
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("shows '99+' when count exceeds 99", () => {
    mockUseCount.mockReturnValue({ data: { count: 100 } } as never);
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("shows '99+' for count exactly 100", () => {
    mockUseCount.mockReturnValue({ data: { count: 100 } } as never);
    renderWithProviders(<NotificationBell />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });
});
