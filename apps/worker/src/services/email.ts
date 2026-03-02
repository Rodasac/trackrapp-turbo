import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  emailLayout,
  emailButton,
  EMAIL_BRAND,
} from "@repo/shared/email-templates";

export interface TransporterConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
}

export interface RenewalReminderParams {
  to: string;
  from: string;
  subscriptionName: string;
  price: string;
  currency: string;
  daysUntilRenewal: number;
}

export function createTransporter(config: TransporterConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? { user: config.user, pass: config.pass }
        : undefined,
  });
}

export async function sendRenewalReminder(
  transporter: Transporter,
  params: RenewalReminderParams,
): Promise<void> {
  const { to, from, subscriptionName, price, currency, daysUntilRenewal } =
    params;

  const dayLabel =
    daysUntilRenewal === 1 ? "tomorrow" : `in ${daysUntilRenewal} days`;
  const subject =
    daysUntilRenewal === 1
      ? `Reminder: ${subscriptionName} renews tomorrow`
      : `Reminder: ${subscriptionName} renews in ${daysUntilRenewal} days`;

  const text = [
    `Hi there,`,
    ``,
    `This is a reminder that your ${subscriptionName} subscription renews ${dayLabel}.`,
    ``,
    `Amount: ${currency} ${price}`,
    ``,
    `Log in to TrackrApp to manage your subscriptions.`,
    ``,
    `— TrackrApp`,
  ].join("\n");

  const appUrl = process.env.APP_URL ?? EMAIL_BRAND.appUrl;

  const html = emailLayout({
    previewText: `Your ${subscriptionName} subscription renews ${dayLabel}.`,
    appUrl,
    content: `
      <h2 style="margin:0 0 8px;font-family:${EMAIL_BRAND.fontStack};font-size:24px;color:#0f172a;font-weight:400;">Renewal Reminder</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
        Your <strong>${subscriptionName}</strong> subscription renews ${dayLabel}.
      </p>
      <p style="margin:0 0 28px;font-size:20px;font-weight:700;color:#0f172a;">${currency} ${price}</p>
      ${emailButton("View in TrackrApp", `${appUrl}/subscriptions`)}
      <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
        Log in to TrackrApp to manage your subscriptions.
      </p>
    `,
  });

  await transporter.sendMail({ from, to, subject, text, html });
}
