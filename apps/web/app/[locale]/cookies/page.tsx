import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookies" });
  return {
    title: `${t("title")} — TrackrApp`,
    description: t("metaDescription"),
  };
}

export default async function CookiesPage() {
  const t = await getTranslations("legal.cookies");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("lastUpdated")}
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-semibold">{t("s1Title")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("s1Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s2Title")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("s2Intro")}
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>{t("s2Item1")}</li>
              <li>{t("s2Item2")}</li>
              <li>{t("s2Item3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s3Title")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("s3Intro")}
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>{t("s3Item1")}</li>
              <li>{t("s3Item2")}</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              {t("s3Note")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s4Title")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("s4Body")}
            </p>
            <p className="text-muted-foreground mt-2">
              {t("s4Intro2")}
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>{t("s4Chrome")}</li>
              <li>{t("s4Firefox")}</li>
              <li>{t("s4Safari")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s5Title")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("s5Intro")}
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>{t("s5Item1")}</li>
              <li>{t("s5Item2")}</li>
              <li>{t("s5Item3")}</li>
              <li>{t("s5Item4")}</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              {t("s5Consent")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s6Title")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("s6Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s7Title")}</h2>
            <p className="text-muted-foreground mt-2">
              {t("s7Body")}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
