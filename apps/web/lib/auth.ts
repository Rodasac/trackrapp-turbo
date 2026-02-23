import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { db } from "@repo/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
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
                name: "free",
                // TODO: define your free plan limits here
              },
              {
                name: "pro",
                // TODO: add trialDays, priceId etc. here
              },
            ],
          },
        }),
      ]
    : [],
});

export type Auth = typeof auth;