import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCards } from "@/components/landing/feature-cards";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col">
      <Navbar />
      <HeroSection />
      <FeatureCards />
      <PricingSection />
      <Footer />
    </main>
  );
}
