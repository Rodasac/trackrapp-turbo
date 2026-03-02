import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Cookie Policy — TrackrApp",
  description: "TrackrApp Cookie Policy and GDPR information",
};

export default function CookiesPage() {
  const lastUpdated = "March 1, 2026";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-semibold">1. What Are Cookies</h2>
            <p className="text-muted-foreground mt-2">
              Cookies are small text files stored on your device when you visit a
              website. They help websites remember your preferences, keep you
              signed in, and understand how you use the service. Cookies are not
              malware — they cannot execute code or transmit viruses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. How We Use Cookies</h2>
            <p className="text-muted-foreground mt-2">
              TrackrApp uses the following types of cookies:
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>
                <strong>Strictly necessary:</strong> Session cookies required for
                authentication and security. These cannot be disabled.
              </li>
              <li>
                <strong>Functional:</strong> Cookies that remember your
                preferences (e.g., dark mode, language). These improve your
                experience but are not required.
              </li>
              <li>
                <strong>Analytics:</strong> Anonymised usage data to help us
                understand how the Service is used and improve it. No personally
                identifiable information is shared with analytics providers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Third-Party Cookies</h2>
            <p className="text-muted-foreground mt-2">
              Some features of our Service use third-party services that may set
              their own cookies:
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li><strong>Stripe:</strong> Payment processing — sets cookies to detect fraud and manage checkout sessions</li>
              <li><strong>Google OAuth:</strong> If you sign in with Google, Google may set authentication cookies</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We do not use advertising or tracking cookies from ad networks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Managing Cookies</h2>
            <p className="text-muted-foreground mt-2">
              You can control and delete cookies through your browser settings.
              Most browsers allow you to refuse or accept specific types of
              cookies. Please note that disabling strictly necessary cookies may
              prevent you from signing in or using core features of the Service.
            </p>
            <p className="text-muted-foreground mt-2">
              To manage cookies in your browser, visit:
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>Chrome: Settings → Privacy and security → Cookies</li>
              <li>Firefox: Settings → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Settings → Privacy → Manage Website Data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. GDPR Rights</h2>
            <p className="text-muted-foreground mt-2">
              Under the General Data Protection Regulation (GDPR), EU/EEA
              residents have the right to:
            </p>
            <ul className="text-muted-foreground mt-2 ml-4 list-disc space-y-1">
              <li>Know what cookies and tracking technologies are used</li>
              <li>Consent to or refuse non-essential cookies</li>
              <li>Withdraw consent at any time</li>
              <li>Request deletion of data collected via cookies</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              By using TrackrApp, you consent to our use of strictly necessary
              cookies. For functional and analytics cookies, you may opt out by
              adjusting your browser settings as described above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
            <p className="text-muted-foreground mt-2">
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or applicable law. We will notify you of
              material changes via email or in-app notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Contact</h2>
            <p className="text-muted-foreground mt-2">
              For questions about our use of cookies or this policy, contact us
              at{" "}
              <a href="mailto:privacy@trackrapp.com" className="text-brand hover:underline">
                privacy@trackrapp.com
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
