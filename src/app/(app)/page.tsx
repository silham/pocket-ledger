import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DebtSummary } from "@/components/dashboard/DebtSummary";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [accounts, monthlyStats, todayExpenses, recentTransactions, debtStats] =
    await Promise.all([
      prisma.walletAccount.findMany({
        where: { userId, isArchived: false },
        orderBy: { createdAt: "asc" },
      }),

      prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId,
          date: { gte: startOfMonth },
          type: { in: ["EXPENSE", "INCOME"] },
        },
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
        where: {
          userId,
          type: { in: ["LEND", "BORROW", "SETTLEMENT_RECEIVED", "SETTLEMENT_PAID"] },
        },
        _sum: { amount: true },
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <DashboardHeader name={session.user.name ?? "User"} />

      <SummaryCards
        totalBalance={totalBalance}
        todaySpend={todaySpend}
        monthExpense={monthExpense}
        monthIncome={monthIncome}
        netFlow={monthIncome - monthExpense}
      />

      <DebtSummary othersOweMe={othersOweMe} iOweOthers={iOweOthers} />

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
