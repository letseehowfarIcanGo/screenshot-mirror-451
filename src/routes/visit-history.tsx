import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClinic, type VisitLog } from "@/lib/clinic-data";

export const Route = createFileRoute("/visit-history")({
  head: () => ({ meta: [
    { title: "Visit History — PHINMA AU Clinic" },
    { name: "description", content: "Searchable archive of past clinic visits with date range filters." },
    { property: "og:title", content: "Visit History — PHINMA AU Clinic" },
    { property: "og:description", content: "Searchable archive of past clinic visits with date range filters." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: VisitHistory,
});

type Range = "today" | "week" | "month" | "all";

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

function inRange(date: string, range: Range) {
  if (range === "all") return true;
  const then = Date.parse(`${date}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (range === "today") return then >= today;
  if (range === "week") return then >= today - 6 * 86_400_000;
  return then >= new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function VisitHistory() {
  const { logs } = useClinic();
  const [range, setRange] = useState<Range>("week");
  const [query, setQuery] = useState("");
  const [slip, setSlip] = useState<VisitLog | null>(null);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => inRange(log.date, range) && (!q || log.student.toLowerCase().includes(q)));
  }, [logs, range, query]);

  return (
    <>
      <PageHeader title="Visit History" description="Archive of all logged clinic visits." />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student name"
              className="rounded-md pl-8"
              aria-label="Search by student name"
            />
          </div>
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="w-44 rounded-md" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "visit" : "visits"}</span>
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Date / Time</th>
                <th className="px-3 py-2 font-medium">Student Name</th>
                <th className="px-3 py-2 font-medium">Classroom</th>
                <th className="px-3 py-2 font-medium">Symptom</th>
                <th className="px-3 py-2 font-medium">Treatment Given</th>
                <th className="px-3 py-2 text-right font-medium">Slip</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-t border-border transition-colors hover:bg-secondary/50">
                  <td className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">{formatDate(log.date)} · {log.time}</td>
                  <td className="px-3 py-1.5 font-medium">{log.student}</td>
                  <td className="px-3 py-1.5">{log.department}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex flex-wrap gap-1">
                      {log.symptoms.map((s) => <Badge key={s} variant="secondary" className="rounded-md text-[10px] font-normal">{s}</Badge>)}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">{log.medicines.join(", ") || "—"}</td>
                  <td className="px-3 py-1.5 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Print return to class slip for ${log.student}`}
                      onClick={() => setSlip(log)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="border-t border-border">
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No visits match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!slip} onOpenChange={(open) => !open && setSlip(null)}>
        <DialogContent className="max-w-xs rounded-md p-0 shadow-none print-slip">
          <DialogHeader className="sr-only">
            <DialogTitle>Return to class slip</DialogTitle>
          </DialogHeader>
          {slip && (
            <div className="print-slip-body space-y-3 bg-card px-5 py-6 font-mono text-xs text-foreground">
              <div className="text-center">
                <p className="text-sm font-bold tracking-widest">PHINMA</p>
                <p className="text-sm font-bold tracking-widest">ARAULLO UNIVERSITY</p>
                <p className="text-[10px] tracking-wider text-muted-foreground">UNIVERSITY CLINIC</p>
              </div>
              <div className="border-y border-dashed border-border py-2 text-center text-sm font-semibold tracking-wide">CLINIC PASS</div>
              <dl className="space-y-1">
                <div className="flex justify-between gap-3"><dt>Student</dt><dd className="font-semibold">{slip.student}</dd></div>
                <div className="flex justify-between gap-3"><dt>Classroom</dt><dd>{slip.department}</dd></div>
                <div className="flex justify-between gap-3"><dt>Date</dt><dd>{formatDate(slip.date)}</dd></div>
                <div className="flex justify-between gap-3"><dt>Time Out</dt><dd>{slip.time}</dd></div>
                <div className="flex justify-between gap-3"><dt>Complaint</dt><dd className="text-right">{slip.symptoms.join(", ")}</dd></div>
                <div className="flex justify-between gap-3"><dt>Treatment</dt><dd className="text-right">{slip.medicines.join(", ") || "None"}</dd></div>
              </dl>
              <p className="border-t border-dashed border-border pt-2 text-center font-semibold">Status: Cleared to return to class</p>
              <p className="text-center text-[10px] text-muted-foreground">Nurse on duty · School Health Services</p>
              <Button className="no-print w-full rounded-md" onClick={() => window.print()}>Print</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );

}
