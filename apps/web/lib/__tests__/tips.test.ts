import { describe, it, expect } from "vitest";
import { generateStaticTips } from "../tips";
import type { SubscriptionListItem } from "@/lib/types/api";

function makeSub(
  overrides: Partial<SubscriptionListItem> = {},
): SubscriptionListItem {
  return {
    id: 1,
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-04-01",
    isActive: true,
    logoUrl: null,
    websiteUrl: null,
    category: null,
    autoRenew: null,
    previousRenewalDate: null,
    ...overrides,
  };
}

describe("generateStaticTips", () => {
  it("returns empty array for no subscriptions", () => {
    expect(generateStaticTips([])).toEqual([]);
  });

  it("suggests annual savings when monthly subs have enough potential", () => {
    // 1 monthly sub at $15.99 → 15.99 * 12 * 0.17 ≈ $32.62 ≥ $10 threshold
    const subs = [makeSub({ billingCycle: "monthly", price: "15.99" })];
    const tips = generateStaticTips(subs);
    const tip = tips.find((t) => t.id === "annual-savings");
    expect(tip).toBeDefined();
    expect(tip?.type).toBe("savings");
  });

  it("does not suggest annual savings when potential is below $10", () => {
    // yearly sub → no monthly subs to suggest switching
    const subs = [makeSub({ billingCycle: "yearly", price: "50.00" })];
    const tips = generateStaticTips(subs);
    expect(tips.find((t) => t.id === "annual-savings")).toBeUndefined();
  });

  it("warns about high-spend category when it exceeds 40%", () => {
    const entertainment = {
      id: 1,
      name: "Entertainment",
      color: null,
      icon: null,
      userId: null,
    };
    const subs = [
      makeSub({ id: 1, price: "50.00", category: entertainment }),
      makeSub({ id: 2, name: "Spotify", price: "9.99", category: null }),
    ];
    const tips = generateStaticTips(subs);
    const tip = tips.find((t) => t.id.startsWith("high-spend-"));
    expect(tip).toBeDefined();
    expect(tip?.type).toBe("warning");
  });

  it("does not warn about high-spend when category is below 40%", () => {
    const ent = {
      id: 1,
      name: "Entertainment",
      color: null,
      icon: null,
      userId: null,
    };
    const prod = {
      id: 2,
      name: "Productivity",
      color: null,
      icon: null,
      userId: null,
    };
    const health = {
      id: 3,
      name: "Health",
      color: null,
      icon: null,
      userId: null,
    };
    // Each category is ~33% — none exceed 40%
    const subs = [
      makeSub({ id: 1, price: "20.00", category: ent }),
      makeSub({ id: 2, price: "20.00", category: prod }),
      makeSub({ id: 3, name: "Calm", price: "20.00", category: health }),
    ];
    const tips = generateStaticTips(subs);
    expect(tips.find((t) => t.id.startsWith("high-spend-"))).toBeUndefined();
  });

  it("warns about forgotten subscriptions past 60 days", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 90);
    const pastStr = pastDate.toISOString().split("T")[0]!;
    const subs = [makeSub({ nextRenewalDate: pastStr })];
    const tips = generateStaticTips(subs);
    const tip = tips.find((t) => t.id === "forgotten-subscriptions");
    expect(tip).toBeDefined();
    expect(tip?.type).toBe("warning");
  });

  it("does not warn about forgotten subs with future renewal date", () => {
    const subs = [makeSub({ nextRenewalDate: "2026-04-01" })];
    const tips = generateStaticTips(subs);
    expect(
      tips.find((t) => t.id === "forgotten-subscriptions"),
    ).toBeUndefined();
  });

  it("always includes daily cost tip when there are subscriptions", () => {
    const subs = [makeSub()];
    const tips = generateStaticTips(subs);
    const tip = tips.find((t) => t.id === "daily-cost");
    expect(tip).toBeDefined();
    expect(tip?.type).toBe("info");
    expect(tip?.message).toContain("/day");
  });

  it("warns about overlapping services when 2+ subs share a category", () => {
    const ent = {
      id: 1,
      name: "Entertainment",
      color: null,
      icon: null,
      userId: null,
    };
    const subs = [
      makeSub({ id: 1, name: "Netflix", category: ent }),
      makeSub({ id: 2, name: "Disney+", category: ent }),
    ];
    const tips = generateStaticTips(subs);
    const tip = tips.find((t) => t.id.startsWith("overlap-"));
    expect(tip).toBeDefined();
    expect(tip?.type).toBe("info");
    expect(tip?.message).toContain("Entertainment");
  });

  it("does not warn about overlap when subs are in different categories", () => {
    const ent = {
      id: 1,
      name: "Entertainment",
      color: null,
      icon: null,
      userId: null,
    };
    const prod = {
      id: 2,
      name: "Productivity",
      color: null,
      icon: null,
      userId: null,
    };
    const subs = [
      makeSub({ id: 1, category: ent }),
      makeSub({ id: 2, category: prod }),
    ];
    const tips = generateStaticTips(subs);
    expect(tips.find((t) => t.id.startsWith("overlap-"))).toBeUndefined();
  });
});
