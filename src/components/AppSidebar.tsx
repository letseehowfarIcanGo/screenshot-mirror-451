import { Link } from "@tanstack/react-router";
import { Activity, ClipboardPlus, Boxes, History } from "lucide-react";
import seal from "@/assets/au-seal.png.asset.json";

const items = [
  { title: "Dashboard", subtitle: "Surveillance", url: "/", icon: Activity },
  { title: "Quick Log", subtitle: "10-second entry", url: "/quick-log", icon: ClipboardPlus },
  { title: "Visit History", subtitle: "Past visit archive", url: "/visit-history", icon: History },
  { title: "Inventory", subtitle: "Stock & batches", url: "/inventory", icon: Boxes },
] as const;

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
        <img src={seal.url} alt="Araullo University seal" className="h-9 w-9 shrink-0" />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">PHINMA AU Clinic</p>
          <p className="text-[11px] text-sidebar-foreground/70">Health Surveillance System</p>
        </div>
      </div>

      <nav className="flex-1 p-2">
        {items.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            activeOptions={{ exact: item.url === "/" }}
            className="mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
            activeProps={{ className: "bg-sidebar-accent font-semibold" }}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex flex-col leading-tight">
              <span>{item.title}</span>
              <span className="text-[11px] text-sidebar-foreground/60">{item.subtitle}</span>
            </span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-sidebar-foreground/70">
        Logged in as <span className="text-sidebar-primary">Nurse on duty</span>
      </div>
    </aside>
  );
}
