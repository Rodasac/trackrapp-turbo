import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CookieConsentBanner } from "../cookie-consent-banner";

// Radix Switch mock (prevents ResizeObserver errors from @radix-ui/react-use-size)
vi.mock("@repo/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
    disabled,
    "aria-label": ariaLabel,
  }: {
    checked?: boolean;
    onCheckedChange?: (v: boolean) => void;
    disabled?: boolean;
    "aria-label"?: string;
  }) => (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
    />
  ),
}));

// Use vi.hoisted so mocks are available inside the hoisted vi.mock factory
const { mockGetCookieConsent, mockSetCookieConsent } = vi.hoisted(() => ({
  mockGetCookieConsent: vi.fn(),
  mockSetCookieConsent: vi.fn(),
}));

vi.mock("@/lib/cookie-consent", () => ({
  getCookieConsent: mockGetCookieConsent,
  setCookieConsent: mockSetCookieConsent,
  hasConsented: vi.fn(),
  COOKIE_CONSENT_KEY: "trackr_cookie_consent",
}));

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    mockGetCookieConsent.mockReset();
    mockSetCookieConsent.mockReset();
    mockGetCookieConsent.mockReturnValue(null);
  });

  it("renders nothing when consent cookie already exists", () => {
    mockGetCookieConsent.mockReturnValue({
      necessary: true,
      functional: true,
      analytics: true,
      consentedAt: "2026-01-01T00:00:00.000Z",
    });

    const { container } = render(<CookieConsentBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders overlay when no consent cookie", () => {
    render(<CookieConsentBanner />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows heading and accept button", () => {
    render(<CookieConsentBanner />);
    expect(
      screen.getByRole("heading", { name: /we use cookies/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /accept all cookies/i }),
    ).toBeInTheDocument();
  });

  it("shows manage preferences button", () => {
    render(<CookieConsentBanner />);
    expect(
      screen.getByRole("button", { name: /manage preferences/i }),
    ).toBeInTheDocument();
  });

  it("shows link to /cookies policy", () => {
    render(<CookieConsentBanner />);
    const link = screen.getByRole("link", { name: /cookie policy/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/cookies");
  });

  it("calls setCookieConsent with all true and hides banner on Accept all", () => {
    render(<CookieConsentBanner />);
    fireEvent.click(
      screen.getByRole("button", { name: /accept all cookies/i }),
    );

    expect(mockSetCookieConsent).toHaveBeenCalledWith({
      functional: true,
      analytics: true,
    });
    // Banner should be gone after dismissal
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("expands preferences panel when Manage preferences is clicked", () => {
    render(<CookieConsentBanner />);

    // Panel not visible initially
    expect(screen.queryByText(/strictly necessary/i)).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /manage preferences/i }),
    );

    expect(screen.getByText(/strictly necessary/i)).toBeInTheDocument();
    expect(screen.getByText(/functional/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  it("renders 3 switches in preferences panel", () => {
    render(<CookieConsentBanner />);
    fireEvent.click(
      screen.getByRole("button", { name: /manage preferences/i }),
    );

    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(3);
  });

  it("necessary switch is disabled", () => {
    render(<CookieConsentBanner />);
    fireEvent.click(
      screen.getByRole("button", { name: /manage preferences/i }),
    );

    const necessarySwitch = screen.getByRole("switch", {
      name: /strictly necessary/i,
    });
    expect(necessarySwitch).toBeDisabled();
    expect(necessarySwitch).toHaveAttribute("aria-checked", "true");
  });

  it("toggles functional switch state on click", () => {
    render(<CookieConsentBanner />);
    fireEvent.click(
      screen.getByRole("button", { name: /manage preferences/i }),
    );

    const functionalSwitch = screen.getByRole("switch", {
      name: /functional/i,
    });
    // default: checked
    expect(functionalSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(functionalSwitch);
    expect(functionalSwitch).toHaveAttribute("aria-checked", "false");
  });

  it("toggles analytics switch state on click", () => {
    render(<CookieConsentBanner />);
    fireEvent.click(
      screen.getByRole("button", { name: /manage preferences/i }),
    );

    const analyticsSwitch = screen.getByRole("switch", {
      name: /analytics/i,
    });
    expect(analyticsSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(analyticsSwitch);
    expect(analyticsSwitch).toHaveAttribute("aria-checked", "false");
  });

  it("calls setCookieConsent with correct values on Save preferences", () => {
    render(<CookieConsentBanner />);
    fireEvent.click(
      screen.getByRole("button", { name: /manage preferences/i }),
    );

    // Turn off analytics
    fireEvent.click(screen.getByRole("switch", { name: /analytics/i }));

    fireEvent.click(screen.getByRole("button", { name: /save preferences/i }));

    expect(mockSetCookieConsent).toHaveBeenCalledWith({
      functional: true,
      analytics: false,
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
