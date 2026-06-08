import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet, ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface Props {
  totalBalance: number;
  todaySpend: number;
  monthExpense: number;
  monthIncome: number;
  netFlow: number;
}

export function SummaryCards({ totalBalance, todaySpend, monthExpense, monthIncome, netFlow }: Props) {
  return (
    <div className="space-y-3">
      {/* Total Balance — hero card */}
      <Card className="bg-indigo-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 opacity-80" />
            <span className="text-sm opacity-80">Total Balance</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        </CardContent>
      </Card>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<TrendingDown className="w-4 h-4 text-red-500" />}
          label="Today's Spend"
          value={formatCurrency(todaySpend)}
          valueClass="text-red-600"
        />
        <StatCard
          icon={<ArrowUpDown className="w-4 h-4 text-indigo-500" />}
          label="Net Flow"
          value={formatCurrency(Math.abs(netFlow))}
          valueClass={netFlow >= 0 ? "text-emerald-600" : "text-red-600"}
          prefix={netFlow >= 0 ? "+" : "-"}
        />
        <StatCard
          icon={<TrendingDown className="w-4 h-4 text-red-500" />}
          label="Month Expense"
          value={formatCurrency(monthExpense)}
          valueClass="text-red-600"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
          label="Month Income"
          value={formatCurrency(monthIncome)}
          valueClass="text-emerald-600"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueClass,
  prefix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass: string;
  prefix?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          {icon}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className={`text-base font-semibold ${valueClass}`}>
          {prefix}{value}
        </p>
      </CardContent>
    </Card>
  );
}
