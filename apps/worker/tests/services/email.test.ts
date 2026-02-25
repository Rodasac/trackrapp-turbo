import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

import nodemailer from "nodemailer";
import {
  createTransporter,
  sendRenewalReminder,
} from "../../src/services/email.js";

const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });

describe("email service", () => {
  beforeEach(() => {
    vi.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail: mockSendMail,
    } as ReturnType<typeof nodemailer.createTransport>);
    mockSendMail.mockClear();
    vi.mocked(nodemailer.createTransport).mockClear();
  });

  describe("createTransporter", () => {
    it("creates transporter with correct SMTP config (no auth)", () => {
      createTransporter({ host: "localhost", port: 1025, secure: false });
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
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
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
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
      const call = mockSendMail.mock.calls[0][0];
      expect(call.to).toBe("user@example.com");
      expect(call.from).toBe("noreply@trackrapp.local");
      expect(call.subject).toContain("Netflix");
      expect(call.subject).toContain("7");
      expect(call.text).toContain("Netflix");
      expect(call.text).toContain("15.99");
      expect(call.text).toContain("USD");
      expect(call.text).toContain("7 days");
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
      const call = mockSendMail.mock.calls[0][0];
      expect(call.subject).toMatch(/tomorrow/i);
      expect(call.text).toMatch(/tomorrow/i);
    });
  });
});
