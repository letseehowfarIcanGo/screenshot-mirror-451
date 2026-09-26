import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEPARTMENTS,
  SYMPTOMS,
  SYMPTOM_MEDICINE,
  useClinic,
  type Symptom,
} from "@/lib/clinic-data";

export const Route = createFileRoute("/quick-log")({
  head: () => ({
    meta: [
      { title: "Quick Log — PHINMA AU Clinic" },
      { name: "description", content: "Log a student clinic visit in seconds with symptoms and dispensed medicine." },
      { property: "og:title", content: "Quick Log — PHINMA AU Clinic" },
      { property: "og:description", content: "Log a student clinic visit in seconds with symptoms and dispensed medicine." },
    ],
  }),
  component: QuickLog,
});

function QuickLog() {
  const { students, logVisit } = useClinic();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medicines, setMedicines] = useState<string[]>([]);

  const match = useMemo(
    () =>
      query.trim().length > 0
        ? students.find(
            (s) =>
              s.name.toLowerCase().includes(query.trim().toLowerCase()) ||
              s.id.includes(query.trim()),
          )
        : undefined,
    [query, students],
  );

  const suggested = useMemo(
    () => Array.from(new Set(symptoms.flatMap((s) => SYMPTOM_MEDICINE[s]))),
    [symptoms],
  );

  function toggleSymptom(s: Symptom) {
    setSymptoms((prev) => {
      const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
      const auto = Array.from(new Set(next.flatMap((x) => SYMPTOM_MEDICINE[x])));
      setMedicines((meds) =>
        prev.includes(s) ? meds.filter((m) => auto.includes(m)) : Array.from(new Set([...meds, ...auto])),
      );
      return next;
    });
  }

  function submit() {
    if (!query.trim() || !department || symptoms.length === 0) {
      toast.error("Student, department and at least one symptom are required.");
      return;
    }
    logVisit({
      student: match?.name ?? query.trim(),
      department,
      symptoms,
      medicines,
    });
    toast.success(`Visit logged for ${match?.name ?? query.trim()}`, {
      description: medicines.length ? `Dispensed: ${medicines.join(", ")}` : "No medicine dispensed",
    });
    setQuery("");
    setDepartment("");
    setSymptoms([]);
    setMedicines([]);
  }

  return (
    <>
      <PageHeader title="Quick Log" description="Ten-second clinic visit entry." />

      <div className="grid gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5 rounded-md border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label htmlFor="student">Student ID / Name</Label>
            <HoverCard open={!!match}>
              <HoverCardTrigger asChild>
                <Input
                  id="student"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Andrea Lim or 2026-0451"
                  className="rounded-md"
                />
              </HoverCardTrigger>
              {match && (
                <HoverCardContent align="start" className="rounded-md text-xs">
                  <p className="text-sm font-medium">
                    {match.name} · {match.id}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Known Allergies: {match.allergies} | Last Visit: {match.lastVisit}
                  </p>
                  <p className="text-muted-foreground">Home room: {match.department}</p>
                </HoverCardContent>
              )}
            </HoverCard>
          </div>

          <div className="space-y-1.5">
            <Label>Department / Classroom</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="rounded-md">
                <SelectValue placeholder="Select classroom" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Symptoms</Label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const active = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {suggested.length > 0 && (
            <div className="space-y-2 rounded-md border border-border bg-secondary/60 p-3">
              <Label>Dispense Medicine</Label>
              {suggested.map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={medicines.includes(m)}
                    onCheckedChange={(v) =>
                      setMedicines((prev) => (v ? [...prev, m] : prev.filter((x) => x !== m)))
                    }
                  />
                  {m} (1 pc)
                </label>
              ))}
            </div>
          )}

          <Button className="w-full rounded-md" onClick={submit}>
            Log Visit
          </Button>
        </div>

        <aside className="h-fit rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
          <p className="mb-2 text-sm font-semibold text-foreground">Entry tips</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Type a student name to preview allergies and last visit.</li>
            <li>Symptom chips auto-check the standard medicine.</li>
            <li>Logging deducts stock and updates the surveillance heatmap instantly.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}
