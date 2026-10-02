export const SERVICE_TYPES = [
  "oil_change", "insurance", "tires", "brakes", "battery", "part_replacement", "repair", "other",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const TYPE_LABELS: Record<ServiceType, string> = {
  oil_change: "Oil change",
  insurance: "Insurance",
  tires: "Tires",
  brakes: "Brakes",
  battery: "Battery",
  part_replacement: "Part replacement",
  repair: "Repair",
  other: "Other",
};

export type Vehicle = {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  plate_number: string | null;
  odometer: number;
  distance_unit: "km" | "mi";
};

export type ServiceRecord = {
  id: string;
  vehicle_id: string;
  type: ServiceType;
  custom_label: string | null;
  done_on: string; // YYYY-MM-DD
  odometer: number | null;
  cost: number | null;
  notes: string | null;
  remind_on: string | null;
  remind_at_odometer: number | null;
  reminder_state: "active" | "done" | "dismissed";
  last_notified_stage: "due_soon" | "overdue" | null;
  last_notified_at: string | null;
};
