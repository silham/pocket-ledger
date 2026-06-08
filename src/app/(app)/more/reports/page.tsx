import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [categorySpending, monthlyFlow, accountBalances] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId: session.user.id, type: "EXPENSE", date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),

    // Last 6 months income vs expense
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId: session.user.id,
        type: { in: ["EXPENSE", "INCOME"] },
        date: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      _sum: { amount: true },
    }),

    prisma.walletAccount.findMany({
      where: { userId: session.user.id, isArchived: false },
      orderBy: { balance: "desc" },
    }),
  ]);

  // Get category details
  const categoryIds = categorySpending.map((s) => s.categoryId).filter(Boolean) as string[];
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const totalExpense = categorySpending.reduce((s, c) => s + Number(c._sum.amount ?? 0), 0);
  const totalIncome = Number(monthlyFlow.find((m) => m.type === "INCOME")?._sum.amount ?? 0);
  const totalBalance = accountBalances.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <a href="/more" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </a>
        <h1 className="text-lg font-semibold">Reports</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Month summary */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {now.toLocaleString("default", { month: "long" })} {now.getFullYear()} Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="col-span-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">Net Flow</p>
              <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Spending by category */}
        {categorySpending.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {categorySpending.map((s) => {
                const cat = catMap[s.categoryId ?? ""];
                const amount = Number(s._sum.amount ?? 0);
                const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return (
                  <div key={s.categoryId ?? "other"} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <span>{cat?.icon ?? "📦"}</span>
                        <span className="font-medium">{cat?.name ?? "Uncategorized"}</span>
                      </span>
                      <span className="text-muted-foreground">{formatCurrency(amount)} <span className="text-xs">({pct}%)</span></span>
                    </div>
                    <Progress value={pct} className="h-1.5" style={{ "--progress-color": cat?.color ?? "#6366F1" } as React.CSSProperties} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Account balances */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Balances</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {accountBalances.map((a) => (
              <div key={a.id} className="flex justify-between items-center">
                <span className="text-sm">{a.name}</span>
                <span className={`text-sm font-semibold ${Number(a.balance) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(Number(a.balance))}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-semibold">Total</span>
              <span className={`text-sm font-bold ${totalBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(totalBalance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
