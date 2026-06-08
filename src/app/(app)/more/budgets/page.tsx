import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BudgetsManager } from "@/components/budgets/BudgetsManager";

export default async function BudgetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [budgets, expenseCategories, spending] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: session.user.id, month, year },
      include: { category: true },
    }),
    prisma.category.findMany({
      where: { userId: session.user.id, type: "EXPENSE", isArchived: false },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId: session.user.id, type: "EXPENSE", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
  ]);

  const totalSpend = spending.reduce((s, t) => s + Number(t._sum.amount ?? 0), 0);

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <a href="/more" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </a>
        <h1 className="text-lg font-semibold">Budgets</h1>
      </div>
      <BudgetsManager
        budgets={budgets.map((b) => ({ ...b, amount: Number(b.amount) }))}
        categories={expenseCategories}
        spending={spending.reduce<Record<string, number>>((acc, s) => {
          acc[s.categoryId ?? "__overall"] = Number(s._sum.amount ?? 0);
          return acc;
        }, {})}
        totalSpend={totalSpend}
        month={month}
        year={year}
      />
    </div>
  );
}
