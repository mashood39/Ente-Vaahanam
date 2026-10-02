import Shell from "@/components/Shell";

export default function Offline() {
  return (
    <Shell title="You’re offline">
      <p className="card text-sm text-slate-600">
        This page isn’t saved on your device yet. Pages you’ve already visited still work offline. Reconnect to load new ones.
      </p>
    </Shell>
  );
}
