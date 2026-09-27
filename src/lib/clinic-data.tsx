import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Symptom = "Fever" | "Headache" | "Dysmenorrhea" | "Wounds" | "Stomachache";

export const SYMPTOMS: Symptom[] = [
  "Fever",
  "Headache",
  "Dysmenorrhea",
  "Wounds",
  "Stomachache",
];

export const SYMPTOM_MEDICINE: Record<Symptom, string[]> = {
  Fever: ["Paracetamol"],
  Headache: ["Paracetamol"],
  Dysmenorrhea: ["Mefenamic Acid"],
  Wounds: ["Povidone Iodine", "Sterile Gauze"],
  Stomachache: ["Antacid"],
};

export const DEPARTMENTS = [
  "BSIT2-SOUTH1",
  "BSIT1-NORTH2",
  "STEM11-A",
  "STEM12-B",
  "ABM11-C",
  "BSED3-EAST1",
];

export type Batch = { batchId: string; qty: number; expiry: string };

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  batches: Batch[];
  lowThreshold: number;
};

export type VisitLog = {
  id: string;
  student: string;
  department: string;
  symptoms: string[];
  medicines: string[];
  date: string; // ISO "YYYY-MM-DD"
  time: string;
};

export type Student = {
  id: string;
  name: string;
  department: string;
  allergies: string;
  chronic: string;
  lastVisit: string;
};

const STUDENTS: Student[] = [
  { id: "2026-0451", name: "Andrea Lim", department: "BSIT2-SOUTH1", allergies: "None", chronic: "Asthma", lastVisit: "2 days ago (Headache)" },
  { id: "2026-0122", name: "Miguel Santos", department: "STEM11-A", allergies: "Penicillin", chronic: "None", lastVisit: "5 days ago (Fever)" },
  { id: "2026-0899", name: "Joy Ramirez", department: "ABM11-C", allergies: "None", chronic: "None", lastVisit: "3 weeks ago (Wounds)" },
  { id: "2026-0333", name: "Karl Dizon", department: "BSED3-EAST1", allergies: "Aspirin", chronic: "None", lastVisit: "1 week ago (Headache)" },
  { id: "2026-0552", name: "Liza Cruz", department: "STEM11-A", allergies: "None", chronic: "None", lastVisit: "1 month ago (Dysmenorrhea)" },
  { id: "2026-0610", name: "Paolo Reyes", department: "ABM11-C", allergies: "None", chronic: "None", lastVisit: "4 days ago (Wounds)" },
  { id: "2026-0711", name: "John Dela Cruz", department: "BSIT2-SOUTH1", allergies: "None", chronic: "None", lastVisit: "None recorded" },
  { id: "2026-0712", name: "Maria Salazar", department: "BSIT2-SOUTH1", allergies: "None", chronic: "None", lastVisit: "None recorded" },
  { id: "2026-0713", name: "Mark Torres", department: "BSIT2-SOUTH1", allergies: "None", chronic: "Asthma", lastVisit: "None recorded" },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "paracetamol",
    name: "Paracetamol",
    category: "Analgesic",
    lowThreshold: 60,
    batches: [
      { batchId: "A", qty: 50, expiry: "2026-11-01" },
      { batchId: "B", qty: 200, expiry: "2027-01-01" },
    ],
  },
  {
    id: "mefenamic",
    name: "Mefenamic Acid",
    category: "Analgesic",
    lowThreshold: 40,
    batches: [{ batchId: "A", qty: 28, expiry: "2026-12-01" }],
  },
  {
    id: "antacid",
    name: "Antacid",
    category: "Gastro",
    lowThreshold: 30,
    batches: [{ batchId: "A", qty: 72, expiry: "2027-03-01" }],
  },
  {
    id: "iodine",
    name: "Povidone Iodine",
    category: "Antiseptic",
    lowThreshold: 10,
    batches: [{ batchId: "A", qty: 8, expiry: "2026-10-31" }],
  },
  {
    id: "gauze",
    name: "Sterile Gauze",
    category: "Supplies",
    lowThreshold: 25,
    batches: [{ batchId: "A", qty: 140, expiry: "2028-06-01" }],
  },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const INITIAL_LOGS: VisitLog[] = [
  { id: "v1", student: "Andrea Lim", department: "BSIT2-SOUTH1", symptoms: ["Fever"], medicines: ["Paracetamol"], date: daysAgo(0), time: "08:14 AM" },
  { id: "v2", student: "Miguel Santos", department: "BSIT2-SOUTH1", symptoms: ["Fever"], medicines: ["Paracetamol"], date: daysAgo(0), time: "09:02 AM" },
  { id: "v3", student: "Joy Ramirez", department: "BSIT2-SOUTH1", symptoms: ["Fever"], medicines: ["Paracetamol"], date: daysAgo(0), time: "10:30 AM" },
  { id: "v4", student: "Karl Dizon", department: "BSIT2-SOUTH1", symptoms: ["Headache"], medicines: ["Paracetamol"], date: daysAgo(0), time: "10:42 AM" },
  { id: "v5", student: "Liza Cruz", department: "STEM11-A", symptoms: ["Dysmenorrhea"], medicines: ["Mefenamic Acid"], date: daysAgo(0), time: "09:20 AM" },
  { id: "v6", student: "Paolo Reyes", department: "ABM11-C", symptoms: ["Wounds"], medicines: ["Povidone Iodine", "Sterile Gauze"], date: daysAgo(0), time: "11:05 AM" },
  { id: "v7", student: "Maria Salazar", department: "BSIT2-SOUTH1", symptoms: ["Headache"], medicines: ["Paracetamol"], date: daysAgo(2), time: "01:15 PM" },
  { id: "v8", student: "John Dela Cruz", department: "BSIT2-SOUTH1", symptoms: ["Stomachache"], medicines: ["Antacid"], date: daysAgo(4), time: "10:05 AM" },
  { id: "v9", student: "Andrea Lim", department: "BSIT2-SOUTH1", symptoms: ["Headache"], medicines: ["Paracetamol"], date: daysAgo(6), time: "08:50 AM" },
  { id: "v10", student: "Mark Torres", department: "BSIT2-SOUTH1", symptoms: ["Wounds"], medicines: ["Povidone Iodine"], date: daysAgo(12), time: "02:30 PM" },
  { id: "v11", student: "Liza Cruz", department: "STEM11-A", symptoms: ["Dysmenorrhea"], medicines: ["Mefenamic Acid"], date: daysAgo(25), time: "09:40 AM" },
];

