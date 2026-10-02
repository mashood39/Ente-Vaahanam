import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordTitle, reminderStatus, todayIST } from "@/lib/reminders";
import type { ServiceRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 86_400_000;

type Row = ServiceRecord & { user_id: string; vehicles: { name: string; odometer: number } };

// 02:30 UTC = 08:00 IST (see vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  const db = createAdminClient();
  const today = todayIST();
  const now = Date.now();

  const { data, error } = await db
    .from("service_records")
    .select("*, vehicles!inner(name, odometer)")
    .eq("reminder_state", "active")
    .or("remind_on.not.is.null,remind_at_odometer.not.is.null");
  if (error) return new Response(error.message, { status: 500 });

  // Decide what to notify: first "due soon", first "overdue", then weekly while still overdue.
  const byUser = new Map<string, { row: Row; stage: "due_soon" | "overdue" }[]>();
  for (const row of (data ?? []) as Row[]) {
    const status = reminderStatus(row, row.vehicles.odometer, today);
    if (status !== "due_soon" && status !== "overdue") continue;
    const last = row.last_notified_at ? Date.parse(row.last_notified_at) : 0;
    const notify =
      row.last_notified_stage == null ||
      (status === "overdue" && row.last_notified_stage === "due_soon") ||
      (status === "overdue" && now - last >= WEEK_MS);
    if (!notify) continue;
    const list = byUser.get(row.user_id) ?? [];
    list.push({ row, stage: status });
    byUser.set(row.user_id, list);
  }

  let sent = 0;
  for (const [userId, items] of byUser) {
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", userId);
    if (!subs?.length) continue; // leave unmarked so it fires once they enable notifications

    const first = items[0].row;
    const overdue = items.filter((i) => i.stage === "overdue").length;
    const payload = JSON.stringify({
      title: overdue ? "Vehicle service overdue" : "Vehicle service due soon",
      body: items.length === 1
        ? `${recordTitle(first)} · ${first.vehicles.name} is ${items[0].stage === "overdue" ? "overdue" : "due soon"}.`
        : `${items.length} reminders need attention (${overdue} overdue).`,
      url: items.length === 1 ? `/vehicles/${first.vehicle_id}` : "/",
    });

    let delivered = false;
    for (const s of subs) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        delivered = true;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db.from("push_subscriptions").delete().eq("id", s.id);
      }
    }
    if (!delivered) continue;
    sent++;
    for (const { row, stage } of items) {
      await db.from("service_records")
        .update({ last_notified_stage: stage, last_notified_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  }

  return Response.json({ checked: data?.length ?? 0, usersNotified: sent });
}
