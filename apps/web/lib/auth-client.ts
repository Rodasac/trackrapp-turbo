import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { i18nClient } from "@better-auth/i18n/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [adminClient(), stripeClient({ subscription: true }), i18nClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
