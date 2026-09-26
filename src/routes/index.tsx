import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Users, PackageMinus, FileText } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEPARTMENTS, stockStatus, totalStock, useClinic } from "@/lib/clinic-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — PHINMA AU Clinic Surveillance" },
      {
        name: "description",
        content: "Daily visit counts, classroom outbreak heatmap and low-stock alerts for the campus clinic.",
      },
      { property: "og:title", content: "Dashboard — PHINMA AU Clinic Surveillance" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Daily visit counts, classroom outbreak heatmap and low-stock alerts for the campus clinic.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { logs, inventory } = useClinic();
  const [reportOpen, setReportOpen] = useState(false);

  const rooms = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const roomLogs = logs.filter((l) => l.department === dept);
      const counts: Record<string, number> = {};
      roomLogs.forEach((l) => l.symptoms.forEach((s) => (counts[s] = (counts[s] ?? 0) + 1)));
      const flagged = Object.values(counts).some((c) => c >= 3);
      return {
        dept,
        cases: roomLogs.length,
        counts,
        flagged,
        lastVisit: roomLogs[0]?.time ?? "—",
        affected: [...new Set(roomLogs.map((log) => log.student))],
      };
    });
  }, [logs]);

  const lowStock = inventory.filter((i) => stockStatus(i) === "Low");
  const outbreaks = rooms.filter((r) => r.flagged);

  const usedMeds = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => l.medicines.forEach((m) => (map[m] = (map[m] ?? 0) + 1)));
    return map;
  }, [logs]);

  return (
    <>
      <PageHeader
        title="Health Surveillance Dashboard"
        description="Live classroom monitoring for today's clinic activity."
        action={
          <Button size="sm" className="rounded-md" onClick={() => setReportOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Generate EOD Report
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Kpi label="Total Visits Today" value={logs.length} icon={<Users className="h-4 w-4" />} />
          <Kpi
            label="Active Outbreak Warnings"
            value={outbreaks.length}
            icon={<AlertTriangle className="h-4 w-4 text-accent" />}
            alert={outbreaks.length > 0}
          />
          <Kpi label="Items Low on Stock" value={lowStock.length} icon={<PackageMinus className="h-4 w-4" />} />
        </div>

        <h2 className="mt-6 mb-2 text-sm font-semibold tracking-tight text-foreground">
          Classroom Heatmap
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => {
            const content = (
                <div
                  tabIndex={room.flagged ? 0 : undefined}
                  className={`rounded-md border bg-card p-3 text-left outline-none transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring ${
                    room.flagged ? "border-accent" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{room.dept}</span>
                    {room.flagged && <AlertTriangle className="h-4 w-4 text-accent" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {room.cases} active {room.cases === 1 ? "case" : "cases"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(room.counts).map(([s, c]) => (
                      <Badge key={s} variant="secondary" className="rounded-md text-[10px] font-normal">
                        {c} {s}
                      </Badge>
                    ))}
                    {room.cases === 0 && (
                      <span className="text-[11px] text-muted-foreground">No visits logged</span>
                    )}
                  </div>
                </div>
            );
            return room.flagged ? <HoverCard key={room.dept} openDelay={120}>
              <HoverCardTrigger asChild>{content}</HoverCardTrigger>
              <HoverCardContent align="start" className="w-72 rounded-md border-border bg-popover p-3 text-xs shadow-none">
                <p className="font-semibold text-foreground">{room.dept}</p>
                <p className="mt-1">Trend: {room.cases} cases in 3 days (Spiking)</p>
                <p className="mt-1">Affected Students: {room.affected.map((name) => name.split(" ").map((part, index) => index === 0 ? part : `${part[0]}.`).join(" ")).join(", ")}</p>
              </HoverCardContent>
            </HoverCard> : <Tooltip key={room.dept}><TooltipTrigger asChild>{content}</TooltipTrigger><TooltipContent className="rounded-md shadow-none">{room.cases} cases · Last visit: {room.lastVisit}</TooltipContent></Tooltip>;
          })}
        </div>

        <h2 className="mt-6 mb-2 text-sm font-semibold tracking-tight text-foreground">Recent Visits</h2>
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Room</th>
                <th className="px-3 py-2 font-medium">Symptoms</th>
                <th className="px-3 py-2 font-medium">Dispensed</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 8).map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-3 py-1.5 text-muted-foreground">{l.time}</td>
                  <td className="px-3 py-1.5">{l.student}</td>
                  <td className="px-3 py-1.5">{l.department}</td>
                  <td className="px-3 py-1.5">{l.symptoms.join(", ")}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{l.medicines.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="rounded-md">
          <DialogHeader>
            <DialogTitle>End of Day Report</DialogTitle>
            <DialogDescription>Summary of today's cases and inventory usage.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 font-medium">Cases</p>
              <p className="text-muted-foreground">
                {logs.length} total visits across {rooms.filter((r) => r.cases > 0).length} rooms.
                {outbreaks.length > 0
                  ? ` Outbreak watch: ${outbreaks.map((o) => o.dept).join(", ")}.`
                  : " No outbreak warnings."}
              </p>
            </div>
            <div>
              <p className="mb-1 font-medium">Medicine Used</p>
              <ul className="space-y-1 text-muted-foreground">
                {Object.entries(usedMeds).map(([m, c]) => (
                  <li key={m} className="flex justify-between border-b border-border pb-1">
                    <span>{m}</span>
                    <span>{c} pc(s)</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 font-medium">Remaining Stock</p>
              <ul className="space-y-1 text-muted-foreground">
                {inventory.map((i) => (
                  <li key={i.id} className="flex justify-between border-b border-border pb-1">
                    <span>{i.name}</span>
                    <span>{totalStock(i)} pcs</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Kpi({
  label,
  value,
  icon,
  alert,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-md border bg-card p-4 ${alert ? "border-accent" : "border-border"}`}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
