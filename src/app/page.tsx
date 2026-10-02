import Link from "next/link";
import Shell from "@/components/Shell";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").order("created_at");
  const vehicles = (data ?? []) as Vehicle[];

  return (
    <Shell>
      {vehicles.length === 0 ? (
        <div className="card text-center">
          <p className="mb-3 text-slate-600">No vehicles yet. Add your first one to start tracking.</p>
          <Link href="/vehicles/new" className="btn">Add a vehicle</Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {vehicles.map((v) => (
              <li key={v.id}>
                <Link href={`/vehicles/${v.id}`} className="card block active:bg-slate-50">
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-sm text-slate-500">
                    {[v.make, v.model, v.year].filter(Boolean).join(" ")}
                    {v.plate_number ? ` · ${v.plate_number}` : ""}
                  </div>
                  <div className="mt-1 text-sm">{v.odometer.toLocaleString("en-IN")} {v.distance_unit}</div>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/vehicles/new" className="btn mt-4 w-full">Add a vehicle</Link>
        </>
      )}
    </Shell>
  );
}
