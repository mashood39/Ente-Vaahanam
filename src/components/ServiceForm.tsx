"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { SERVICE_TYPES, TYPE_LABELS, type ServiceType } from "@/lib/types";
import { addMonths } from "@/lib/reminders";
import ServiceTypeIcon from "@/components/ServiceTypeIcon";

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

const MONTH_PRESETS = [3, 6, 12, 24];
const KM_PRESETS = [3000, 5000, 10000, 15000];

export default function ServiceForm({
  action,
  initial,
  unit,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial: Initial;
  unit: string;
  submitLabel: string;
}) {
  const [f, setF] = useState(initial);
  const set = (patch: Partial<Initial>) => setF((p) => ({ ...p, ...patch }));

  // Derive target reminder date & odometer from base values + interval
  function applyInterval(next: Partial<Initial>) {
    const m = { ...f, ...next };
    const patch: Partial<Initial> = { ...next };
    const months = Number(m.intervalMonths);
    const km = Number(m.intervalKm);

    if (m.type === "oil_change" || m.type === "part_replacement" || m.type === "repair") {
      if (months > 0 && m.done_on) {
        patch.remind_on = addMonths(m.done_on, months);
      }
      if (km > 0 && m.odometer !== "") {
        patch.remind_at_odometer = String(Number(m.odometer) + km);
      }
    }
    set(patch);
  }

  const isInsurance = f.type === "insurance";

  return (
    <form action={action} className="card space-y-4">
      {/* Service Type Selection */}
      <div>
        <label className="label" htmlFor="type">
          Service Type
        </label>
        <div className="flex items-center gap-2.5">
          <ServiceTypeIcon type={f.type} size="md" />
          <select
            id="type"
            name="type"
            className="input !py-2.5 font-medium"
            value={f.type}
            onChange={(e) => set({ type: e.target.value as ServiceType })}
          >
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t} className="bg-zinc-900 text-zinc-100">
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {f.type === "other" && (
        <div>
          <label className="label" htmlFor="custom_label">
            Custom Service Name
          </label>
          <input
            id="custom_label"
            name="custom_label"
            className="input"
            required
            maxLength={80}
            placeholder="e.g. Wheel alignment & balancing"
            value={f.custom_label}
            onChange={(e) => set({ custom_label: e.target.value })}
          />
        </div>
      )}

      {/* Date & Odometer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="done_on">
            {isInsurance ? "Policy Start / Paid On" : "Date Done"}
          </label>
          <input
            id="done_on"
            name="done_on"
            type="date"
            className="input"
            required
            value={f.done_on}
            onChange={(e) => applyInterval({ done_on: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="odometer">
            Odometer ({unit})
          </label>
          <input
            id="odometer"
            name="odometer"
            type="number"
            inputMode="numeric"
            min={0}
            className="input font-mono"
            placeholder="e.g. 45000"
            value={f.odometer}
            onChange={(e) => applyInterval({ odometer: e.target.value })}
          />
        </div>
      </div>

      {/* Cost (INR) */}
      <div>
        <label className="label" htmlFor="cost">
          Cost (₹ INR)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
            ₹
          </span>
          <input
            id="cost"
            name="cost"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            className="input !pl-8 font-mono"
            placeholder="0.00"
            value={f.cost}
            onChange={(e) => set({ cost: e.target.value })}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label" htmlFor="notes">
          Notes / Workshop Details
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="input resize-none"
          placeholder="e.g. Shell Helix Ultra 5W-40, replaced oil filter & air filter"
          value={f.notes}
          onChange={(e) => set({ notes: e.target.value })}
        />
      </div>

      {/* Reminder Fieldset with Quick Preset Chips */}
      <fieldset className="space-y-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 sm:p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
          <Sparkles size={13} />
          Automated Reminder (Optional)
        </legend>

        {f.type === "oil_change" && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0" htmlFor="intervalMonths">
                  Interval Duration
                </label>
                <div className="flex gap-1.5">
                  {MONTH_PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyInterval({ intervalMonths: String(m) })}
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-mono transition-colors ${
                        f.intervalMonths === String(m)
                          ? "bg-teal-500 text-white font-semibold"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="intervalMonths"
                type="number"
                inputMode="numeric"
                min={0}
                className="input text-sm"
                placeholder="Months (e.g. 6)"
                value={f.intervalMonths}
                onChange={(e) => applyInterval({ intervalMonths: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0" htmlFor="intervalKm">
                  Interval Distance ({unit})
                </label>
                <div className="flex gap-1.5">
                  {KM_PRESETS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => applyInterval({ intervalKm: String(k) })}
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-mono transition-colors ${
                        f.intervalKm === String(k)
                          ? "bg-teal-500 text-white font-semibold"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      +{k / 1000}k
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="intervalKm"
                type="number"
                inputMode="numeric"
                min={0}
                className="input text-sm font-mono"
                placeholder={`Distance in ${unit} (e.g. 5000)`}
                value={f.intervalKm}
                onChange={(e) => applyInterval({ intervalKm: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Date target */}
        <div>
          <label className="label" htmlFor="remind_on">
            {isInsurance ? "Valid Until (Policy Expiry Date)" : "Remind on Date"}
          </label>
          <input
            id="remind_on"
            name="remind_on"
            type="date"
            className="input"
            value={f.remind_on}
            onChange={(e) => set({ remind_on: e.target.value })}
          />
        </div>

        {/* Odometer target */}
        {!isInsurance && (
          <div>
            <label className="label" htmlFor="remind_at_odometer">
              Or Remind at Odometer ({unit})
            </label>
            <input
              id="remind_at_odometer"
              name="remind_at_odometer"
              type="number"
              inputMode="numeric"
              min={0}
              className="input font-mono"
              placeholder="Target odometer reading"
              value={f.remind_at_odometer}
              onChange={(e) => set({ remind_at_odometer: e.target.value })}
            />
          </div>
        )}

        <p className="text-[11px] text-zinc-400 leading-normal">
          {isInsurance
            ? "You’ll automatically receive an alert 30 days before policy expiry."
            : "If both date and odometer are configured, whichever triggers first will notify you."}
        </p>
      </fieldset>

      <button className="btn w-full !py-3">
        <Check size={16} />
        <span>{submitLabel}</span>
      </button>
    </form>
  );
}
