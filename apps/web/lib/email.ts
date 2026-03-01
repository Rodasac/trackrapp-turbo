import nodemailer from "nodemailer";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

function createTransport() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

const from = process.env.EMAIL_FROM ?? "TrackrApp <noreply@trackrapp.local>";

export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  try {
    const transporter = createTransport();
    await transporter.sendMail({ from, ...params });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
