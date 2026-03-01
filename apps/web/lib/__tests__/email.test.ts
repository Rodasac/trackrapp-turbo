import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock nodemailer before importing the module under test
const mockSendMail = vi.fn();
const mockCreateTransport = vi.fn().mockReturnValue({ sendMail: mockSendMail });

vi.mock("nodemailer", () => ({
  default: { createTransport: mockCreateTransport },
}));

// Import AFTER mock is set up
const { sendEmail } = await import("../email.js");

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns success when transport sends successfully", async () => {
    mockSendMail.mockResolvedValueOnce({ messageId: "test-id" });

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result).toEqual({ success: true });
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    );
  });

  it("returns success:false with error message when transport throws", async () => {
    mockSendMail.mockRejectedValueOnce(new Error("Connection refused"));

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result).toEqual({ success: false, error: "Connection refused" });
  });

  it("uses localhost:1025 when no SMTP env vars set", async () => {
    mockSendMail.mockResolvedValueOnce({});

    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "localhost", port: 1025 }),
    );
  });

  it("uses SMTP_HOST and SMTP_PORT from env vars", async () => {
    // Re-import module with new env to test env reading at transport creation
    vi.stubEnv("SMTP_HOST", "mail.example.com");
    vi.stubEnv("SMTP_PORT", "587");
    mockSendMail.mockResolvedValueOnce({});

    // Call sendEmail again — createTransport is called fresh each invocation
    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "mail.example.com", port: 587 }),
    );
  });

  it("includes auth when SMTP_USER and SMTP_PASS are set", async () => {
    vi.stubEnv("SMTP_USER", "myuser");
    vi.stubEnv("SMTP_PASS", "mypass");
    mockSendMail.mockResolvedValueOnce({});

    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: { user: "myuser", pass: "mypass" },
      }),
    );
  });

  it("uses default from address when EMAIL_FROM is not set", async () => {
    mockSendMail.mockResolvedValueOnce({});

    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>h</p>" });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "TrackrApp <noreply@trackrapp.local>",
      }),
    );
  });

  it("handles non-Error throws gracefully", async () => {
    mockSendMail.mockRejectedValueOnce("string error");

    const result = await sendEmail({ to: "a@b.com", subject: "s", html: "" });

    expect(result).toEqual({ success: false, error: "Unknown error" });
  });
});
