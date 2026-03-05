import { describe, it, expect } from "vitest";
import { EMAIL_BRAND, emailLayout, emailButton } from "../email-templates.js";

describe("emailLayout", () => {
  it("returns a valid DOCTYPE HTML document", () => {
    const html = emailLayout({ content: "<p>Hello</p>" });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  it("includes the TrackrApp logo with T character", () => {
    const html = emailLayout({ content: "" });
    expect(html).toContain(">T<");
    expect(html).toContain(EMAIL_BRAND.appName);
  });

  it("includes the content in the body", () => {
    const content = '<p id="test-content">My test content</p>';
    const html = emailLayout({ content });
    expect(html).toContain(content);
  });

  it("includes footer with app and cookie policy links", () => {
    const html = emailLayout({ content: "" });
    expect(html).toContain(`href="${EMAIL_BRAND.appUrl}"`);
    expect(html).toContain(`href="${EMAIL_BRAND.appUrl}/cookies"`);
    expect(html).toContain("Cookie Policy");
  });

  it("uses brand color in header background", () => {
    const html = emailLayout({ content: "" });
    expect(html).toContain(EMAIL_BRAND.heroBg);
  });

  it("uses brand primary color for logo square", () => {
    const html = emailLayout({ content: "" });
    expect(html).toContain(`background:${EMAIL_BRAND.primary}`);
  });

  it("includes hidden preview text span when previewText provided", () => {
    const html = emailLayout({
      content: "",
      previewText: "Check your subscription",
    });
    expect(html).toContain("Check your subscription");
    expect(html).toContain("display:none");
  });

  it("does not include preview span when previewText is omitted", () => {
    const html = emailLayout({ content: "" });
    expect(html).not.toContain("display:none");
  });

  it("uses custom appUrl when provided", () => {
    const customUrl = "https://app.example.com";
    const html = emailLayout({ content: "", appUrl: customUrl });
    expect(html).toContain(`href="${customUrl}"`);
    expect(html).toContain(`href="${customUrl}/cookies"`);
  });

  it("falls back to EMAIL_BRAND.appUrl when appUrl not provided", () => {
    const html = emailLayout({ content: "" });
    expect(html).toContain(EMAIL_BRAND.appUrl);
  });

  it("defaults html lang to en", () => {
    const html = emailLayout({ content: "" });
    expect(html).toContain('lang="en"');
  });

  it("uses provided locale in html lang attribute", () => {
    const html = emailLayout({ content: "", locale: "es" });
    expect(html).toContain('lang="es"');
  });

  it("includes copyright notice", () => {
    const html = emailLayout({ content: "" });
    expect(html).toContain("All rights reserved.");
    expect(html).toContain(EMAIL_BRAND.appName);
  });
});

describe("emailButton", () => {
  it("returns an anchor element", () => {
    const button = emailButton("Click me", "https://example.com");
    expect(button).toContain("<a ");
    expect(button).toContain("</a>");
  });

  it("includes correct href", () => {
    const href = "https://trackrapp.xyz/verify";
    const button = emailButton("Verify", href);
    expect(button).toContain(`href="${href}"`);
  });

  it("includes button text", () => {
    const button = emailButton("Verify email", "https://example.com");
    expect(button).toContain("Verify email");
  });

  it("uses brand primary color as background", () => {
    const button = emailButton("Go", "https://example.com");
    expect(button).toContain(`background:${EMAIL_BRAND.primary}`);
  });

  it("uses brand foreground color as text color", () => {
    const button = emailButton("Go", "https://example.com");
    expect(button).toContain(`color:${EMAIL_BRAND.foreground}`);
  });

  it("has no text-decoration", () => {
    const button = emailButton("Go", "https://example.com");
    expect(button).toContain("text-decoration:none");
  });
});
