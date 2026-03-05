import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  emailLayout,
  emailButton,
  EMAIL_BRAND,
} from "@repo/shared/email-templates";
import { getTranslator } from "@repo/shared/i18n";

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
  locale?: string;
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
  const {
    to,
    from,
    subscriptionName,
    price,
    currency,
    daysUntilRenewal,
    locale = "en",
  } = params;

  const t = getTranslator(locale, "email");
  const isTomorrow = daysUntilRenewal === 1;

  const dayLabel = isTomorrow
    ? t("renewal.dayLabelTomorrow")
    : t("renewal.dayLabelDays", { days: daysUntilRenewal });

  const subject = isTomorrow
    ? t("renewal.subjectTomorrow", { name: subscriptionName })
    : t("renewal.subjectDays", { name: subscriptionName, days: daysUntilRenewal });

  const previewText = isTomorrow
    ? t("renewal.previewTomorrow", { name: subscriptionName })
    : t("renewal.previewDays", { name: subscriptionName, days: daysUntilRenewal });

  const bodyLine = isTomorrow
    ? t("renewal.bodyTomorrow", { name: subscriptionName })
    : t("renewal.bodyDays", { name: subscriptionName, days: daysUntilRenewal });

  const textBodyLine = isTomorrow
    ? t("renewal.textBodyTomorrow", { name: subscriptionName })
    : t("renewal.textBodyDays", { name: subscriptionName, days: daysUntilRenewal });

  const text = [
    t("renewal.textGreeting"),
    ``,
    textBodyLine,
    ``,
    t("renewal.textAmount", { currency, price }),
    ``,
    t("renewal.textFooter"),
    ``,
    t("renewal.textSignature"),
  ].join("\n");

  const appUrl = process.env.APP_URL ?? EMAIL_BRAND.appUrl;

  const html = emailLayout({
    previewText,
    appUrl,
    locale,
    content: `
      <h2 style="margin:0 0 8px;font-family:${EMAIL_BRAND.fontStack};font-size:24px;color:#0f172a;font-weight:400;">${t("renewal.heading")}</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
        ${bodyLine}
      </p>
      <p style="margin:0 0 28px;font-size:20px;font-weight:700;color:#0f172a;">${currency} ${price}</p>
      ${emailButton(t("renewal.cta"), `${appUrl}/subscriptions`)}
      <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
        ${t("renewal.footerText")}
      </p>
    `,
  });

  void dayLabel; // used via bodyLine/textBodyLine but keep for potential future use
  await transporter.sendMail({ from, to, subject, text, html });
}
