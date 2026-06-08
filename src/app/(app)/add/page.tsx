import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";

export default async function AddPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [accounts, expenseCategories, incomeCategories, people] = await Promise.all([
    prisma.walletAccount.findMany({ where: { userId: session.user.id, isArchived: false }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { userId: session.user.id, type: "EXPENSE", isArchived: false }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
    prisma.category.findMany({ where: { userId: session.user.id, type: "INCOME", isArchived: false }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
    prisma.person.findMany({ where: { userId: session.user.id, isArchived: false }, orderBy: { name: "asc" } }),
  ]);

  const serializedAccounts = accounts.map((a) => ({ ...a, balance: Number(a.balance) }));

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">Add Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={serializedAccounts}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        people={people}
      />
    </div>
  );
}
