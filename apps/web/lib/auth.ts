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

export type Auth = typeof auth;
