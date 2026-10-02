"use client";

import { useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription } from "@/app/actions";

type State = "loading" | "unsupported" | "ios-install" | "off" | "on" | "denied";

function urlBase64ToUint8Array(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

export default function NotificationsCard() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      // iOS only supports web push for apps added to the Home Screen.
      if (isIOS() && !isStandalone()) return setState("ios-install");
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub && Notification.permission === "granted" ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    setError("");
    try {
      const permission = await Notification.requestPermission(); // only ever called from this button
      if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      const j = sub.toJSON();
      const res = await savePushSubscription({ endpoint: sub.endpoint, p256dh: j.keys!.p256dh, auth: j.keys!.auth });
      if (!res.ok) throw new Error("save failed");
      setState("on");
    } catch {
      setError("Couldn’t turn on notifications. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return null;

  return (
    <section className="card mb-6 text-sm">
      <h2 className="mb-1 font-semibold">Notifications</h2>
      {state === "ios-install" && (
        <IosGuide />
      )}
      {state === "unsupported" && <p className="text-slate-600">This browser doesn’t support push notifications.</p>}
      {state === "denied" && <p className="text-slate-600">Notifications are blocked. Allow them for this site in your browser settings, then reload.</p>}
      {state === "off" && (
        <>
          <p className="mb-2 text-slate-600">Get a reminder on this device when something is due, even when the app is closed.</p>
          <button className="btn" onClick={enable} disabled={busy}>Enable notifications</button>
        </>
      )}
      {state === "on" && (
        <>
          <p className="mb-2 text-green-700">Notifications are on for this device.</p>
          <button className="btn-ghost" onClick={disable} disabled={busy}>Turn off</button>
        </>
      )}
      {error && <p className="mt-2 text-red-700">{error}</p>}
    </section>
  );
}

function IosGuide() {
  // Only rendered after the client-side check, so reading localStorage here is safe.
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem("ios-guide-seen") === "1"; } catch { return false; }
  });
  function dismiss() {
    try { localStorage.setItem("ios-guide-seen", "1"); } catch {}
    setHidden(true);
  }
  if (hidden) return <p className="text-slate-600">To get notifications on iPhone, add this app to your Home Screen first.</p>;
  return (
    <div className="space-y-2 text-slate-700">
      <p>On iPhone, notifications only work after you add this app to your Home Screen:</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Open this site in <strong>Safari</strong>.</li>
        <li>Tap the <strong>Share</strong> button, then <strong>Add to Home Screen</strong>.</li>
        <li>Open <strong>Ente Vaahanam</strong> from your Home Screen and come back here to enable notifications.</li>
      </ol>
      <button className="btn-ghost" onClick={dismiss}>Got it</button>
    </div>
  );
}
