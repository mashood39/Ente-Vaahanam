"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});

    // Wipe cached pages on sign-out (they contain the previous user's data).
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (form.getAttribute("action") === "/auth/signout") {
        navigator.serviceWorker.controller?.postMessage("clear-caches");
      }
    };
    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
  }, []);
  return null;
}
