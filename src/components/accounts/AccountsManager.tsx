"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { WalletAccount } from "@prisma/client";

type SerializedAccount = Omit<WalletAccount, "balance"> & { balance: number };

const ACCOUNT_TYPES = [
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "BANK", label: "Bank", icon: "🏦" },
  { value: "WALLET", label: "Digital Wallet", icon: "👝" },
  { value: "SAVINGS", label: "Savings", icon: "🐷" },
  { value: "CREDIT_CARD", label: "Credit Card", icon: "💳" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#3B82F6", "#14B8A6"];

const schema = z.object({
  name: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  balance: z.string().optional(),
  color: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function AccountsManager({ accounts: initial }: { accounts: SerializedAccount[] }) {
  const [accounts, setAccounts] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SerializedAccount | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function openAdd() { reset(); setEditing(null); setShowForm(true); }
  function openEdit(a: SerializedAccount) {
    reset({ name: a.name, type: a.type, color: a.color ?? "" });
    setEditing(a);
    setShowForm(true);
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    const url = editing ? `/api/accounts/${editing.id}` : "/api/accounts";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, balance: data.balance ? parseFloat(data.balance) : 0 }),
    });
    setLoading(false);

    if (!res.ok) { toast.error("Failed to save account"); return; }
    const saved = await res.json();
    if (editing) {
      setAccounts((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
      toast.success("Account updated");
    } else {
      setAccounts((prev) => [...prev, saved]);
      toast.success("Account added");
    }
    setShowForm(false);
  }

  async function archive(id: string) {
    if (!confirm("Archive this account?")) return;
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (res.ok) { setAccounts((prev) => prev.filter((a) => a.id !== id)); toast.success("Archived"); }
    else toast.error("Failed");
  }

  const selectedType = ACCOUNT_TYPES.find((t) => t.value === (watch("type") ?? ""));

  return (
    <div className="p-4 space-y-3">
      <Button onClick={openAdd} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
        <Plus className="w-4 h-4" /> Add Account
      </Button>

      {accounts.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">No accounts yet.</p>
      )}

      {accounts.map((a) => {
        const typeInfo = ACCOUNT_TYPES.find((t) => t.value === a.type);
        return (
          <div key={a.id} className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: a.color ? `${a.color}20` : "#6366F120" }}>
              {typeInfo?.icon ?? "📦"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
            </div>
            <p className={`text-sm font-semibold mr-2 ${Number(a.balance) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(Number(a.balance))}
            </p>
            <button onClick={() => openEdit(a)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => archive(a.id)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted">
              <Archive className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        );
      })}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Account" : "Add Account"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. Cash, BOC Bank" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select onValueChange={(v: string | null) => setValue("type", v ?? "")} defaultValue={editing?.type}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Opening Balance (Rs.)</Label>
                <Input inputMode="decimal" placeholder="0.00" {...register("balance")} />
              </div>
            )}
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
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
