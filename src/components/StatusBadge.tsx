import type { ReminderStatus } from "@/lib/reminders";

const STYLE: Record<ReminderStatus, [string, string]> = {
  overdue: ["Overdue", "bg-red-100 text-red-800"],
  due_soon: ["Due soon", "bg-amber-100 text-amber-800"],
  on_track: ["On track", "bg-green-100 text-green-800"],
};

export default function StatusBadge({ status }: { status: ReminderStatus }) {
  const [label, cls] = STYLE[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}
