import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Terms of Service — TrackrApp",
  description: "TrackrApp Terms of Service",
};

export default function TermsPage() {
  const lastUpdated = "March 1, 2026";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mt-2">
              By accessing or using TrackrApp (&quot;the Service&quot;), you
              agree to be bound by these Terms of Service (&quot;Terms&quot;).
              If you do not agree to these Terms, please do not use the Service.
              These Terms apply to all visitors, users, and others who access or
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground mt-2">
              TrackrApp is a subscription tracking service that allows users to
              monitor, manage, and analyse their recurring subscriptions.
              Features include renewal reminders, spending analytics, and (for
              Pro users) AI-powered spending tips.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p className="text-muted-foreground mt-2">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You must notify us immediately of any unauthorised use of
              your account. We reserve the right to terminate accounts that
              violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
            <p className="text-muted-foreground mt-2">
              You agree not to use the Service to: (a) violate any applicable
              laws or regulations; (b) transmit any harmful, offensive, or
              disruptive content; (c) attempt to gain unauthorised access to our
              systems; (d) use automated tools to scrape or extract data without
              permission; or (e) resell or sublicense access to the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              5. Subscription Plans & Payments
            </h2>
            <p className="text-muted-foreground mt-2">
              TrackrApp offers both free and paid subscription plans. Paid plans
              are billed on a monthly or annual basis via Stripe. All fees are
              non-refundable except as required by law. We reserve the right to
              change pricing with 30 days&apos; notice to existing subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
            <p className="text-muted-foreground mt-2">
              The Service and its original content, features, and functionality
              are owned by TrackrApp and are protected by international
              copyright, trademark, patent, trade secret, and other intellectual
              property laws. You may not copy, modify, or distribute any part of
              the Service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Limitation of Liability
            </h2>
            <p className="text-muted-foreground mt-2">
              To the fullest extent permitted by law, TrackrApp shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including loss of profits, data, or goodwill,
              arising from your use of the Service. Our total liability for any
              claims shall not exceed the amount you paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground mt-2">
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, either express or
              implied. We do not warrant that the Service will be uninterrupted,
              error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Termination</h2>
            <p className="text-muted-foreground mt-2">
              We reserve the right to suspend or terminate your access to the
              Service at any time, with or without cause, with or without
              notice. Upon termination, your right to use the Service will
              immediately cease. You may delete your account at any time from
              your settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
            <p className="text-muted-foreground mt-2">
              We may update these Terms from time to time. We will notify you of
              significant changes via email or in-app notice. Continued use of
              the Service after changes constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact</h2>
            <p className="text-muted-foreground mt-2">
              If you have questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@trackrapp.xyz"
                className="text-brand hover:underline"
              >
                legal@trackrapp.xyz
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
