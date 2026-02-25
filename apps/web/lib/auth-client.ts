import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [stripeClient({ subscription: true })],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
