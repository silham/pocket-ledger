import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DebtSummary } from "@/components/dashboard/DebtSummary";
import { BalanceChart } from "@/components/dashboard/BalanceChart";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";

const CATEGORY_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#3b82f6", "#14b8a6", "#f97316", "#06b6d4",
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [accounts, monthlyStats, todayExpenses, recentTransactions, debtStats, last30Txns, categoryExpenses] =
    await Promise.all([
      prisma.walletAccount.findMany({
        where: { userId, isArchived: false },
        orderBy: { createdAt: "asc" },
      }),

      prisma.transaction.groupBy({
        by: ["type"],
        where: { userId, date: { gte: startOfMonth }, type: { in: ["EXPENSE", "INCOME"] } },
        _sum: { amount: true },
      }),

      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: startOfDay } },
        _sum: { amount: true },
      }),

      prisma.transaction.findMany({
        where: { userId },
        include: { account: true, category: true, person: true },
        orderBy: { date: "desc" },
        take: 10,
      }),

      prisma.transaction.groupBy({
        by: ["type"],
        where: { userId, type: { in: ["LEND", "BORROW", "SETTLEMENT_RECEIVED", "SETTLEMENT_PAID"] } },
        _sum: { amount: true },
      }),

      // All transactions in last 30 days for balance timeline
      prisma.transaction.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "asc" },
        select: { date: true, type: true, amount: true },
      }),

      // Expenses by category (last 30 days)
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { userId, type: "EXPENSE", date: { gte: thirtyDaysAgo }, categoryId: { not: null } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
    ]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const monthExpense = Number(monthlyStats.find((s) => s.type === "EXPENSE")?._sum.amount ?? 0);
  const monthIncome = Number(monthlyStats.find((s) => s.type === "INCOME")?._sum.amount ?? 0);
  const todaySpend = Number(todayExpenses._sum.amount ?? 0);

  const totalLent = Number(debtStats.find((s) => s.type === "LEND")?._sum.amount ?? 0);
  const totalBorrowed = Number(debtStats.find((s) => s.type === "BORROW")?._sum.amount ?? 0);
  const settledReceived = Number(debtStats.find((s) => s.type === "SETTLEMENT_RECEIVED")?._sum.amount ?? 0);
  const settledPaid = Number(debtStats.find((s) => s.type === "SETTLEMENT_PAID")?._sum.amount ?? 0);
  const othersOweMe = Math.max(0, totalLent - settledReceived);
  const iOweOthers = Math.max(0, totalBorrowed - settledPaid);

  // Build daily balance timeline (last 30 days)
  // Reconstruct by working backwards from current balance
  const days: { label: string; balance: number }[] = [];
  // Group transactions by date string
  const txByDate = new Map<string, number>();
  for (const tx of last30Txns) {
    const d = new Date(tx.date).toISOString().slice(0, 10);
    const delta = (["INCOME", "BORROW", "SETTLEMENT_RECEIVED"].includes(tx.type) ? 1 : -1) * Number(tx.amount);
    txByDate.set(d, (txByDate.get(d) ?? 0) + delta);
  }
  // Walk forward: start from (totalBalance - sum of all 30d deltas) then add each day
  const thirtyDayDelta = Array.from(txByDate.values()).reduce((s, v) => s + v, 0);
  let running = totalBalance - thirtyDayDelta;
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    running += txByDate.get(key) ?? 0;
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days.push({ label, balance: Math.round(running) });
  }

  // Resolve category names for pie chart
  const categoryIds = categoryExpenses.map((e) => e.categoryId).filter(Boolean) as string[];
  const categories = categoryIds.length
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true, color: true } })
    : [];
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const pieData = categoryExpenses.slice(0, 8).map((e, i) => {
    const cat = catMap.get(e.categoryId ?? "");
    return {
      name: cat?.name ?? "Other",
      value: Number(e._sum.amount ?? 0),
      color: cat?.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    };
  });

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      <DashboardHeader name={session.user.name ?? "User"} />

      <SummaryCards
        totalBalance={totalBalance}
        todaySpend={todaySpend}
        monthExpense={monthExpense}
        monthIncome={monthIncome}
        netFlow={monthIncome - monthExpense}
      />

      <DebtSummary othersOweMe={othersOweMe} iOweOthers={iOweOthers} />

      <BalanceChart data={days} />

      <ExpensePieChart data={pieData} />

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
