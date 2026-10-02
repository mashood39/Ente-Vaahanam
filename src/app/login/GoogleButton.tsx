"use client";
import { createClient } from "@/lib/supabase/client";

export default function GoogleButton() {
  async function signIn() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }
  return (
    <button onClick={signIn} className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 shadow-sm active:bg-slate-100">
      Continue with Google
    </button>
  );
}
