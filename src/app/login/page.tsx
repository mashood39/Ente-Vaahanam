import GoogleButton from "./GoogleButton";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Ente Vaahanam</h1>
        <p className="mt-1 text-sm text-slate-500">Never miss a service, insurance renewal or oil change.</p>
      </div>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">Sign-in failed. Please try again.</p>}
      <GoogleButton />
      <p className="text-center text-xs text-slate-500">
        By continuing you agree to the <a className="underline" href="/terms">Terms</a> and{" "}
        <a className="underline" href="/privacy">Privacy Policy</a>.
      </p>
    </main>
  );
}
