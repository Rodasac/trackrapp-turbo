import { describe, it, expect } from "vitest";
import { queryKeys } from "../query-keys";

describe("queryKeys", () => {
  it("categories.all is a stable array", () => {
    expect(queryKeys.categories.all).toEqual(["categories"]);
  });

  it("subscriptions.all is a stable array", () => {
    expect(queryKeys.subscriptions.all).toEqual(["subscriptions"]);
  });

  it("subscriptions.list includes filters in key", () => {
    const key = queryKeys.subscriptions.list({ search: "netflix" });
    expect(key[0]).toBe("subscriptions");
    expect(key[1]).toBe("list");
    expect(key[2]).toEqual({ search: "netflix" });
  });

  it("subscriptions.list with different filters produces different keys", () => {
    const key1 = queryKeys.subscriptions.list({ search: "netflix" });
    const key2 = queryKeys.subscriptions.list({ search: "spotify" });
    expect(key1).not.toEqual(key2);
  });

  it("subscriptions.detail includes the id", () => {
    const key = queryKeys.subscriptions.detail(42);
    expect(key).toEqual(["subscriptions", "detail", 42]);
  });

  it("subscriptions.detail with different ids produces different keys", () => {
    expect(queryKeys.subscriptions.detail(1)).not.toEqual(
      queryKeys.subscriptions.detail(2),
    );
  });

  it("dashboard.stats is a stable array", () => {
    expect(queryKeys.dashboard.stats).toEqual(["dashboard", "stats"]);
  });

  it("dashboard.charts is a stable array", () => {
    expect(queryKeys.dashboard.charts).toEqual(["dashboard", "charts"]);
  });

  it("dashboard.renewals is a stable array", () => {
    expect(queryKeys.dashboard.renewals).toEqual(["dashboard", "renewals"]);
  });

  it("dashboard.tips is a stable array", () => {
    expect(queryKeys.dashboard.tips).toEqual(["dashboard", "tips"]);
  });

  it("serviceCatalog.search includes the query", () => {
    const key = queryKeys.serviceCatalog.search("netflix");
    expect(key).toEqual(["serviceCatalog", "search", "netflix"]);
  });
});
