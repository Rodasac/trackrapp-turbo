import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createTransporter,
  sendRenewalReminder,
} from "../../src/services/email.js";

const { mockCreateTransport, mockSendMail } = vi.hoisted(() => {
  const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
  const mockCreateTransport = vi
    .fn()
    .mockReturnValue({ sendMail: mockSendMail });
  return { mockCreateTransport, mockSendMail };
});

vi.mock("nodemailer", () => ({
  default: { createTransport: mockCreateTransport },
}));

vi.mock("@repo/shared/email-templates", () => ({
  emailLayout: vi.fn(
    ({ content }: { content: string }) =>
      `<!DOCTYPE html><html>${content}</html>`,
  ),
  emailButton: vi.fn(
    (text: string, href: string) =>
      `<a href="${href}" style="background:#10b981">${text}</a>`,
  ),
  EMAIL_BRAND: {
    primary: "#10b981",
    foreground: "#f0fdf4",
    heroBg: "#0f172a",
    appName: "TrackrApp",
    appUrl: "https://trackrapp.xyz",
    fontStack: "Georgia, serif",
    bodyFontStack: "sans-serif",
  },
}));

describe("email service", () => {
  beforeEach(() => {
    mockSendMail.mockClear();
    mockCreateTransport.mockClear();
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
  });

  describe("createTransporter", () => {
    it("creates transporter with correct SMTP config (no auth)", () => {
      createTransporter({ host: "localhost", port: 1025, secure: false });
      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: "localhost",
        port: 1025,
        secure: false,
        auth: undefined,
      });
    });

    it("includes auth when user and pass provided", () => {
      createTransporter({
        host: "smtp.example.com",
        port: 465,
        secure: true,
        user: "u",
        pass: "p",
      });
      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: "smtp.example.com",
        port: 465,
        secure: true,
        auth: { user: "u", pass: "p" },
      });
    });
  });

  describe("sendRenewalReminder", () => {
    it("sends email with correct fields for days > 1", async () => {
      const transporter = createTransporter({
        host: "localhost",
        port: 1025,
        secure: false,
      });
      await sendRenewalReminder(transporter, {
        to: "user@example.com",
        from: "noreply@trackrapp.local",
        subscriptionName: "Netflix",
        price: "15.99",
        currency: "USD",
        daysUntilRenewal: 7,
      });
      expect(mockSendMail).toHaveBeenCalledOnce();
      const call = mockSendMail.mock.calls[0][0] as {
        to: string;
        from: string;
        subject: string;
        text: string;
        html: string;
      };
      expect(call.to).toBe("user@example.com");
      expect(call.from).toBe("noreply@trackrapp.local");
      expect(call.subject).toContain("Netflix");
      expect(call.subject).toContain("7");
      expect(call.text).toContain("Netflix");
      expect(call.text).toContain("15.99");
      expect(call.text).toContain("USD");
      expect(call.text).toContain("7 days");
      expect(call.html).toBeDefined();
      expect(call.html).toContain("<!DOCTYPE html>");
      expect(call.html).toContain("Netflix");
      expect(call.html).toContain("15.99");
      expect(call.html).toContain("#10b981");
    });

    it("uses 'tomorrow' language when daysUntilRenewal is 1", async () => {
      const transporter = createTransporter({
        host: "localhost",
        port: 1025,
        secure: false,
      });
      await sendRenewalReminder(transporter, {
        to: "user@example.com",
        from: "noreply@trackrapp.local",
        subscriptionName: "Spotify",
        price: "9.99",
        currency: "USD",
        daysUntilRenewal: 1,
      });
      const call = mockSendMail.mock.calls[0][0] as {
        subject: string;
        text: string;
        html: string;
      };
      expect(call.subject).toMatch(/tomorrow/i);
      expect(call.text).toMatch(/tomorrow/i);
      expect(call.html).toBeDefined();
      expect(call.html).toContain("<!DOCTYPE html>");
      expect(call.html).toContain("Spotify");
      expect(call.html).toContain("9.99");
    });
  });
});
