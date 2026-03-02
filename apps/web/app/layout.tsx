import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Serif_Display } from "next/font/google";
import { Toaster } from "@repo/ui/sonner";
import { Providers } from "@/components/providers";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "TrackrApp — Subscription Tracker",
  description:
    "Track subscriptions, get renewal reminders, and insights on your spending.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster richColors />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
