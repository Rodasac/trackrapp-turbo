"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { useSubscribeToPush, useUnsubscribeFromPush } from "@/hooks/use-notification-mutations";

interface Props {
  vapidPublicKey?: string;
}

type PushStatus = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushNotificationManager({ vapidPublicKey }: Props) {
  const [status, setStatus] = useState<PushStatus>(() => {
    if (typeof window === "undefined") return "loading";
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return "unsupported";
    }
    if (Notification.permission === "denied") return "denied";
    return "loading";
  });
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const { mutateAsync: subscribe, isPending: subscribing } = useSubscribeToPush();
  const { mutateAsync: unsubscribe, isPending: unsubscribing } = useUnsubscribeFromPush();

  useEffect(() => {
    if (status !== "loading") return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) {
          setStatus("subscribed");
          setCurrentEndpoint(sub.endpoint);
        } else {
          setStatus("unsubscribed");
        }
      })
      .catch(() => setStatus("unsubscribed"));
  }, [status]);

  async function handleSubscribe() {
    if (!vapidPublicKey) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;
      await subscribe({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      setStatus("subscribed");
      setCurrentEndpoint(json.endpoint);
    } catch {
      // User denied or browser error
    }
  }

  async function handleUnsubscribe() {
    if (!currentEndpoint) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      await sub?.unsubscribe();
      await unsubscribe(currentEndpoint);
      setStatus("unsubscribed");
      setCurrentEndpoint(null);
    } catch {
      // ignore
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-muted-foreground text-sm">
        Push notifications are not supported in this browser.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-muted-foreground text-sm">
        Push notifications are blocked. Update your browser settings to allow
        them.
      </p>
    );
  }

  if (status === "loading") {
    return <div className="bg-muted h-8 w-48 animate-pulse rounded" />;
  }

  if (status === "subscribed") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-green-600">
          ✓ Browser notifications enabled
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnsubscribe}
          disabled={unsubscribing}
        >
          Disable
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSubscribe}
      disabled={subscribing || !vapidPublicKey}
    >
      Enable browser notifications
    </Button>
  );
}
