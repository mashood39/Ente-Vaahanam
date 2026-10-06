import { Plus, AlertTriangle } from "lucide-react";
import Shell from "@/components/Shell";
import { addVehicle } from "@/app/actions";

export default async function NewVehicle({ searchParams }: PageProps<"/vehicles/new">) {
  const { error } = await searchParams;

  return (
    <Shell back="/" title="Add Vehicle">
      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">
          <AlertTriangle size={15} className="text-rose-400 shrink-0" />
          <span>Couldn’t save vehicle. Check the name and try again.</span>
        </div>
      )}

      <form action={addVehicle} className="card space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Vehicle Nickname *
          </label>
          <input
            className="input"
            id="name"
            name="name"
            required
            maxLength={80}
            placeholder="e.g. White Swift / Himalayan"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="make">
              Make / Brand
            </label>
            <input className="input" id="make" name="make" placeholder="e.g. Maruti Suzuki" />
          </div>
          <div>
            <label className="label" htmlFor="model">
              Model
            </label>
            <input className="input" id="model" name="model" placeholder="e.g. Swift ZXI" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="year">
              Year
            </label>
            <input
              className="input font-mono"
              id="year"
              name="year"
              type="number"
              inputMode="numeric"
              min={1900}
              max={2100}
              placeholder="e.g. 2022"
            />
          </div>
          <div>
            <label className="label" htmlFor="plate_number">
              Registration / Plate
            </label>
            <input
              className="input uppercase font-mono"
              id="plate_number"
              name="plate_number"
              placeholder="KL 07 CD 1234"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="odometer">
            Current Odometer (km) *
          </label>
          <input
            className="input font-mono text-emerald-400 font-bold"
            id="odometer"
            name="odometer"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={0}
            required
          />
        </div>

        <button className="btn w-full !py-3">
          <Plus size={16} />
          <span>Save to Garage</span>
        </button>
      </form>
    </Shell>
  );
}
