"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, BellOff, CheckCircle2, AlertTriangle, Smartphone } from "lucide-react";
import { removePushSubscription, savePushSubscription } from "@/app/actions";

type State = "loading" | "unsupported" | "ios-install" | "off" | "on" | "denied";

function urlBase64ToUint8Array(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

export default function NotificationsCard() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      // iOS only supports web push for apps added to the Home Screen.
      if (isIOS() && !isStandalone()) return setState("ios-install");
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window))
        return setState("unsupported");
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
      const res = await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: j.keys!.p256dh,
        auth: j.keys!.auth,
      });
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
    <section className="card mb-6 text-sm relative overflow-hidden">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
          {state === "on" ? <BellRing size={16} /> : <Bell size={16} />}
        </div>
        <div>
          <h2 className="font-semibold text-zinc-100">Cockpit Reminders</h2>
          <p className="text-xs text-zinc-400">Device alerts before maintenance is due</p>
        </div>
      </div>

      {state === "ios-install" && <IosGuide />}

      {state === "unsupported" && (
        <div className="flex items-start gap-2 rounded-xl bg-zinc-950/60 border border-zinc-800 p-3 text-zinc-400">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p>This browser doesn’t support push notifications.</p>
        </div>
      )}

      {state === "denied" && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-950/30 border border-rose-900/50 p-3 text-rose-300">
          <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <p>Notifications are blocked. Allow them in browser settings, then reload.</p>
        </div>
      )}

      {state === "off" && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Get pinged on this device when services or insurance renewals are due, even when Ente Vaahanam is closed.
          </p>
          <button
            className="btn w-full !py-2 text-xs font-semibold"
            onClick={enable}
            disabled={busy}
          >
            <Bell size={14} />
            {busy ? "Activating..." : "Enable Push Notifications"}
          </button>
        </div>
      )}

      {state === "on" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between rounded-xl bg-emerald-950/30 border border-emerald-900/50 px-3 py-2 text-emerald-300">
            <span className="flex items-center gap-2 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Notifications active on this device
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <button
            className="btn-ghost w-full !py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            onClick={disable}
            disabled={busy}
          >
            <BellOff size={14} />
            {busy ? "Updating..." : "Disable alerts on this device"}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </section>
  );
}

function IosGuide() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem("ios-guide-seen") === "1";
    } catch {
      return false;
    }
  });

  function dismiss() {
    try {
      localStorage.setItem("ios-guide-seen", "1");
    } catch {}
    setHidden(true);
  }

  if (hidden) {
    return (
      <p className="text-xs text-zinc-400">
        To receive push notifications on iOS, install Ente Vaahanam to your Home Screen.
      </p>
    );
  }

  return (
    <div className="space-y-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-zinc-300">
      <div className="flex items-center gap-2 font-medium text-xs text-teal-400">
        <Smartphone size={14} />
        <span>Install to iPhone Home Screen for alerts:</span>
      </div>
      <ol className="list-decimal space-y-1.5 pl-4 text-xs text-zinc-400">
        <li>
          Open this site in <strong className="text-zinc-200">Safari</strong>.
        </li>
        <li>
          Tap the <strong className="text-zinc-200">Share</strong> icon, then select{" "}
          <strong className="text-zinc-200">Add to Home Screen</strong>.
        </li>
        <li>Open from your Home Screen to enable instant alerts.</li>
      </ol>
      <button className="btn-ghost !py-1 !px-3 text-xs" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
