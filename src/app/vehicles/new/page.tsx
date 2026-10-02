import Shell from "@/components/Shell";
import { addVehicle } from "@/app/actions";

export default async function NewVehicle({ searchParams }: PageProps<"/vehicles/new">) {
  const { error } = await searchParams;
  return (
    <Shell back="/" title="Add vehicle">
      {error && <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">Couldn’t save. Check the name and try again.</p>}
      <form action={addVehicle} className="card space-y-4">
        <div><label className="label" htmlFor="name">Name</label>
          <input className="input" id="name" name="name" required maxLength={80} placeholder="e.g. My Swift" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="make">Make</label><input className="input" id="make" name="make" /></div>
          <div><label className="label" htmlFor="model">Model</label><input className="input" id="model" name="model" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="year">Year</label>
            <input className="input" id="year" name="year" type="number" inputMode="numeric" min={1900} max={2100} /></div>
          <div><label className="label" htmlFor="plate_number">Plate number</label>
            <input className="input uppercase" id="plate_number" name="plate_number" /></div>
        </div>
        <div><label className="label" htmlFor="odometer">Current odometer (km)</label>
          <input className="input" id="odometer" name="odometer" type="number" inputMode="numeric" min={0} defaultValue={0} required /></div>
        <button className="btn w-full">Save vehicle</button>
      </form>
    </Shell>
  );
}
