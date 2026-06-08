"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { Budget, Category } from "@prisma/client";

type BudgetWithCat = Omit<Budget, "amount"> & { amount: number; category: Category | null };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const schema = z.object({
  amount: z.string().min(1, "Required"),
  categoryId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  budgets: BudgetWithCat[];
  categories: Category[];
  spending: Record<string, number>;
  totalSpend: number;
  month: number;
  year: number;
}

export function BudgetsManager({ budgets: initial, categories, spending, totalSpend, month, year }: Props) {
  const [budgets, setBudgets] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(data.amount),
        categoryId: data.categoryId || null,
        month, year,
        name: data.categoryId ? categories.find((c) => c.id === data.categoryId)?.name ?? "Budget" : "Overall Budget",
        isOverall: !data.categoryId,
      }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Failed to save budget"); return; }
    const saved = await res.json();
    // Replace or add
    const cat = categories.find((c) => c.id === saved.categoryId) ?? null;
    const withCat = { ...saved, category: cat };
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.id === saved.id);
      return idx >= 0 ? prev.map((b) => (b.id === saved.id ? withCat : b)) : [...prev, withCat];
    });
    toast.success("Budget saved");
    reset();
    setShowForm(false);
  }

  async function deleteBudget(id: string) {
    if (!confirm("Delete this budget?")) return;
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (res.ok) { setBudgets((p) => p.filter((b) => b.id !== id)); toast.success("Deleted"); }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground">{MONTHS[month - 1]} {year}</p>
      </div>

      <Button onClick={() => { reset(); setShowForm(true); }} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
        <Plus className="w-4 h-4" /> Set Budget
      </Button>

      {budgets.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">No budgets set for this month.</p>
      )}

      {budgets.map((b) => {
        const spent = b.isOverall ? totalSpend : (spending[b.categoryId ?? ""] ?? 0);
        const pct = Math.min(100, (spent / Number(b.amount)) * 100);
        const over = spent > Number(b.amount);
        const warn = pct >= 80 && !over;

        return (
          <div key={b.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {b.category && <span className="text-xl">{b.category.icon ?? "📦"}</span>}
                <p className="text-sm font-medium">{b.name}</p>
              </div>
              <button onClick={() => deleteBudget(b.id)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <Progress value={pct} className={`h-2 ${over ? "[&>div]:bg-red-500" : warn ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={over ? "text-red-600 font-medium" : warn ? "text-amber-600 font-medium" : ""}>
                {formatCurrency(spent)} spent
              </span>
              <span>{formatCurrency(Number(b.amount))} budget</span>
            </div>
            {over && <p className="text-xs text-red-600 font-medium">⚠ Over budget by {formatCurrency(spent - Number(b.amount))}</p>}
          </div>
        );
      })}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Set Budget</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category (leave empty for overall budget)</Label>
              <Select onValueChange={(v: string | null) => setValue("categoryId", !v || v === "__overall" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Overall monthly budget" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__overall">Overall (all spending)</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon ?? ""} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Budget Amount (Rs.)</Label>
              <Input inputMode="decimal" placeholder="0.00" {...register("amount")} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
