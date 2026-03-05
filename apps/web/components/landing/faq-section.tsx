"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
import { FadeIn } from "@/components/landing/motion/fade-in";
import { FAQ_ITEMS } from "@/lib/faq-data";
import { useTranslations } from "next-intl";

export function FaqSection() {
  const t = useTranslations("landing.faq");

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            {t("sectionDescription")}
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map(({ id, question, answer }) => (
              <AccordionItem key={id} value={id}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}
