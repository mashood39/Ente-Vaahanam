"use client";

import { useState } from "react";
import { SERVICE_TYPES, TYPE_LABELS, type ServiceType } from "@/lib/types";
import { addMonths } from "@/lib/reminders";

type Initial = {
  type: ServiceType;
  custom_label: string;
  done_on: string;
  odometer: string;
  cost: string;
  notes: string;
  remind_on: string;
  remind_at_odometer: string;
  intervalMonths: string;
  intervalKm: string;
};

export default function ServiceForm({
  action, initial, unit, submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial: Initial;
  unit: string;
  submitLabel: string;
}) {
  const [f, setF] = useState(initial);
  const set = (patch: Partial<Initial>) => setF((p) => ({ ...p, ...patch }));

  // Oil-change shortcut: derive the due date / odometer from this entry's own date / odometer.
  function applyInterval(next: Partial<Initial>) {
    const m = { ...f, ...next };
    const patch: Partial<Initial> = { ...next };
    const months = Number(m.intervalMonths);
    const km = Number(m.intervalKm);
    if (m.type === "oil_change") {
      if (months > 0 && m.done_on) patch.remind_on = addMonths(m.done_on, months);
      if (km > 0 && m.odometer !== "") patch.remind_at_odometer = String(Number(m.odometer) + km);
    }
    set(patch);
  }

  const isInsurance = f.type === "insurance";

  return (
    <form action={action} className="card space-y-4">
      <div>
        <label className="label" htmlFor="type">Type</label>
        <select id="type" name="type" className="input" value={f.type}
          onChange={(e) => set({ type: e.target.value as ServiceType })}>
          {SERVICE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {f.type === "other" && (
        <div>
          <label className="label" htmlFor="custom_label">What was it?</label>
          <input id="custom_label" name="custom_label" className="input" required maxLength={80}
            value={f.custom_label} onChange={(e) => set({ custom_label: e.target.value })} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="done_on">{isInsurance ? "Policy start / paid on" : "Date done"}</label>
          <input id="done_on" name="done_on" type="date" className="input" required value={f.done_on}
            onChange={(e) => applyInterval({ done_on: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="odometer">Odometer ({unit})</label>
          <input id="odometer" name="odometer" type="number" inputMode="numeric" min={0} className="input"
            value={f.odometer} onChange={(e) => applyInterval({ odometer: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="cost">Cost (₹)</label>
        <input id="cost" name="cost" type="number" inputMode="decimal" min={0} step="0.01" className="input"
          value={f.cost} onChange={(e) => set({ cost: e.target.value })} />
      </div>

      <div>
        <label className="label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={3} className="input" value={f.notes}
          onChange={(e) => set({ notes: e.target.value })} />
      </div>

      <fieldset className="space-y-3 rounded-lg bg-slate-50 p-3">
        <legend className="px-1 text-sm font-semibold">Reminder (optional)</legend>

        {f.type === "oil_change" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="intervalMonths">Every (months)</label>
              <input id="intervalMonths" type="number" inputMode="numeric" min={0} className="input" placeholder="6"
                value={f.intervalMonths} onChange={(e) => applyInterval({ intervalMonths: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="intervalKm">Every ({unit})</label>
              <input id="intervalKm" type="number" inputMode="numeric" min={0} className="input" placeholder="5000"
                value={f.intervalKm} onChange={(e) => applyInterval({ intervalKm: e.target.value })} />
            </div>
          </div>
        )}

        <div>
          <label className="label" htmlFor="remind_on">{isInsurance ? "Valid until (policy expiry)" : "Remind on date"}</label>
          <input id="remind_on" name="remind_on" type="date" className="input" value={f.remind_on}
            onChange={(e) => set({ remind_on: e.target.value })} />
        </div>

        {!isInsurance && (
          <div>
            <label className="label" htmlFor="remind_at_odometer">Or at odometer ({unit})</label>
            <input id="remind_at_odometer" name="remind_at_odometer" type="number" inputMode="numeric" min={0}
              className="input" value={f.remind_at_odometer}
              onChange={(e) => set({ remind_at_odometer: e.target.value })} />
          </div>
        )}
        <p className="text-xs text-slate-500">
          {isInsurance ? "You’ll be reminded 30 days before expiry." : "If you set both, whichever comes first counts."}
        </p>
      </fieldset>

      <button className="btn w-full">{submitLabel}</button>
    </form>
  );
}
