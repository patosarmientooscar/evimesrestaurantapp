"use client";

import { useEffect, useState } from "react";

interface Props {
  restaurantId: string;
}

type PermState = "default" | "granted" | "denied" | "unsupported";

export function PushToggle({ restaurantId }: Props) {
  const [permState, setPermState] = useState<PermState>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermState("unsupported");
      return;
    }
    setPermState(Notification.permission as PermState);
  }, []);

  async function subscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPermState("denied");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, subscription: sub.toJSON() }),
      });

      setPermState("granted");
    } catch (err) {
      console.error("[push] subscribe error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;

      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });

      await sub.unsubscribe();
      setPermState("default");
    } catch (err) {
      console.error("[push] unsubscribe error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (permState === "unsupported") return null;

  if (permState === "granted") {
    return (
      <button onClick={unsubscribe} disabled={loading} style={btnStyle("#374151")}>
        {loading ? "..." : "🔔 Notificaciones activas"}
      </button>
    );
  }

  if (permState === "denied") {
    return (
      <span style={{ fontSize: "12px", color: "var(--color-muted)" }}>
        Notificaciones bloqueadas en el navegador
      </span>
    );
  }

  return (
    <button onClick={subscribe} disabled={loading} style={btnStyle("var(--color-accent)")}>
      {loading ? "..." : "🔔 Activar notificaciones"}
    </button>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: bg,
    color: "#fff",
    fontSize: "13px",
    fontFamily: "var(--font-ui)",
    cursor: "pointer",
    opacity: 1,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
