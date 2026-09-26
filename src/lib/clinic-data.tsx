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

export type Batch = { code: string; qty: number; expires: string };

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
  symptoms: Symptom[];
  medicines: string[];
  time: string;
};

export type Student = {
  id: string;
  name: string;
  department: string;
  allergies: string;
  lastVisit: string;
};

const STUDENTS: Student[] = [
  { id: "2026-0451", name: "Andrea Lim", department: "BSIT2-SOUTH1", allergies: "None", lastVisit: "Oct 12, 2026" },
  { id: "2026-0122", name: "Miguel Santos", department: "STEM11-A", allergies: "Penicillin", lastVisit: "Sep 30, 2026" },
  { id: "2026-0899", name: "Joy Ramirez", department: "ABM11-C", allergies: "None", lastVisit: "Aug 04, 2026" },
  { id: "2026-0333", name: "Karl Dizon", department: "BSED3-EAST1", allergies: "Aspirin", lastVisit: "Oct 01, 2026" },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "paracetamol",
    name: "Paracetamol",
    category: "Analgesic",
    lowThreshold: 60,
    batches: [
      { code: "Batch A", qty: 50, expires: "Nov 2026" },
      { code: "Batch B", qty: 200, expires: "Jan 2027" },
    ],
  },
  {
    id: "mefenamic",
    name: "Mefenamic Acid",
    category: "Analgesic",
    lowThreshold: 40,
    batches: [{ code: "Batch A", qty: 28, expires: "Dec 2026" }],
  },
  {
    id: "antacid",
    name: "Antacid",
    category: "Gastro",
    lowThreshold: 30,
    batches: [{ code: "Batch A", qty: 72, expires: "Mar 2027" }],
  },
  {
    id: "iodine",
    name: "Povidone Iodine",
    category: "Antiseptic",
    lowThreshold: 10,
    batches: [{ code: "Batch A", qty: 12, expires: "Oct 2026" }],
  },
  {
    id: "gauze",
    name: "Sterile Gauze",
    category: "Supplies",
    lowThreshold: 25,
    batches: [{ code: "Batch A", qty: 140, expires: "Jun 2028" }],
  },
];

const INITIAL_LOGS: VisitLog[] = [
  { id: "v1", student: "Andrea Lim", department: "BSIT2-SOUTH1", symptoms: ["Fever"], medicines: ["Paracetamol"], time: "08:14 AM" },
  { id: "v2", student: "Miguel Santos", department: "BSIT2-SOUTH1", symptoms: ["Fever"], medicines: ["Paracetamol"], time: "09:02 AM" },
  { id: "v3", student: "Joy Ramirez", department: "BSIT2-SOUTH1", symptoms: ["Fever"], medicines: ["Paracetamol"], time: "10:30 AM" },
  { id: "v4", student: "Karl Dizon", department: "BSIT2-SOUTH1", symptoms: ["Headache"], medicines: ["Paracetamol"], time: "10:42 AM" },
  { id: "v5", student: "Liza Cruz", department: "STEM11-A", symptoms: ["Dysmenorrhea"], medicines: ["Mefenamic Acid"], time: "09:20 AM" },
  { id: "v6", student: "Paolo Reyes", department: "ABM11-C", symptoms: ["Wounds"], medicines: ["Povidone Iodine", "Sterile Gauze"], time: "11:05 AM" },
];

export function totalStock(item: InventoryItem) {
  return item.batches.reduce((sum, b) => sum + b.qty, 0);
}

export function stockStatus(item: InventoryItem): "Good" | "Low" | "Expiring" {
  if (totalStock(item) <= item.lowThreshold) return "Low";
  if (item.batches.some((b) => b.expires.includes("2026"))) return "Expiring";
  return "Good";
}

type ClinicContextValue = {
  inventory: InventoryItem[];
  logs: VisitLog[];
  students: Student[];
  logVisit: (input: Omit<VisitLog, "id" | "time">) => void;
  receiveStock: (itemId: string, qty: number, expires: string) => void;
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
      logVisit: (input) => {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLogs((prev) => [{ ...input, id: crypto.randomUUID(), time }, ...prev]);
        setInventory((prev) =>
          prev.map((item) => {
            if (!input.medicines.includes(item.name)) return item;
            let remaining = 1;
            const batches = item.batches.map((b) => {
              if (remaining <= 0) return b;
              const take = Math.min(b.qty, remaining);
              remaining -= take;
              return { ...b, qty: b.qty - take };
            });
            return { ...item, batches };
          }),
        );
      },
      receiveStock: (itemId, qty, expires) => {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  batches: [
                    ...item.batches,
                    { code: `Batch ${String.fromCharCode(65 + item.batches.length)}`, qty, expires },
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
