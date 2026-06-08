"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { transactionLabel } from "@/lib/transactions";
import { Badge } from "@/components/ui/badge";
import type { Transaction, WalletAccount, Person } from "@prisma/client";

type SerializedAccount = Omit<WalletAccount, "balance"> & { balance: number };
type TxWithAccount = Omit<Transaction, "amount"> & { amount: number; account: SerializedAccount };

interface Props {
  person: Person;
  transactions: TxWithAccount[];
  net: number;
}

export function PersonLedger({ person, transactions, net }: Props) {
  const [items] = useState(transactions);

  const isOwedToMe = net > 0;
  const isOwedByMe = net < 0;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/people" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold">{person.name}</h1>
      </div>

      {/* Balance card */}
      <div className={`mx-4 mt-4 rounded-2xl p-4 ${
        isOwedToMe ? "bg-emerald-600" : isOwedByMe ? "bg-red-500" : "bg-muted"
      } text-white`}>
        <p className="text-sm opacity-80 mb-1">
          {isOwedToMe ? `${person.name} owes you` : isOwedByMe ? `You owe ${person.name}` : "All settled"}
        </p>
        <p className="text-3xl font-bold">{formatCurrency(Math.abs(net))}</p>
        {person.phone && (
          <p className="text-xs opacity-70 mt-2">{person.phone}</p>
        )}
      </div>

      {/* Transaction list */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground mb-3">TRANSACTION HISTORY</p>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No transactions yet</p>
        ) : (
          items.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
              <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-base shrink-0">
                {txIcon(tx.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{transactionLabel(tx.type as import("@prisma/client").TransactionType)}</p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{tx.account.name}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{formatRelativeDate(tx.date)}</p>
                {tx.note && <p className="text-xs text-muted-foreground truncate">{tx.note}</p>}
              </div>
              <p className={`text-sm font-semibold shrink-0 ${
                ["LEND", "SETTLEMENT_PAID"].includes(tx.type) ? "text-red-600" : "text-emerald-600"
              }`}>
                {["LEND", "SETTLEMENT_PAID"].includes(tx.type) ? "-" : "+"}
                {formatCurrency(Number(tx.amount))}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function txIcon(type: string): string {
  const icons: Record<string, string> = {
    LEND: "👋", BORROW: "🤝", SETTLEMENT_RECEIVED: "✅", SETTLEMENT_PAID: "💳",
  };
  return icons[type] ?? "💸";
}
