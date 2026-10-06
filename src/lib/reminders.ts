import { TYPE_LABELS, type ServiceRecord, type ServiceType } from "./types";

export type ReminderStatus = "overdue" | "due_soon" | "on_track";

const DAY_MS = 86_400_000;
export const DUE_SOON_KM = 500;
export const dueSoonDays = (type: ServiceType) => (type === "insurance" ? 30 : 14);

/** Today as YYYY-MM-DD in India time (all users are assumed to be in IST for Phase 1). */
export function todayIST(now = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

export function daysBetween(fromYmd: string, toYmd: string): number {
  return Math.round((Date.parse(toYmd) - Date.parse(fromYmd)) / DAY_MS);
}

export function addMonths(ymd: string, months: number): string {
  const d = new Date(ymd + "T00:00:00Z");
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d.toISOString().slice(0, 10);
}

/** Status of an active reminder: date and odometer are checked independently, the worse one wins. */
export function reminderStatus(r: ServiceRecord, currentOdometer: number, today: string): ReminderStatus | null {
  if (r.reminder_state !== "active") return null;
  if (!r.remind_on && r.remind_at_odometer == null) return null;
  let status: ReminderStatus = "on_track";
  if (r.remind_on) {
    const days = daysBetween(today, r.remind_on);
    if (days < 0) return "overdue";
    if (days <= dueSoonDays(r.type)) status = "due_soon";
  }
  if (r.remind_at_odometer != null) {
    const left = r.remind_at_odometer - currentOdometer;
    if (left <= 0) return "overdue";
    if (left <= DUE_SOON_KM) status = "due_soon";
  }
  return status;
}

/** Lower = more urgent. Used for sorting. */
export function urgency(r: ServiceRecord, currentOdometer: number, today: string): number {
  const parts: number[] = [];
  if (r.remind_on) parts.push(daysBetween(today, r.remind_on));
  // Rough km → days conversion (~40 km/day) so date and odometer reminders sort together.
  if (r.remind_at_odometer != null) parts.push((r.remind_at_odometer - currentOdometer) / 40);
  return parts.length ? Math.min(...parts) : Infinity;
}

export function recordTitle(r: Pick<ServiceRecord, "type" | "custom_label">): string {
  return r.type === "other" && r.custom_label ? r.custom_label : TYPE_LABELS[r.type];
}

export function describeDue(r: ServiceRecord, currentOdometer: number, unit: string, today: string): string {
  const bits: string[] = [];
  if (r.remind_on) {
    const d = daysBetween(today, r.remind_on);
    bits.push(d < 0 ? `${-d} day${d === -1 ? "" : "s"} overdue` : d === 0 ? "due today" : `in ${d} day${d === 1 ? "" : "s"}`);
  }
  if (r.remind_at_odometer != null) {
    const left = r.remind_at_odometer - currentOdometer;
    const n = Math.abs(left).toLocaleString("en-IN");
    bits.push(left <= 0 ? `${n} ${unit} over` : `in ${n} ${unit}`);
  }
  return bits.join(" · ");
}

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

export type ReminderProgress = {
  percent: number; // 0 to 100+
  daysTotal?: number;
  daysElapsed?: number;
  daysRemaining?: number;
  kmTotal?: number;
  kmElapsed?: number;
  kmRemaining?: number;
};

export function reminderProgress(r: ServiceRecord, currentOdometer: number, today: string): ReminderProgress | null {
  if (r.reminder_state !== "active") return null;
  if (!r.remind_on && r.remind_at_odometer == null) return null;

  let daysPercent: number | null = null;
  let kmPercent: number | null = null;
  let daysTotal: number | undefined;
  let daysElapsed: number | undefined;
  let daysRemaining: number | undefined;
  let kmTotal: number | undefined;
  let kmElapsed: number | undefined;
  let kmRemaining: number | undefined;

  if (r.remind_on) {
    const totalDays = daysBetween(r.done_on, r.remind_on);
    const remaining = daysBetween(today, r.remind_on);
    daysTotal = Math.max(1, totalDays);
    daysElapsed = totalDays - remaining;
    daysRemaining = remaining;
    if (totalDays > 0) {
      daysPercent = Math.round((daysElapsed / totalDays) * 100);
    } else {
      daysPercent = remaining <= 0 ? 100 : 0;
    }
  }

  if (r.remind_at_odometer != null) {
    const baseOdo = r.odometer ?? currentOdometer;
    const totalKm = r.remind_at_odometer - baseOdo;
    const remaining = r.remind_at_odometer - currentOdometer;
    kmTotal = Math.max(1, totalKm);
    kmElapsed = currentOdometer - baseOdo;
    kmRemaining = remaining;
    if (totalKm > 0) {
      kmPercent = Math.round((kmElapsed / totalKm) * 100);
    } else {
      kmPercent = remaining <= 0 ? 100 : 0;
    }
  }

  const pValues = [daysPercent, kmPercent].filter((x): x is number => x !== null);
  if (!pValues.length) return null;

  const maxPercent = Math.max(...pValues);
  const cappedPercent = Math.max(0, Math.min(100, maxPercent));

  return {
    percent: cappedPercent,
    daysTotal,
    daysElapsed,
    daysRemaining,
    kmTotal,
    kmElapsed,
    kmRemaining,
  };
}
