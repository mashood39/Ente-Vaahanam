import { WifiOff } from "lucide-react";
import Shell from "@/components/Shell";

export default function Offline() {
  return (
    <Shell title="You’re Offline">
      <div className="card text-center py-10 space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950/80 border border-zinc-800 text-amber-400">
          <WifiOff size={24} />
        </div>
        <h2 className="text-base font-bold text-zinc-100">No Internet Connection</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          This page hasn’t been cached on your device yet. Pages and service records you’ve previously visited remain available offline.
        </p>
      </div>
    </Shell>
  );
}
