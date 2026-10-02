import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import NotificationsCard from "@/components/NotificationsCard";
import { closeReminder, deleteVehicle, updateOdometer } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { describeDue, inr, recordTitle, reminderStatus, todayIST, urgency } from "@/lib/reminders";
import type { ServiceRecord, Vehicle } from "@/lib/types";

export default async function VehicleDashboard({ params, searchParams }: PageProps<"/vehicles/[id]">) {
  const { id } = await params;
  const { closed } = await searchParams;
  const supabase = await createClient();
  const [{ data: vehicle }, { data: recs }] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", id).single<Vehicle>(),
    supabase.from("service_records").select("*").eq("vehicle_id", id).order("done_on", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  if (!vehicle) notFound();
  const records = (recs ?? []) as ServiceRecord[];
  const today = todayIST();
  const unit = vehicle.distance_unit;

  const upcoming = records
    .map((r) => ({ r, status: reminderStatus(r, vehicle.odometer, today) }))
    .filter((x): x is { r: ServiceRecord; status: NonNullable<typeof x.status> } => x.status !== null)
    .sort((a, b) => urgency(a.r, vehicle.odometer, today) - urgency(b.r, vehicle.odometer, today));

  const justClosed = typeof closed === "string" ? records.find((r) => r.id === closed) : undefined;

  return (
    <Shell back="/" title={vehicle.name}>
      <p className="-mt-3 mb-4 text-sm text-slate-500">
        {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ")}
        {vehicle.plate_number ? ` · ${vehicle.plate_number}` : ""}
      </p>

      {justClosed && (
        <div className="card mb-4 border-teal-200 bg-teal-50">
          <p className="text-sm">Marked done: <strong>{recordTitle(justClosed)}</strong>. Log the next one now?</p>
          <Link href={`/vehicles/${id}/log?from=${justClosed.id}`} className="btn mt-2 w-full">Log the next one</Link>
        </div>
      )}

      <form action={updateOdometer.bind(null, id)} className="card mb-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="label" htmlFor="odometer">Odometer ({unit})</label>
          <input id="odometer" name="odometer" type="number" inputMode="numeric" min={0} className="input" defaultValue={vehicle.odometer} />
        </div>
        <button className="btn">Update</button>
      </form>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold">Upcoming reminders</h2>
        {upcoming.length === 0 ? (
          <p className="card text-sm text-slate-500">No active reminders. Add one when you log a service.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map(({ r, status }) => (
              <li key={r.id} className="card">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{recordTitle(r)}</span>
                  <StatusBadge status={status} />
                </div>
                <p className="text-sm text-slate-600">
                  {r.type === "insurance" && r.remind_on ? `Valid until ${r.remind_on} · ` : ""}
                  {describeDue(r, vehicle.odometer, unit, today)}
                </p>
                <div className="mt-2 flex gap-2">
                  <form action={closeReminder.bind(null, id, r.id, "done")}><button className="btn-ghost !py-1.5 text-sm">Mark done</button></form>
                  <form action={closeReminder.bind(null, id, r.id, "dismissed")}><button className="btn-ghost !py-1.5 text-sm">Dismiss</button></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <NotificationsCard />

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Service history</h2>
          <Link href={`/vehicles/${id}/log`} className="btn !py-1.5 text-sm">+ Log service</Link>
        </div>
        {records.length === 0 ? (
          <p className="card text-sm text-slate-500">Nothing logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {records.map((r) => (
              <li key={r.id}>
                <Link href={`/vehicles/${id}/records/${r.id}/edit`} className="card block active:bg-slate-50">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{recordTitle(r)}</span>
                    <span className="text-sm text-slate-500">{r.done_on}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {[r.odometer != null ? `${r.odometer.toLocaleString("en-IN")} ${unit}` : null, r.cost != null ? inr(r.cost) : null]
                      .filter(Boolean).join(" · ")}
                  </p>
                  {r.notes && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{r.notes}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={deleteVehicle.bind(null, id)}>
        <button className="text-sm text-red-700 underline">Delete this vehicle and its history</button>
      </form>
    </Shell>
  );
}
