import type { ReminderStatus } from "@/lib/reminders";

const CONFIG: Record<ReminderStatus, { label: string; container: string; dot: string }> = {
  overdue: {
    label: "Overdue",
    container: "bg-rose-500/15 text-rose-300 border-rose-500/40 ring-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.25)]",
    dot: "bg-rose-400 animate-pulse",
  },
  due_soon: {
    label: "Due Soon",
    container: "bg-amber-500/15 text-amber-300 border-amber-500/40 ring-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    dot: "bg-amber-400",
  },
  on_track: {
    label: "On Track",
    container: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    dot: "bg-emerald-400",
  },
};

export default function StatusBadge({ status }: { status: ReminderStatus }) {
  const { label, container, dot } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ring-1 ${container}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
