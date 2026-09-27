import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS, SYMPTOMS, SYMPTOM_MEDICINE, totalStock, useClinic, type Student, type Symptom } from "@/lib/clinic-data";

export const Route = createFileRoute("/quick-log")({
  head: () => ({ meta: [
    { title: "Quick Log — PHINMA AU Clinic" },
    { name: "description", content: "Log student clinic visits with medicine safety and stock checks." },
    { property: "og:title", content: "Quick Log — PHINMA AU Clinic" },
    { property: "og:description", content: "Log student clinic visits with medicine safety and stock checks." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: QuickLog,
});

function StudentSnapshot({ student }: { student: Student }) {
  return <HoverCard openDelay={120}>
    <HoverCardTrigger asChild><span tabIndex={0} className="cursor-help border-b border-dotted border-muted-foreground font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">{student.name}</span></HoverCardTrigger>
    <HoverCardContent align="start" className="w-64 rounded-md border-border bg-popover p-3 text-xs shadow-none">
      <p className="font-semibold text-foreground">{student.name} · {student.id}</p>
      <p className="mt-2">Allergies: <span className={student.allergies === "None" ? "text-muted-foreground" : "font-semibold text-destructive"}>{student.allergies}</span></p>
      <p>Chronic: {student.chronic}</p>
      <p>Last Visit: {student.lastVisit}</p>
    </HoverCardContent>
  </HoverCard>;
}

function QuickLog() {
  const { students, inventory, logVisits } = useClinic();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student[]>([]);
  const [group, setGroup] = useState(false);
  const [department, setDepartment] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [otherActive, setOtherActive] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [medicines, setMedicines] = useState<string[]>([]);

  const matches = useMemo(() => query.trim() ? students.filter((s) => !selected.some((v) => v.id === s.id) && (s.name.toLowerCase().includes(query.trim().toLowerCase()) || s.id.includes(query.trim()))).slice(0, 6) : [], [query, students, selected]);
  const suggested = useMemo(() => Array.from(new Set(symptoms.flatMap((s) => SYMPTOM_MEDICINE[s]))), [symptoms]);
  const caution = symptoms.includes("Stomachache") && medicines.includes("Mefenamic Acid");
  const lowStock = medicines.map((name) => inventory.find((item) => item.name === name)).filter((item) => item && totalStock(item) < 10);
  const insufficient = medicines.filter((name) => {
    const item = inventory.find((stock) => stock.name === name);
    return !item || totalStock(item) < selected.length;
  });

  function toggleSymptom(symptom: Symptom) {
    const next = symptoms.includes(symptom) ? symptoms.filter((s) => s !== symptom) : [...symptoms, symptom];
    setSymptoms(next);
    const recommendations = Array.from(new Set(next.flatMap((s) => SYMPTOM_MEDICINE[s])));
    setMedicines((prev) => Array.from(new Set([...prev.filter((m) => !SYMPTOM_MEDICINE[symptom].includes(m) || recommendations.includes(m)), ...(!symptoms.includes(symptom) ? SYMPTOM_MEDICINE[symptom] : [])])));
  }

  function submit() {
    const custom = otherActive ? otherText.trim() : "";
    const finalSymptoms = custom ? [...symptoms, custom] : symptoms;
    if (!selected.length || !department || !finalSymptoms.length) {
      toast.error("Select students, a classroom and at least one symptom.");
      return;
    }
    if (insufficient.length) {
      toast.error(`Not enough stock: ${insufficient.join(", ")}.`);
      return;
    }
    const success = logVisits(selected.map((student) => ({ student: student.name, department, symptoms: finalSymptoms, medicines })));
    if (!success) { toast.error("Stock changed. Check available medicine and try again."); return; }
    toast.success(`${selected.length} ${selected.length === 1 ? "visit" : "visits"} logged`, {
      description: medicines.length ? `Dispensed ${selected.length} pc per medicine: ${medicines.join(", ")}` : "No medicine dispensed",
    });
    setQuery(""); setSelected([]); setDepartment(""); setSymptoms([]); setMedicines([]); setOtherActive(false); setOtherText("");
  }

  return <>
    <PageHeader title="Quick Log" description="Ten-second clinic visit entry." />
    <div className="grid gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5 rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Label htmlFor="group-log">Group Log</Label>
          <Switch id="group-log" checked={group} onCheckedChange={(checked) => { setGroup(checked); setSelected((prev) => checked ? prev : prev.slice(0, 1)); }} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="student">Student ID / Name</Label>
          <Input id="student" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student name or ID" className="rounded-md" />
          {matches.length > 0 && <div className="rounded-md border border-border bg-popover p-1">
            {matches.map((student) => <div key={student.id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm hover:bg-secondary">
              <StudentSnapshot student={student} />
              <Button type="button" variant="ghost" size="sm" onClick={() => { setSelected((prev) => group ? [...prev, student] : [student]); setQuery(""); if (!department) setDepartment(student.department); }}>Select <span className="sr-only">{student.name}</span></Button>
            </div>)}
          </div>}
          {selected.length > 0 && <div className="flex flex-wrap gap-2 pt-1">{selected.map((student) => <div key={student.id} className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs"><StudentSnapshot student={student} /><Button variant="ghost" size="icon" className="h-5 w-5" aria-label={`Remove ${student.name}`} onClick={() => setSelected((prev) => prev.filter((s) => s.id !== student.id))}><X className="h-3 w-3" /></Button></div>)}</div>}
        </div>
        <div className="space-y-1.5"><Label>Department / Classroom</Label><Select value={department} onValueChange={setDepartment}><SelectTrigger className="rounded-md"><SelectValue placeholder="Select classroom" /></SelectTrigger><SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Symptoms</Label><div className="flex flex-wrap gap-2">{SYMPTOMS.map((symptom) => <Button key={symptom} type="button" size="sm" variant={symptoms.includes(symptom) ? "default" : "outline"} aria-pressed={symptoms.includes(symptom)} onClick={() => toggleSymptom(symptom)} className="rounded-md">{symptom}</Button>)}<Button type="button" size="sm" variant={otherActive ? "default" : "outline"} aria-pressed={otherActive} aria-expanded={otherActive} onClick={() => setOtherActive((prev) => !prev)} className="rounded-md">+ Other</Button></div>
          {otherActive && <Input autoFocus value={otherText} onChange={(e) => setOtherText(e.target.value)} placeholder="Enter specific symptom or concern..." className="mt-2 rounded-md" aria-label="Custom symptom" maxLength={80} />}
        </div>
        <div className="space-y-2">
          <Label>Dispense Medicine</Label>
          <Select value="" onValueChange={(name) => setMedicines((prev) => prev.includes(name) ? prev : [...prev, name])}><SelectTrigger className="rounded-md"><SelectValue placeholder="Select medicine" /></SelectTrigger><SelectContent>{inventory.map((item) => <SelectItem key={item.id} value={item.name} disabled={medicines.includes(item.name) || totalStock(item) === 0}>{item.name} · {totalStock(item)} pcs{suggested.includes(item.name) ? " · suggested" : ""}</SelectItem>)}</SelectContent></Select>
          {medicines.length > 0 && <div className="flex flex-wrap gap-2">{medicines.map((name) => <div key={name} className="flex items-center gap-1 rounded-md border border-border bg-secondary px-2 text-xs">{name} · 1 pc/student <Button variant="ghost" size="icon" className="h-6 w-6" aria-label={`Remove ${name}`} onClick={() => setMedicines((prev) => prev.filter((m) => m !== name))}><X className="h-3 w-3" /></Button></div>)}</div>}
          {lowStock.map((item) => item && <p key={item.id} className="text-xs font-medium text-warning">Low Stock: Only {totalStock(item)} remaining.</p>)}
          {insufficient.length > 0 && selected.length > 0 && <p className="text-xs text-destructive">Not enough stock for {selected.length} students: {insufficient.join(", ")}</p>}
        </div>
        <div className="flex items-center gap-2"><Button className="flex-1 rounded-md" onClick={submit}>Log {group ? `${selected.length || ""} Visits` : "Visit"}</Button>{caution && <Tooltip><TooltipTrigger asChild><span tabIndex={0} role="img" aria-label="Medicine caution" className="inline-flex cursor-help text-warning outline-none focus-visible:ring-2 focus-visible:ring-ring"><AlertTriangle className="h-5 w-5" /></span></TooltipTrigger><TooltipContent className="max-w-60 rounded-md shadow-none">Caution: Mefenamic Acid is contraindicated for stomach pain.</TooltipContent></Tooltip>}</div>
      </div>
      <aside className="h-fit rounded-md border border-border bg-card p-4 text-xs text-muted-foreground"><p className="mb-2 text-sm font-semibold text-foreground">Entry tips</p><ul className="list-disc space-y-1 pl-4"><li>Search a student to review allergies and last visit.</li><li>Select Group Log for students with the same symptoms and medicine.</li><li>Each medicine uses one piece per student.</li></ul></aside>
    </div>
  </>;
}
