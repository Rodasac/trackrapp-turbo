import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Privacy Policy — TrackrApp",
  description: "TrackrApp Privacy Policy",
};

export default function PrivacyPage() {
  const lastUpdated = "March 1, 2026";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground mt-2">
              TrackrApp (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
              committed to protecting your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <p className="text-muted-foreground mt-2">
              We collect information you provide directly to us, including:
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>Account information (name, email, password hash)</li>
              <li>
                Subscription data you enter (service names, prices, renewal
                dates)
              </li>
              <li>
                Payment information processed via Stripe (we never store raw
                card data)
              </li>
              <li>Profile information such as an avatar image</li>
              <li>Communications you send us</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We also collect technical data automatically: IP address, browser
              type, pages visited, and crash reports. This helps us improve the
              service and diagnose issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mt-2">
              We use your information to: provide and improve the Service; send
              renewal reminder notifications; generate AI-powered insights (Pro
              plan); process payments; respond to support requests; detect and
              prevent fraud; and comply with legal obligations. We do not sell
              your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Sharing</h2>
            <p className="text-muted-foreground mt-2">
              We share data only with trusted service providers who help us
              operate the Service, including:
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>
                <strong>Stripe</strong> — payment processing
              </li>
              <li>
                <strong>UploadThing</strong> — avatar file storage
              </li>
              <li>
                <strong>Resend / SMTP providers</strong> — email delivery
              </li>
              <li>
                <strong>AI providers (Anthropic/OpenAI)</strong> — Pro plan AI
                tips (anonymised subscription data only)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground mt-2">
              We retain your data for as long as your account is active or as
              needed to provide the Service. When you delete your account, we
              delete or anonymise your personal data within 30 days, except
              where required by law to retain it longer (e.g., payment records
              for financial compliance).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground mt-2">
              Depending on your location, you may have the following rights
              under GDPR, CCPA, or other applicable law:
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>
                <strong>Access:</strong> request a copy of your personal data
              </li>
              <li>
                <strong>Rectification:</strong> correct inaccurate data
              </li>
              <li>
                <strong>Erasure:</strong> request deletion of your data
              </li>
              <li>
                <strong>Portability:</strong> receive your data in a
                machine-readable format
              </li>
              <li>
                <strong>Objection:</strong> opt out of certain processing
              </li>
              <li>
                <strong>Restriction:</strong> limit how we process your data
              </li>
            </ul>
            <p className="text-muted-foreground mt-2">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@trackrapp.xyz"
                className="text-brand hover:underline"
              >
                privacy@trackrapp.xyz
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Security</h2>
            <p className="text-muted-foreground mt-2">
              We implement industry-standard security measures including
              encryption at rest and in transit (TLS 1.3), secure password
              hashing (argon2id), and regular security audits. No method of
              transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground mt-2">
              We may update this Privacy Policy periodically. We will notify you
              of material changes via email or prominent notice in the app.
              Continued use of the Service after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="text-muted-foreground mt-2">
              For privacy-related enquiries, contact us at{" "}
              <a
                href="mailto:privacy@trackrapp.xyz"
                className="text-brand hover:underline"
              >
                privacy@trackrapp.xyz
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
