import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import ServiceForm from "@/components/ServiceForm";
import { deleteRecord, saveRecord } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRecord, Vehicle } from "@/lib/types";

export default async function EditRecord({ params, searchParams }: PageProps<"/vehicles/[id]/records/[rid]/edit">) {
  const { id, rid } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data: vehicle }, { data: r }] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", id).single<Vehicle>(),
    supabase.from("service_records").select("*").eq("id", rid).eq("vehicle_id", id).single<ServiceRecord>(),
  ]);
  if (!vehicle || !r) notFound();

  return (
    <Shell back={`/vehicles/${id}`} title="Edit entry">
      {error && <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">Couldn’t save. Check the fields and try again.</p>}
      <ServiceForm
        action={saveRecord.bind(null, id, rid)}
        unit={vehicle.distance_unit}
        submitLabel="Save changes"
        initial={{
          type: r.type, custom_label: r.custom_label ?? "", done_on: r.done_on,
          odometer: r.odometer?.toString() ?? "", cost: r.cost?.toString() ?? "", notes: r.notes ?? "",
          remind_on: r.remind_on ?? "", remind_at_odometer: r.remind_at_odometer?.toString() ?? "",
          intervalMonths: "", intervalKm: "",
        }}
      />
      <form action={deleteRecord.bind(null, id, rid)} className="mt-4">
        <button className="w-full rounded-lg border border-red-300 px-4 py-2.5 font-medium text-red-700 active:bg-red-50">
          Delete entry
        </button>
      </form>
    </Shell>
  );
}