export function totalStock(item: InventoryItem) {
  return item.batches.reduce((sum, b) => sum + b.qty, 0);
}

export function isExpiring(batch: Batch) {
  const days = (Date.parse(`${batch.expiry}T00:00:00`) - Date.now()) / 86_400_000;
  return batch.qty > 0 && days <= 60;
}

export function stockStatus(item: InventoryItem): "Good" | "Low" | "Expiring" {
  if (totalStock(item) <= item.lowThreshold) return "Low";
  if (item.batches.some(isExpiring)) return "Expiring";
  return "Good";
}

export function deductBatches(batches: Batch[], quantity: number): Batch[] {
  let remaining = quantity;
  const result = batches.map((batch) => ({ ...batch }));
  // Consume earliest expiry first, even when batches arrived out of date order.
  for (const batch of [...result].sort((a, b) => a.expiry.localeCompare(b.expiry))) {
    const taken = Math.min(batch.qty, remaining);
    batch.qty -= taken;
    remaining -= taken;
    if (remaining === 0) break;
  }
  return result;
}

type ClinicContextValue = {
  inventory: InventoryItem[];
  logs: VisitLog[];
  students: Student[];
  logVisits: (inputs: Omit<VisitLog, "id" | "date" | "time">[]) => boolean;
  receiveStock: (itemId: string, qty: number, expiry: string) => void;
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  const value = useMemo<ClinicContextValue>(
    () => ({
      inventory,
      logs,
      students: STUDENTS,
      logVisits: (inputs) => {
        if (!inputs.length) return false;
        const demand = new Map<string, number>();
        inputs.forEach((input) => input.medicines.forEach((medicine) => demand.set(medicine, (demand.get(medicine) ?? 0) + 1)));
        if ([...demand].some(([name, needed]) => {
          const item = inventory.find((stock) => stock.name === name);
          return !item || totalStock(item) < needed;
        })) return false;
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const date = now.toISOString().slice(0, 10);
        setLogs((prev) => [...inputs.map((input) => ({ ...input, id: crypto.randomUUID(), date, time })), ...prev]);
        setInventory((prev) =>
          prev.map((item) => {
            const quantity = demand.get(item.name) ?? 0;
            return quantity ? { ...item, batches: deductBatches(item.batches, quantity) } : item;
          }),
        );
        return true;
      },
      receiveStock: (itemId, qty, expiry) => {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  batches: [
                    ...item.batches,
                    { batchId: String.fromCharCode(65 + item.batches.length), qty, expiry },
                  ],
                }
              : item,
          ),
        );
      },
    }),
    [inventory, logs],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}
