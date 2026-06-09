"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { revalidateAfterTransaction } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, Person, WalletAccount } from "@prisma/client";

type SerializedAccount = Omit<WalletAccount, "balance"> & { balance: number };

const TX_TYPES = [
  { value: "EXPENSE", label: "Expense", color: "bg-red-500" },
  { value: "INCOME", label: "Income", color: "bg-emerald-500" },
  { value: "TRANSFER", label: "Transfer", color: "bg-blue-500" },
  { value: "LEND", label: "Lend", color: "bg-orange-500" },
  { value: "BORROW", label: "Borrow", color: "bg-purple-500" },
  { value: "SETTLEMENT_RECEIVED", label: "Received", color: "bg-teal-500" },
  { value: "SETTLEMENT_PAID", label: "Paid Back", color: "bg-pink-500" },
];

const schema = z.object({
  amount: z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be positive"),
  date: z.string().min(1, "Required"),
  accountId: z.string().min(1, "Required"),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  personId: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  accounts: SerializedAccount[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  people: Person[];
}

export function AddTransactionForm({ accounts, expenseCategories, incomeCategories, people }: Props) {
  const router = useRouter();
  const [type, setType] = useState("EXPENSE");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  const needsCategory = type === "EXPENSE" || type === "INCOME";
  const needsToAccount = type === "TRANSFER";
  const needsPerson = ["LEND", "BORROW", "SETTLEMENT_RECEIVED", "SETTLEMENT_PAID"].includes(type);
  const categories = type === "INCOME" ? incomeCategories : expenseCategories;

  async function onSubmit(data: FormData) {
    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        type,
        categoryId: data.categoryId || undefined,
        toAccountId: data.toAccountId || undefined,
        personId: data.personId || undefined,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json();
      toast.error(body.error ?? "Failed to save");
      return;
    }

    toast.success("Transaction saved");
    reset({ date: new Date().toISOString().slice(0, 10) });
    await revalidateAfterTransaction();
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
      {/* Type selector */}
      <div className="grid grid-cols-4 gap-2">
        {TX_TYPES.map(({ value, label, color }) => (
          <button
            key={value}
            type="button"
            onClick={() => { setType(value); setValue("categoryId", ""); setValue("personId", ""); setValue("toAccountId", ""); }}
            className={`py-2 rounded-xl text-xs font-medium transition-all border-2 ${
              type === value
                ? `${color} text-white border-transparent shadow-md`
                : "bg-muted text-muted-foreground border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (Rs.)</Label>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          className="text-2xl font-bold h-14 text-center"
          {...register("amount")}
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      {/* Account */}
      <div className="space-y-1.5">
        <Label>{needsToAccount ? "From Account" : "Account"}</Label>
        <Select onValueChange={(v: string | null) => setValue("accountId", v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.icon ?? ""} {a.name} · Rs. {Number(a.balance).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.accountId && <p className="text-xs text-destructive">{errors.accountId.message}</p>}
      </div>

      {/* To Account (Transfer) */}
      {needsToAccount && (
        <div className="space-y-1.5">
          <Label>To Account</Label>
          <Select onValueChange={(v: string | null) => setValue("toAccountId", v ?? undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.icon ?? ""} {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Category */}
      {needsCategory && (
        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setValue("categoryId", c.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs ${
                  watch("categoryId") === c.id
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-border bg-muted/30"
                }`}
              >
                <span className="text-xl">{c.icon ?? "📦"}</span>
                <span className="text-[10px] font-medium leading-tight text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Person */}
      {needsPerson && (
        <div className="space-y-1.5">
          <Label>Person</Label>
          <Select onValueChange={(v: string | null) => setValue("personId", v ?? undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              {people.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" placeholder="Add a note..." rows={2} {...register("note")} />
      </div>

      <Button type="submit" disabled={loading} className="h-12 text-base bg-indigo-600 hover:bg-indigo-700">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Save Transaction
      </Button>
    </form>
  );
}
