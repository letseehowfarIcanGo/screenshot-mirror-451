import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stockStatus, totalStock, useClinic } from "@/lib/clinic-data";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — PHINMA AU Clinic" },
      { name: "description", content: "Clinic medicine stock levels, batch expiry tracking and restocking." },
      { property: "og:title", content: "Inventory — PHINMA AU Clinic" },
      { property: "og:description", content: "Clinic medicine stock levels, batch expiry tracking and restocking." },
    ],
  }),
  component: Inventory,
});

export function statusClass(status: string) {
  if (status === "Low") return "border-destructive text-destructive";
  if (status === "Expiring") return "border-accent text-amber-600";
  return "border-border text-muted-foreground";
}

function Inventory() {
  const { inventory, receiveStock } = useClinic();
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [expires, setExpires] = useState("");

  function submit() {
    const amount = Number(qty);
    if (!itemId || !amount || amount <= 0 || !expires) {
      toast.error("Select an item, quantity and expiry date.");
      return;
    }
    const label = new Date(expires).toLocaleDateString(undefined, { month: "short", year: "numeric" });
    receiveStock(itemId, amount, label);
    toast.success(`Received ${amount} pcs`, { description: `Expires ${label}` });
    setOpen(false);
    setItemId("");
    setQty("");
    setExpires("");
  }

  return (
    <>
      <PageHeader
        title="Inventory Management"
        description="Stock levels and batch expiry across clinic supplies."
        action={
          <Button size="sm" className="rounded-md" onClick={() => setOpen(true)}>
            <PackagePlus className="mr-2 h-4 w-4" /> Receive Stock
          </Button>
        }
      />

      <div className="p-6">
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const status = stockStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-right tabular-nums">{totalStock(item)} pcs</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className={`rounded-md ${statusClass(status)}`}>
                            {status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {item.batches.map((b) => `${b.code}: ${b.qty} pcs (Expires ${b.expires})`).join(" | ")}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-md">
          <DialogHeader>
            <DialogTitle>Receive Stock</DialogTitle>
            <DialogDescription>Add a new batch to an existing item.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Item Name</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="rounded-md"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp">Expiry Date</Label>
              <Input
                id="exp"
                type="date"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="rounded-md"
              />
            </div>
            <Button className="w-full rounded-md" onClick={submit}>
              Add Batch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
