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
import type { Category, Person, WalletAccount } from "@prisma/client";

type SerializedAccount = Omit<WalletAccount, "balance"> & { balance: number };

const ACCOUNT_ICONS: Record<string, string> = {
  CASH: "💵", BANK: "🏦", WALLET: "👝", SAVINGS: "🐷", CREDIT_CARD: "💳", OTHER: "📦",
};

const TX_TYPES = [
  { value: "EXPENSE",            label: "Expense",   color: "bg-red-500" },
  { value: "INCOME",             label: "Income",    color: "bg-emerald-500" },
  { value: "TRANSFER",           label: "Transfer",  color: "bg-blue-500" },
  { value: "LEND",               label: "Lend",      color: "bg-orange-500" },
  { value: "BORROW",             label: "Borrow",    color: "bg-purple-500" },
  { value: "SETTLEMENT_RECEIVED",label: "Received",  color: "bg-teal-500" },
  { value: "SETTLEMENT_PAID",    label: "Paid Back", color: "bg-pink-500" },
];

const schema = z.object({
  amount: z.string().min(1, "Required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be positive"),
  date: z.string().min(1, "Required"),
  accountId: z.string().min(1, "Select an account"),
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

function AccountCard({
  account, selected, onSelect, showBalance = true,
}: {
  account: SerializedAccount; selected: boolean; onSelect: () => void; showBalance?: boolean;
}) {
  const icon = account.icon ?? ACCOUNT_ICONS[account.type] ?? "📦";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 min-w-27.5 shrink-0 transition-all ${
        selected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" : "border-border bg-muted/30"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-semibold leading-tight truncate w-full">{account.name}</span>
      {showBalance && (
        <span className={`text-[10px] font-medium ${account.balance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          Rs. {account.balance.toLocaleString()}
        </span>
      )}
    </button>
  );
}

function PersonCard({ person, selected, onSelect }: { person: Person; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all ${
        selected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" : "border-border bg-muted/30"
      }`}
    >
      <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
        {person.name[0].toUpperCase()}
      </span>
      <span className="text-sm font-medium truncate">{person.name}</span>
    </button>
  );
}

export function AddTransactionForm({ accounts, expenseCategories, incomeCategories, people }: Props) {
  const router = useRouter();
  const [type, setType] = useState("EXPENSE");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  const accountId = watch("accountId");
  const toAccountId = watch("toAccountId");
  const categoryId = watch("categoryId");
  const personId = watch("personId");

  const needsCategory = type === "EXPENSE" || type === "INCOME";
  const needsToAccount = type === "TRANSFER";
  const needsPerson = ["LEND", "BORROW", "SETTLEMENT_RECEIVED", "SETTLEMENT_PAID"].includes(type);
  const categories = type === "INCOME" ? incomeCategories : expenseCategories;

  function changeType(next: string) {
    setType(next);
    setValue("categoryId", "");
    setValue("personId", "");
    setValue("toAccountId", "");
  }

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-4 pb-8">

      {/* Transaction type */}
      <div className="grid grid-cols-4 gap-2">
        {TX_TYPES.map(({ value, label, color }) => (
          <button
            key={value}
            type="button"
            onClick={() => changeType(value)}
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
        <Input id="date" type="date" className="h-11" {...register("date")} />
      </div>

      {/* Account */}
      <div className="space-y-2">
        <Label>{needsToAccount ? "From Account" : "Account"}</Label>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              selected={accountId === a.id}
              onSelect={() => setValue("accountId", a.id, { shouldValidate: true })}
            />
          ))}
        </div>
        {errors.accountId && <p className="text-xs text-destructive">{errors.accountId.message}</p>}
      </div>

      {/* To Account (Transfer) */}
      {needsToAccount && (
        <div className="space-y-2">
          <Label>To Account</Label>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {accounts
              .filter((a) => a.id !== accountId)
              .map((a) => (
                <AccountCard
                  key={a.id}
                  account={a}
                  selected={toAccountId === a.id}
                  onSelect={() => setValue("toAccountId", a.id)}
                  showBalance={false}
                />
              ))}
          </div>
        </div>
      )}

      {/* Category */}
      {needsCategory && (
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setValue("categoryId", c.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  categoryId === c.id
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30"
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
        <div className="space-y-2">
          <Label>Person</Label>
          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No people yet. Add one from the People tab.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {people.map((p) => (
                <PersonCard
                  key={p.id}
                  person={p}
                  selected={personId === p.id}
                  onSelect={() => setValue("personId", p.id, { shouldValidate: true })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" placeholder="Add a note..." rows={2} {...register("note")} />
      </div>

      <Button type="submit" disabled={loading} className="h-12 text-base bg-indigo-600 hover:bg-indigo-700 mt-1">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Save Transaction
      </Button>
    </form>
  );
}
