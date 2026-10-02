import Link from "next/link";

export default function Shell({ children, back, title }: { children: React.ReactNode; back?: string; title?: string }) {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-16">
      <header className="flex items-center gap-3 py-4">
        {back ? (
          <Link href={back} className="-ml-2 rounded p-2 text-teal-700" aria-label="Back">←</Link>
        ) : null}
        <h1 className="flex-1 truncate text-xl font-bold">{title ?? "Ente Vaahanam"}</h1>
        {!back && (
          <form action="/auth/signout" method="post">
            <button className="text-sm text-slate-500 underline" data-signout>Sign out</button>
          </form>
        )}
      </header>
      {children}
    </div>
  );
}
