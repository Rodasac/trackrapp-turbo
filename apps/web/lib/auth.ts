import argon2 from "argon2";
import { betterAuth, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dash, sentinel } from "@better-auth/infra";
import { admin } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import { i18n } from "@better-auth/i18n";
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
    enabled: process.env.PLAYWRIGHT !== "true",
    window: 60,
    max: 10,
    storage: "memory",
    customRules: {
      "/sign-in/email": { window: 60, max: 20 },
      "/sign-up/email": { window: 60, max: 20 },
      "/forgot-password": { window: 60, max: 10 },
      "/reset-password": { window: 60, max: 10 },
      "/send-verification-email": { window: 60, max: 10 },
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
  plugins: [
    i18n({
      translations: {
        es: {
          INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos",
          USER_ALREADY_EXISTS: "Ya existe una cuenta con este correo",
          EMAIL_NOT_VERIFIED:
            "Correo electrónico no verificado. Revisa tu bandeja de entrada.",
          INVALID_TOKEN: "Token inválido o expirado",
          TOKEN_EXPIRED: "El token ha expirado",
          USER_NOT_FOUND: "Usuario no encontrado",
          FAILED_TO_CREATE_USER: "Error al crear la cuenta",
          FAILED_TO_SEND_EMAIL: "Error al enviar el correo",
          PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 8 caracteres",
          PASSWORD_TOO_LONG: "La contraseña es demasiado larga",
        },
      },
      detection: ["cookie", "header"],
      localeCookie: "NEXT_LOCALE",
    }),
    admin(),
    dash(),
    sentinel({
      apiKey: process.env.BETTER_AUTH_API_KEY ?? "",
      security: {
        emailValidation: {
          enabled: process.env.NODE_ENV === "production",
        },
        compromisedPassword: {
          enabled: process.env.NODE_ENV === "production",
          action: "block",
        },

        // Location-based
        impossibleTravel: {
          enabled: process.env.NODE_ENV === "production",
          action: "challenge",
        },

        // Abuse prevention
        freeTrialAbuse: {
          enabled: process.env.NODE_ENV === "production",
          maxAccountsPerVisitor: 3,
          action: "block",
        },
        velocity: {
          enabled: process.env.NODE_ENV === "production",
          maxSignupsPerVisitor: 5,
          action: "challenge",
        },

        // Bot protection
        botBlocking: { action: "challenge" },
        suspiciousIpBlocking: { action: "block" },

        // Account monitoring
        staleUsers: {
          enabled: process.env.NODE_ENV === "production",
          staleDays: 90,
          notifyUser: true,
          notifyAdmin: true,
          adminEmail: "security@trackrapp.xyz",
        },
      },
    }),
    ...(process.env.STRIPE_SECRET_KEY
      ? [
          stripe({
            stripeClient: new Stripe(process.env.STRIPE_SECRET_KEY),
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
            createCustomerOnSignUp: process.env.PLAYWRIGHT !== "true",
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
      : []),
  ],
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
