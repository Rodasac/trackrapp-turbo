import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCards } from "@/components/landing/feature-cards";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsSection } from "@/components/landing/stats-section";
import { Testimonials } from "@/components/landing/testimonials";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { FaqSection } from "@/components/landing/faq-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col">
      <Navbar />
      <HeroSection />
      <FeatureCards />
      <HowItWorks />
      <StatsSection />
      <Testimonials />
      <ComparisonTable />
      <FaqSection />
      <PricingSection />
      <CtaBanner />
      <Footer />
    </main>
  );
}
