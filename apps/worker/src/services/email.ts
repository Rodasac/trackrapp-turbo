import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

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

  await transporter.sendMail({ from, to, subject, text });
}
