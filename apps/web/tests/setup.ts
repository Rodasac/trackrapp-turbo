import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

// Auto-cleanup rendered components after each test
afterEach(cleanup);

// Radix UI needs ResizeObserver in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Radix UI needs matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Radix UI uses scrollIntoView in listboxes
Element.prototype.scrollIntoView = vi.fn();

// motion/react uses IntersectionObserver for whileInView
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: IntersectionObserverCallback) {}
}
global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

// Mock locale-aware navigation (next-intl doesn't resolve in jsdom)
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) =>
    React.createElement(
      "a",
      { href: typeof href === "string" ? href : String(href), ...props },
      children,
    ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

// Mock next-intl so useTranslations/getTranslations work without a provider
vi.mock("next-intl", async (importOriginal) => {
  const messages = (await import("../messages/en.json")).default as Record<
    string,
    unknown
  >;

  function getNestedValue(
    obj: Record<string, unknown>,
    keyPath: string,
  ): unknown {
    const parts = keyPath.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (
        current &&
        typeof current === "object" &&
        part in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  function getNestedMessages(namespace: string): Record<string, unknown> {
    const parts = namespace.split(".");
    let current: Record<string, unknown> = messages;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part] as Record<string, unknown>;
      } else {
        return {};
      }
    }
    return current && typeof current === "object" ? current : {};
  }

  function makeTranslator(namespace: string) {
    const ns = getNestedMessages(namespace);
    return (key: string, params?: Record<string, unknown>) => {
      // Support dotted keys like "free.name" by traversing nested objects
      const raw = key.includes(".") ? getNestedValue(ns, key) : ns[key];
      if (typeof raw !== "string") return key;
      if (!params) return raw;
      return raw.replace(/\{(\w+)\}/g, (_: string, k: string) =>
        params[k] !== undefined ? String(params[k]) : `{${k}}`,
      );
    };
  }

  const original = await importOriginal<typeof import("next-intl")>();
  return {
    ...original,
    useTranslations: (namespace: string) => makeTranslator(namespace),
    getTranslations: async (namespace: string) => makeTranslator(namespace),
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
      children,
  };
});

vi.mock("next-intl/server", async () => {
  const messages = (await import("../messages/en.json")).default as Record<
    string,
    unknown
  >;

  function getNestedValue(
    obj: Record<string, unknown>,
    keyPath: string,
  ): unknown {
    const parts = keyPath.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (
        current &&
        typeof current === "object" &&
        part in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  function getNestedMessages(namespace: string): Record<string, unknown> {
    const parts = namespace.split(".");
    let current: Record<string, unknown> = messages;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part] as Record<string, unknown>;
      } else {
        return {};
      }
    }
    return current && typeof current === "object" ? current : {};
  }

  function makeTranslator(namespace: string) {
    const ns = getNestedMessages(namespace);
    return (key: string, params?: Record<string, unknown>) => {
      // Support dotted keys like "free.name" by traversing nested objects
      const raw = key.includes(".") ? getNestedValue(ns, key) : ns[key];
      if (typeof raw !== "string") return key;
      if (!params) return raw;
      return raw.replace(/\{(\w+)\}/g, (_: string, k: string) =>
        params[k] !== undefined ? String(params[k]) : `{${k}}`,
      );
    };
  }

  return {
    getTranslations: async (namespace: string) => makeTranslator(namespace),
    getLocale: async () => "en",
    getMessages: async () => messages,
    getNow: async () => new Date(),
    getTimeZone: async () => "UTC",
    getFormatter: async () => ({}),
  };
});

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));
