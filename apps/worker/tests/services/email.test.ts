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

vi.mock("@repo/shared/i18n", () => ({
  getTranslator: (locale: string) => {
    const es = locale === "es";
    return (key: string, params?: Record<string, string | number>) => {
      const templates: Record<string, string> = {
        "renewal.dayLabelTomorrow": es ? "mañana" : "tomorrow",
        "renewal.dayLabelDays": es ? "en {days} días" : "in {days} days",
        "renewal.subjectTomorrow": es
          ? "Recordatorio: {name} se renueva mañana"
          : "Reminder: {name} renews tomorrow",
        "renewal.subjectDays": es
          ? "Recordatorio: {name} se renueva en {days} días"
          : "Reminder: {name} renews in {days} days",
        "renewal.previewTomorrow": es
          ? "Tu suscripción a {name} se renueva mañana."
          : "Your {name} subscription renews tomorrow.",
        "renewal.previewDays": es
          ? "Tu suscripción a {name} se renueva en {days} días."
          : "Your {name} subscription renews in {days} days.",
        "renewal.heading": es
          ? "Recordatorio de renovación"
          : "Renewal Reminder",
        "renewal.bodyTomorrow": es
          ? "Tu suscripción a <strong>{name}</strong> se renueva mañana."
          : "Your <strong>{name}</strong> subscription renews tomorrow.",
        "renewal.bodyDays": es
          ? "Tu suscripción a <strong>{name}</strong> se renueva en {days} días."
          : "Your <strong>{name}</strong> subscription renews in {days} days.",
        "renewal.cta": es ? "Ver en TrackrApp" : "View in TrackrApp",
        "renewal.footerText": es
          ? "Inicia sesión en TrackrApp para gestionar tus suscripciones."
          : "Log in to TrackrApp to manage your subscriptions.",
        "renewal.textGreeting": es ? "Hola," : "Hi there,",
        "renewal.textBodyTomorrow": es
          ? "Este es un recordatorio de que tu suscripción a {name} se renueva mañana."
          : "This is a reminder that your {name} subscription renews tomorrow.",
        "renewal.textBodyDays": es
          ? "Este es un recordatorio de que tu suscripción a {name} se renueva en {days} días."
          : "This is a reminder that your {name} subscription renews in {days} days.",
        "renewal.textAmount": es
          ? "Importe: {currency} {price}"
          : "Amount: {currency} {price}",
        "renewal.textFooter": es
          ? "Inicia sesión en TrackrApp para gestionar tus suscripciones."
          : "Log in to TrackrApp to manage your subscriptions.",
        "renewal.textSignature": "— TrackrApp",
      };
      let result = templates[key] ?? key;
      if (params) {
        result = result.replace(
          /\{(\w+)\}/g,
          (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`),
        );
      }
      return result;
    };
  },
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

    it("uses Spanish strings when locale is 'es'", async () => {
      const transporter = createTransporter({
        host: "localhost",
        port: 1025,
        secure: false,
      });
      await sendRenewalReminder(transporter, {
        to: "usuario@ejemplo.com",
        from: "noreply@trackrapp.local",
        subscriptionName: "Netflix",
        price: "15.99",
        currency: "USD",
        daysUntilRenewal: 3,
        locale: "es",
      });
      const call = mockSendMail.mock.calls[0][0] as {
        subject: string;
        text: string;
        html: string;
      };
      expect(call.subject).toContain("Recordatorio");
      expect(call.subject).toContain("Netflix");
      expect(call.text).toContain("Hola");
      expect(call.text).toContain("Netflix");
    });
  });
});
