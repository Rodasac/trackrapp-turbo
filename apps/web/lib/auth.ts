import argon2 from "argon2";
import { betterAuth, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { db } from "@repo/database";
import { sendEmail } from "@/lib/email";
import { PRICING } from "@/lib/pricing-config";
import {
  emailLayout,
  emailButton,
  EMAIL_BRAND,
} from "@repo/shared/email-templates";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 5,
    storage: "memory",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/forgot-password": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: async (password) => await argon2.hash(password),
      verify: async ({ hash, password }) => await argon2.verify(hash, password),
    },
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your TrackrApp password",
        html: getResetPasswordTemplate(user, url),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your TrackrApp email",
        html: getEmailVerificationTemplate(user, url),
      });
    },
  },
  user: {
    changeEmail: {
      // sendVerificationEmail is also called on email change
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: process.env.STRIPE_SECRET_KEY
    ? [
        stripe({
          stripeClient: new Stripe(process.env.STRIPE_SECRET_KEY),
          stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
          createCustomerOnSignUp: true,
          subscription: {
            enabled: true,
            plans: [
              {
                name: "pro",
                priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
                annualDiscountPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
                freeTrial: { days: PRICING.pro.trialDays },
              },
            ],
          },
        }),
      ]
    : [],
});

const checkIfNewUser = (user: User) => {
  return user.createdAt === user.updatedAt;
};

const getEmailVerificationTemplate = (user: User, url: string) => {
  if (checkIfNewUser(user)) {
    return emailLayout({
      previewText: "Verify your email to start tracking your subscriptions.",
      content: `
        <h2 style="margin:0 0 12px;font-family:${EMAIL_BRAND.fontStack};font-size:26px;color:#0f172a;font-weight:400;">Welcome to ${EMAIL_BRAND.appName}!</h2>
        <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">Click the button below to verify your email address and start tracking your subscriptions.</p>
        ${emailButton("Verify email", url)}
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">If you didn't create a ${EMAIL_BRAND.appName} account, you can safely ignore this email.</p>
      `,
    });
  }

  return emailLayout({
    previewText: "Verify your new email address.",
    content: `
      <h2 style="margin:0 0 12px;font-family:${EMAIL_BRAND.fontStack};font-size:26px;color:#0f172a;font-weight:400;">Verify your ${EMAIL_BRAND.appName} email</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">Click the button below to verify your email address.</p>
      ${emailButton("Verify email", url)}
    `,
  });
};

const getResetPasswordTemplate = (user: User, url: string) => {
  return emailLayout({
    previewText: "Reset your TrackrApp password.",
    content: `
      <h2 style="margin:0 0 12px;font-family:${EMAIL_BRAND.fontStack};font-size:26px;color:#0f172a;font-weight:400;">Reset your password</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">Hi ${user.name ?? user.email}, click the button below to reset your ${EMAIL_BRAND.appName} password. This link expires in 1 hour.</p>
      ${emailButton("Reset password", url)}
      <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">If you didn't request a password reset, you can safely ignore this email. Your password won't change.</p>
    `,
  });
};

export type Auth = typeof auth;
