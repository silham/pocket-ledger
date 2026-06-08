import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TransactionList } from "@/components/transactions/TransactionList";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { account: true, toAccount: true, category: true, person: true },
    orderBy: { date: "desc" },
    take: 100,
  });
  const transactions = raw.map((t) => ({
    ...t,
    amount: Number(t.amount),
    account: { ...t.account, balance: Number(t.account.balance) },
    toAccount: t.toAccount ? { ...t.toAccount, balance: Number(t.toAccount.balance) } : null,
  }));

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">Transactions</h1>
      </div>
      <TransactionList transactions={transactions} />
    </div>
  );
}
