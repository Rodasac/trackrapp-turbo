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
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return {
    title: `${t("title")} — TrackrApp`,
    description: t("metaDescription"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal.privacy");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t("lastUpdated")}</p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-semibold">{t("s1Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s1Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s2Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s2Intro")}</p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>{t("s2Item1")}</li>
              <li>{t("s2Item2")}</li>
              <li>{t("s2Item3")}</li>
              <li>{t("s2Item4")}</li>
              <li>{t("s2Item5")}</li>
            </ul>
            <p className="text-muted-foreground mt-2">{t("s2Technical")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s3Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s3Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s4Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s4Intro")}</p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>{t("s4Item1")}</li>
              <li>{t("s4Item2")}</li>
              <li>{t("s4Item3")}</li>
              <li>{t("s4Item4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s5Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s5Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s6Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s6Intro")}</p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>{t("s6Item1")}</li>
              <li>{t("s6Item2")}</li>
              <li>{t("s6Item3")}</li>
              <li>{t("s6Item4")}</li>
              <li>{t("s6Item5")}</li>
              <li>{t("s6Item6")}</li>
            </ul>
            <p className="text-muted-foreground mt-2">{t("s6Contact")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s7Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s7Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s8Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s8Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s9Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s9Body")}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
