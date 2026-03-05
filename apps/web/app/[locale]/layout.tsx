import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Serif_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "@repo/ui/sonner";
import { Providers } from "@/components/providers";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("siteTitle"),
    description: t("siteDescription"),
    alternates: {
      languages: {
        en: "/",
        es: "/es",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster richColors />
            <CookieConsentBanner />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
