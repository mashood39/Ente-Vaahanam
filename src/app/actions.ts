"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPES, type ServiceType } from "@/lib/types";

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const int = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v == null) return null;
  const n = Math.round(Number(v.replace(/,/g, "")));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v == null) return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const ymd = (f: FormData, k: string) => {
  const v = str(f, k);
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
};

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function addVehicle(formData: FormData) {
  const { supabase } = await requireUser();
  const name = str(formData, "name");
  if (!name) redirect("/vehicles/new?error=name");
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      name,
      make: str(formData, "make"),
      model: str(formData, "model"),
      year: int(formData, "year"),
      plate_number: str(formData, "plate_number")?.toUpperCase() ?? null,
      odometer: int(formData, "odometer") ?? 0,
      distance_unit: "km",
    })
    .select("id")
    .single();
  if (error) redirect("/vehicles/new?error=save");
  revalidatePath("/");
  redirect(`/vehicles/${data.id}`);
}

export async function deleteVehicle(vehicleId: string) {
  const { supabase } = await requireUser();
  await supabase.from("vehicles").delete().eq("id", vehicleId);
  revalidatePath("/");
  redirect("/");
}

export async function updateOdometer(vehicleId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const odometer = int(formData, "odometer");
  if (odometer != null) await supabase.from("vehicles").update({ odometer }).eq("id", vehicleId);
  revalidatePath(`/vehicles/${vehicleId}`);
}

function recordFields(formData: FormData) {
  const type = str(formData, "type") as ServiceType | null;
  if (!type || !SERVICE_TYPES.includes(type)) return null;
  const done_on = ymd(formData, "done_on");
  if (!done_on) return null;
  const custom_label = str(formData, "custom_label");
  if (type === "other" && !custom_label) return null;
  return {
    type,
    custom_label: type === "other" ? custom_label : null,
    done_on,
    odometer: int(formData, "odometer"),
    cost: num(formData, "cost"),
    notes: str(formData, "notes"),
    remind_on: ymd(formData, "remind_on"),
    remind_at_odometer: type === "insurance" ? null : int(formData, "remind_at_odometer"),
  };
}

export async function saveRecord(vehicleId: string, recordId: string | null, formData: FormData) {
  const { supabase } = await requireUser();
  const back = recordId ? `/vehicles/${vehicleId}/records/${recordId}/edit` : `/vehicles/${vehicleId}/log`;
  const fields = recordFields(formData);
  if (!fields) redirect(`${back}?error=invalid`);

  if (recordId) {
    // Editing a reminder re-arms it and resets notification history.
    const { error } = await supabase
      .from("service_records")
      .update({ ...fields, reminder_state: "active", reminder_closed_at: null, last_notified_stage: null, last_notified_at: null })
      .eq("id", recordId);
    if (error) redirect(`${back}?error=save`);
  } else {
    const { error } = await supabase.from("service_records").insert({ ...fields, vehicle_id: vehicleId });
    if (error) redirect(`${back}?error=save`);
  }

  // Logging a service with a higher odometer reading moves the vehicle's odometer forward.
  if (fields.odometer != null) {
    const { data: v } = await supabase.from("vehicles").select("odometer").eq("id", vehicleId).single();
    if (v && fields.odometer > v.odometer) {
      await supabase.from("vehicles").update({ odometer: fields.odometer }).eq("id", vehicleId);
    }
  }
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

export async function deleteRecord(vehicleId: string, recordId: string) {
  const { supabase } = await requireUser();
  await supabase.from("service_records").delete().eq("id", recordId);
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

/** Close a reminder. "done" offers the follow-up "log the next one" flow in the UI. */
export async function closeReminder(vehicleId: string, recordId: string, state: "done" | "dismissed") {
  const { supabase } = await requireUser();
  await supabase
    .from("service_records")
    .update({ reminder_state: state, reminder_closed_at: new Date().toISOString() })
    .eq("id", recordId);
  revalidatePath(`/vehicles/${vehicleId}`);
  if (state === "done") redirect(`/vehicles/${vehicleId}?closed=${recordId}`);
}

export async function savePushSubscription(sub: { endpoint: string; p256dh: string; auth: string }) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ ...sub, user_id: user.id }, { onConflict: "endpoint" });
  return { ok: !error };
}

export async function removePushSubscription(endpoint: string) {
  const { supabase } = await requireUser();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}
