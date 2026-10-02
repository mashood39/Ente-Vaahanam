import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import ServiceForm from "@/components/ServiceForm";
import { saveRecord } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { addMonths, todayIST } from "@/lib/reminders";
import { SERVICE_TYPES, type ServiceRecord, type ServiceType, type Vehicle } from "@/lib/types";

/** Work out "every N months / N km" from a previous entry's own reminder. */
function intervalOf(r: ServiceRecord) {
  let months = "", km = "";
  if (r.remind_on) {
    for (let m = 1; m <= 60; m++) if (addMonths(r.done_on, m) === r.remind_on) { months = String(m); break; }
  }
  if (r.remind_at_odometer != null && r.odometer != null) km = String(r.remind_at_odometer - r.odometer);
  return { months, km };
}

export default async function LogService({ params, searchParams }: PageProps<"/vehicles/[id]/log">) {
  const { id } = await params;
  const { from, type: typeParam, error } = await searchParams;
  const supabase = await createClient();
  const { data: vehicle } = await supabase.from("vehicles").select("*").eq("id", id).single<Vehicle>();
  if (!vehicle) notFound();

  let prev: ServiceRecord | null = null;
  if (typeof from === "string") {
    const { data } = await supabase.from("service_records").select("*").eq("id", from).eq("vehicle_id", id).single<ServiceRecord>();
    prev = data;
  }
  const type = (prev?.type ?? (SERVICE_TYPES.includes(typeParam as ServiceType) ? typeParam : "oil_change")) as ServiceType;
  const iv = prev && type === "oil_change" ? intervalOf(prev) : { months: "", km: "" };
  const today = todayIST();
  const odo = String(vehicle.odometer);

  // Prefilled follow-up for oil changes: same interval, counted from today's date / the vehicle's odometer.
  const remind_on = iv.months ? addMonths(today, Number(iv.months)) : "";
  const remind_at = iv.km ? String(vehicle.odometer + Number(iv.km)) : "";

  return (
    <Shell back={`/vehicles/${id}`} title={prev ? "Log the next one" : "Log service"}>
      {error && <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">Couldn’t save. Check the fields and try again.</p>}
      <ServiceForm
        action={saveRecord.bind(null, id, null)}
        unit={vehicle.distance_unit}
        submitLabel="Save entry"
        initial={{
          type, custom_label: prev?.custom_label ?? "", done_on: today, odometer: odo, cost: "", notes: "",
          remind_on, remind_at_odometer: remind_at, intervalMonths: iv.months, intervalKm: iv.km,
        }}
      />
    </Shell>
  );
}
