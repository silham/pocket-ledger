"use client";

import { useState } from "react";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { transactionSign, transactionColor, transactionLabel } from "@/lib/transactions";
import type { Transaction, WalletAccount, Category, Person } from "@prisma/client";
import { TransactionDeleteButton } from "./TransactionDeleteButton";

type SerializedAccount = Omit<WalletAccount, "balance"> & { balance: number };
type TxWithRelations = Omit<Transaction, "amount"> & {
  amount: number;
  account: SerializedAccount;
  toAccount: SerializedAccount | null;
  category: Category | null;
  person: Person | null;
};

const TX_TYPES = [
  { value: "", label: "All" },
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "LEND", label: "Lent" },
  { value: "BORROW", label: "Borrowed" },
  { value: "SETTLEMENT_RECEIVED", label: "Received" },
  { value: "SETTLEMENT_PAID", label: "Paid Back" },
];

interface Props {
  transactions: TxWithRelations[];
}

export function TransactionList({ transactions }: Props) {
  const [filter, setFilter] = useState("");
  const [items, setItems] = useState(transactions);

  const filtered = filter ? items.filter((t) => t.type === filter) : items;

  // Group by date
  const grouped = filtered.reduce<Record<string, TxWithRelations[]>>((acc, tx) => {
    const key = formatRelativeDate(tx.date);
    (acc[key] = acc[key] ?? []).push(tx);
    return acc;
  }, {});

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
        {TX_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filter === value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-background text-muted-foreground border-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction groups */}
      <div className="flex-1 px-4 pb-4 space-y-4">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No transactions found</p>
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{date}</p>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TransactionRow({ tx, onDelete }: { tx: TxWithRelations; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
      <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">
        {tx.category?.icon ?? txIcon(tx.type)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {tx.category?.name ?? transactionLabel(tx.type)}
          {tx.type === "TRANSFER" && tx.toAccount && (
            <span className="text-muted-foreground font-normal"> → {tx.toAccount.name}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {tx.account.name}
          {tx.person && <span> · {tx.person.name}</span>}
          {tx.note && <span> · {tx.note}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <p className={`text-sm font-semibold ${transactionColor(tx.type)}`}>
          {transactionSign(tx.type)}{formatCurrency(Number(tx.amount))}
        </p>
        <TransactionDeleteButton id={tx.id} onDelete={onDelete} />
      </div>
    </div>
  );
}

function txIcon(type: string): string {
  const icons: Record<string, string> = {
    EXPENSE: "💸", INCOME: "💰", TRANSFER: "🔄",
    LEND: "👋", BORROW: "🤝", SETTLEMENT_RECEIVED: "✅", SETTLEMENT_PAID: "💳", ADJUSTMENT: "⚖️",
  };
  return icons[type] ?? "💸";
}
