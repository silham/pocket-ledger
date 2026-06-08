import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { transactionSign, transactionColor, transactionLabel } from "@/lib/transactions";
import type { Transaction, WalletAccount, Category, Person } from "@prisma/client";

type TxWithRelations = Transaction & {
  account: WalletAccount;
  category: Category | null;
  person: Person | null;
};

interface Props {
  transactions: TxWithRelations[];
}

export function RecentTransactions({ transactions }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
        <Link href="/transactions" className="text-xs text-indigo-600 font-medium">
          See all
        </Link>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-base shrink-0">
                  {tx.category?.icon ?? "💸"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.category?.name ?? transactionLabel(tx.type)}
                    {tx.person && <span className="text-muted-foreground font-normal"> · {tx.person.name}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.account.name}</p>
                </div>
                <p className={`text-sm font-semibold shrink-0 ${transactionColor(tx.type)}`}>
                  {transactionSign(tx.type)}{formatCurrency(Number(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
