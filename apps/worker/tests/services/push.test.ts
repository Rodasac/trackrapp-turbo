import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({}),
  },
}));

import webpush from "web-push";
import { initVapid, sendPushNotification } from "../../src/services/push.js";

describe("push service", () => {
  beforeEach(() => {
    vi.mocked(webpush.setVapidDetails).mockClear();
    vi.mocked(webpush.sendNotification).mockClear();
  });

  describe("initVapid", () => {
    it("calls setVapidDetails with provided keys", () => {
      initVapid({
        subject: "mailto:test@example.com",
        publicKey: "public123",
        privateKey: "private456",
      });
      expect(webpush.setVapidDetails).toHaveBeenCalledWith(
        "mailto:test@example.com",
        "public123",
        "private456",
      );
    });
  });

  describe("sendPushNotification", () => {
    it("calls sendNotification with subscription and serialized payload", async () => {
      const subscription = {
        endpoint: "https://push.example.com/sub/123",
        keys: { p256dh: "key1", auth: "auth1" },
      };
      await sendPushNotification(subscription, {
        title: "Renewal Reminder",
        message: "Netflix renews tomorrow",
        url: "/subscriptions/1",
      });
      expect(webpush.sendNotification).toHaveBeenCalledOnce();
      const [sub, payload] = vi.mocked(webpush.sendNotification).mock.calls[0];
      expect(sub).toEqual(subscription);
      const parsed = JSON.parse(payload as string);
      expect(parsed.title).toBe("Renewal Reminder");
      expect(parsed.message).toBe("Netflix renews tomorrow");
      expect(parsed.url).toBe("/subscriptions/1");
    });

    it("resolves without throwing", async () => {
      await expect(
        sendPushNotification(
          {
            endpoint: "https://push.example.com/sub/456",
            keys: { p256dh: "k", auth: "a" },
          },
          { title: "Test", message: "Test msg", url: "/" },
        ),
      ).resolves.toBeUndefined();
    });
  });
});
