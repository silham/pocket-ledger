"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Slice {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
}

const FALLBACK_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#3b82f6", "#14b8a6", "#f97316", "#06b6d4",
];

export function ExpensePieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Expenses by Category — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-50">
          <p className="text-sm text-muted-foreground">No expenses this period</p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Expenses by Category — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="42%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => { const n = Number(v); return [`Rs. ${n.toLocaleString()} (${((n / total) * 100).toFixed(1)}%)`, ""]; }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
