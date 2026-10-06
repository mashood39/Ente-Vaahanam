import Link from "next/link";
import { ArrowLeft, LogOut, Gauge } from "lucide-react";

export default function Shell({
  children,
  back,
  title,
}: {
  children: React.ReactNode;
  back?: string;
  title?: string;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-20">
      <header className="sticky top-0 z-30 -mx-4 mb-6 flex items-center gap-3 border-b border-zinc-800/80 bg-[#090b10]/80 px-4 py-3.5 backdrop-blur-xl">
        {back ? (
          <Link
            href={back}
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-950/40">
            <Gauge size={20} strokeWidth={2.4} />
          </div>
        )}

        <h1 className="flex-1 truncate text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
          {title ?? (
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Ente Vaahanam
            </span>
          )}
        </h1>

        {!back && (
          <form action="/auth/signout" method="post">
            <button
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 cursor-pointer"
              data-signout
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </form>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}
