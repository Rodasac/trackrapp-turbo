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
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return {
    title: `${t("title")} — TrackrApp`,
    description: t("metaDescription"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("legal.terms");

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
            <p className="text-muted-foreground mt-2">{t("s2Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s3Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s3Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s4Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s4Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s5Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s5Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s6Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s6Body")}</p>
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

          <section>
            <h2 className="text-xl font-semibold">{t("s10Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s10Body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t("s11Title")}</h2>
            <p className="text-muted-foreground mt-2">{t("s11Body")}</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
