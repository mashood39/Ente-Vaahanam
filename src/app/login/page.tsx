import { Gauge, ShieldCheck, Bell, AlertTriangle } from "lucide-react";
import GoogleButton from "./GoogleButton";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12 relative z-10">
      <div className="card cockpit-glow space-y-6 border-zinc-800 p-6 sm:p-8">
        {/* Emblem & Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-teal-950/60 ring-1 ring-white/20">
            <Gauge size={30} strokeWidth={2.4} />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Ente Vaahanam
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Luxury maintenance tracker & dual-trigger service reminders.
            </p>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Bell size={13} className="text-teal-400 shrink-0" />
            <span>Smart push reminders (date & mileage)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>Insurance & service history tracking</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <span>Sign-in failed. Please try again.</span>
          </div>
        )}

        <GoogleButton />

        <p className="text-center text-[11px] text-zinc-500">
          By continuing you agree to the{" "}
          <a className="text-zinc-400 underline hover:text-zinc-200" href="/terms">
            Terms
          </a>{" "}
          and{" "}
          <a className="text-zinc-400 underline hover:text-zinc-200" href="/privacy">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
