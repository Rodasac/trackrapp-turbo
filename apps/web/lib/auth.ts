import { betterAuth, User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { db } from "@repo/database";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
                freeTrial: { days: 14 },
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
    return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111;">Welcome to TrackrApp!</h2>
      <p>Click the button below to verify your email address and start tracking your subscriptions.</p>
      <a href="${url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
        Verify email
      </a>
      <p style="color: #666; font-size: 14px;">If you didn't create a TrackrApp account, you can safely ignore this email.</p>
    </div>
  `;
  }

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111;">Verify your TrackrApp email</h2>
      <p>Click the button below to verify your email address.</p>
      <a href="${url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
        Verify email
      </a>
    </div>
  `;
};

export type Auth = typeof auth;
