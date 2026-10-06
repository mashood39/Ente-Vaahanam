import { reminderProgress, type ReminderStatus } from "@/lib/reminders";
import type { ServiceRecord } from "@/lib/types";

export default function ServiceIntervalProgress({
  record,
  currentOdometer,
  unit,
  today,
  status,
}: {
  record: ServiceRecord;
  currentOdometer: number;
  unit: string;
  today: string;
  status: ReminderStatus;
}) {
  const prog = reminderProgress(record, currentOdometer, today);
  if (!prog) return null;

  const { percent, daysElapsed, daysTotal, daysRemaining, kmElapsed, kmTotal, kmRemaining } = prog;

  // Determine bar colors and glowing effects based on status
  const barColor =
    status === "overdue"
      ? "bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]"
      : status === "due_soon"
      ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
      : "bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.4)]";

  const percentTextColor =
    status === "overdue"
      ? "text-rose-400"
      : status === "due_soon"
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <div className="mt-3 space-y-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-2.5">
      {/* Header with percentage & remaining summary */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-400 flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              status === "overdue"
                ? "bg-rose-500 animate-pulse"
                : status === "due_soon"
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
          />
          {status === "overdue" ? "Exceeded" : "Interval consumption"}
        </span>
        <span className={`font-mono font-semibold ${percentTextColor}`}>
          {percent}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>

      {/* Detailed metrics breakdown */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-0.5 text-[11px] text-zinc-400">
        {kmTotal != null && kmElapsed != null && (
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Odo:</span>
            <span className="font-mono text-zinc-300">
              {Math.max(0, kmElapsed).toLocaleString("en-IN")}/{kmTotal.toLocaleString("en-IN")} {unit}
            </span>
            {kmRemaining != null && (
              <span className={kmRemaining <= 0 ? "text-rose-400 font-semibold" : "text-zinc-500"}>
                ({kmRemaining <= 0 ? `${Math.abs(kmRemaining).toLocaleString("en-IN")} ${unit} past` : `${kmRemaining.toLocaleString("en-IN")} left`})
              </span>
            )}
          </div>
        )}

        {daysTotal != null && daysElapsed != null && (
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Time:</span>
            <span className="font-mono text-zinc-300">
              {Math.max(0, daysElapsed)}/{daysTotal} d
            </span>
            {daysRemaining != null && (
              <span className={daysRemaining <= 0 ? "text-rose-400 font-semibold" : "text-zinc-500"}>
                ({daysRemaining <= 0 ? `${Math.abs(daysRemaining)} d past` : `${daysRemaining} d left`})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

