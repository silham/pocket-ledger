"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category } from "@prisma/client";

const EMOJIS = ["🍔","🚌","📚","📱","🛍️","💊","🎬","👨‍👩‍👧","📄","✈️","🎓","💼","📦","💰","💻","🏪","🎁","↩️","📥"];
const COLORS = ["#F59E0B","#3B82F6","#8B5CF6","#EC4899","#F97316","#EF4444","#14B8A6","#84CC16","#6B7280","#10B981"];

const schema = z.object({ name: z.string().min(1, "Required"), icon: z.string().optional(), color: z.string().optional() });
type FormData = z.infer<typeof schema>;

interface Props {
  expenseCategories: Category[];
  incomeCategories: Category[];
}

export function CategoriesManager({ expenseCategories, incomeCategories }: Props) {
  const [expense, setExpense] = useState(expenseCategories);
  const [income, setIncome] = useState(incomeCategories);
  const [showForm, setShowForm] = useState<"EXPENSE" | "INCOME" | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    if (!showForm) return;
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: showForm }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Failed"); return; }
    const cat = await res.json();
    if (showForm === "EXPENSE") setExpense((p) => [...p, cat]);
    else setIncome((p) => [...p, cat]);
    toast.success("Category added");
    reset();
    setShowForm(null);
  }

  async function archiveCat(id: string, type: "EXPENSE" | "INCOME") {
    if (!confirm("Archive this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (type === "EXPENSE") setExpense((p) => p.filter((c) => c.id !== id));
      else setIncome((p) => p.filter((c) => c.id !== id));
      toast.success("Archived");
    }
  }

  return (
    <div className="p-4 space-y-6">
      <Section title="Expense Categories" categories={expense} type="EXPENSE"
        onAdd={() => { reset(); setShowForm("EXPENSE"); }} onArchive={archiveCat} />
      <Section title="Income Categories" categories={income} type="INCOME"
        onAdd={() => { reset(); setShowForm("INCOME"); }} onArchive={archiveCat} />

      <Dialog open={!!showForm} onOpenChange={() => setShowForm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add {showForm === "INCOME" ? "Income" : "Expense"} Category</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Category name" {...register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" onClick={() => setValue("icon", e)}
                    className={`w-9 h-9 rounded-lg text-xl transition-all ${watch("icon") === e ? "bg-indigo-100 ring-2 ring-indigo-500" : "bg-muted"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setValue("color", c)}
                    className={`w-7 h-7 rounded-full transition-transform ${watch("color") === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(null)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, categories, type, onAdd, onArchive }: {
  title: string; categories: Category[]; type: "EXPENSE" | "INCOME";
  onAdd: () => void; onArchive: (id: string, type: "EXPENSE" | "INCOME") => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <button onClick={onAdd} className="flex items-center gap-1 text-indigo-600 text-xs font-medium">
          <Plus className="w-3.5 h-3.5" />Add
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((c) => (
          <div key={c.id} className="relative flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-card">
            <span className="text-2xl">{c.icon ?? "📦"}</span>
            <span className="text-xs font-medium text-center leading-tight">{c.name}</span>
            {!c.isDefault && (
              <button onClick={() => onArchive(c.id, type)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-muted">
                <Archive className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
